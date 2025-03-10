
import { isOnline } from './networkUtils';

/**
 * Operation to be queued for offline execution
 */
export interface QueuedOperation<T = any> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'custom';
  resource: string;
  payload: T;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: number;
}

/**
 * Offline queue configuration
 */
export interface OfflineQueueConfig {
  maxQueueSize?: number;
  retryInterval?: number;
  maxRetries?: number;
  storageKey?: string;
  autoSync?: boolean;
}

/**
 * Queue system for handling operations during offline periods
 */
export class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private maxQueueSize: number;
  private retryInterval: number;
  private maxRetries: number;
  private storageKey: string;
  private autoSync: boolean;
  private retryTimeoutId: number | null = null;
  private isSyncing: boolean = false;
  
  // Event callbacks
  private onSyncStart: (() => void) | null = null;
  private onSyncComplete: ((success: boolean) => void) | null = null;
  private onOperationProcessed: ((op: QueuedOperation, success: boolean) => void) | null = null;
  private onQueueChange: ((queue: QueuedOperation[]) => void) | null = null;
  private processOperation: ((op: QueuedOperation) => Promise<boolean>) | null = null;
  
  constructor(config: OfflineQueueConfig = {}) {
    this.maxQueueSize = config.maxQueueSize || 100;
    this.retryInterval = config.retryInterval || 30000; // 30 seconds
    this.maxRetries = config.maxRetries || 5;
    this.storageKey = config.storageKey || 'offline-operations-queue';
    this.autoSync = config.autoSync !== undefined ? config.autoSync : true;
    
    // Restore queue from storage
    this.restoreQueue();
    
    // Set up online/offline listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
    
    // If auto-sync is enabled and we're online, start syncing
    if (this.autoSync && isOnline()) {
      this.sync();
    }
  }
  
  /**
   * Enqueue an operation for execution
   */
  enqueue<T = any>(
    type: 'create' | 'update' | 'delete' | 'custom',
    resource: string,
    payload: T,
    options: {
      id?: string;
      priority?: number;
      maxRetries?: number;
    } = {}
  ): string {
    // Generate a unique ID if not provided
    const id = options.id || `${type}-${resource}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Create the operation
    const operation: QueuedOperation<T> = {
      id,
      type,
      resource,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries !== undefined ? options.maxRetries : this.maxRetries,
      priority: options.priority !== undefined ? options.priority : 1
    };
    
    // Add to queue
    this.queue.push(operation);
    
    // Sort by priority (higher number = higher priority)
    this.queue.sort((a, b) => b.priority - a.priority);
    
    // Enforce max queue size
    if (this.queue.length > this.maxQueueSize) {
      // Remove lowest priority items first
      this.queue.pop();
    }
    
    // Save queue to storage
    this.saveQueue();
    
    // Notify about queue change
    if (this.onQueueChange) {
      this.onQueueChange([...this.queue]);
    }
    
    // If auto-sync is enabled and we're online, start syncing
    if (this.autoSync && isOnline() && !this.isSyncing) {
      this.sync();
    }
    
    return id;
  }
  
  /**
   * Remove an operation from the queue by ID
   */
  remove(id: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(op => op.id !== id);
    
    // If something was removed
    if (initialLength !== this.queue.length) {
      this.saveQueue();
      
      // Notify about queue change
      if (this.onQueueChange) {
        this.onQueueChange([...this.queue]);
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Clear the entire queue
   */
  clear(): void {
    this.queue = [];
    this.saveQueue();
    
    // Notify about queue change
    if (this.onQueueChange) {
      this.onQueueChange([]);
    }
  }
  
  /**
   * Get the current queue
   */
  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }
  
  /**
   * Start manual sync process
   */
  async sync(): Promise<boolean> {
    // If already syncing or no operations to process, do nothing
    if (this.isSyncing || this.queue.length === 0 || !isOnline()) {
      return false;
    }
    
    this.isSyncing = true;
    
    // Notify sync start
    if (this.onSyncStart) {
      this.onSyncStart();
    }
    
    let success = true;
    
    // Process each operation in order (already sorted by priority)
    for (let i = 0; i < this.queue.length; i++) {
      const operation = this.queue[i];
      
      // Skip if already at max retries
      if (operation.retryCount >= operation.maxRetries) {
        continue;
      }
      
      try {
        let operationSuccess = false;
        
        // Process the operation
        if (this.processOperation) {
          operationSuccess = await this.processOperation(operation);
        } else {
          // Default implementation just marks it as successful
          // This should be overridden in real usage
          console.warn(`No processOperation handler defined for offline queue operation: ${operation.id}`);
          operationSuccess = true;
        }
        
        // If successful, remove from queue
        if (operationSuccess) {
          this.queue.splice(i, 1);
          i--; // Adjust index
          
          // Notify about operation processed
          if (this.onOperationProcessed) {
            this.onOperationProcessed(operation, true);
          }
        } else {
          // Increment retry count
          operation.retryCount++;
          success = false;
          
          // Notify about operation failure
          if (this.onOperationProcessed) {
            this.onOperationProcessed(operation, false);
          }
        }
      } catch (error) {
        // Increment retry count
        operation.retryCount++;
        success = false;
        
        // Notify about operation failure
        if (this.onOperationProcessed) {
          this.onOperationProcessed(operation, false);
        }
        
        console.error(`Error processing offline operation ${operation.id}:`, error);
      }
    }
    
    // Save updated queue
    this.saveQueue();
    
    // Notify queue change
    if (this.onQueueChange) {
      this.onQueueChange([...this.queue]);
    }
    
    this.isSyncing = false;
    
    // Notify sync complete
    if (this.onSyncComplete) {
      this.onSyncComplete(success);
    }
    
    // Schedule retry if needed and not empty
    if (!success && this.queue.length > 0) {
      this.scheduleRetry();
    }
    
    return success;
  }
  
  /**
   * Set handler for processing operations
   */
  setProcessHandler(handler: (op: QueuedOperation) => Promise<boolean>): void {
    this.processOperation = handler;
  }
  
  /**
   * Set event handlers
   */
  setEventHandlers(handlers: {
    onSyncStart?: () => void;
    onSyncComplete?: (success: boolean) => void;
    onOperationProcessed?: (op: QueuedOperation, success: boolean) => void;
    onQueueChange?: (queue: QueuedOperation[]) => void;
  }): void {
    if (handlers.onSyncStart) this.onSyncStart = handlers.onSyncStart;
    if (handlers.onSyncComplete) this.onSyncComplete = handlers.onSyncComplete;
    if (handlers.onOperationProcessed) this.onOperationProcessed = handlers.onOperationProcessed;
    if (handlers.onQueueChange) this.onQueueChange = handlers.onQueueChange;
  }
  
  /**
   * Clean up resources when no longer needed
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
  }
  
  /**
   * Handle device coming online
   */
  private handleOnline = () => {
    if (this.autoSync && !this.isSyncing && this.queue.length > 0) {
      this.sync();
    }
  };
  
  /**
   * Handle device going offline
   */
  private handleOffline = () => {
    // Cancel any pending retries
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
  };
  
  /**
   * Schedule retry for failed operations
   */
  private scheduleRetry(): void {
    // Cancel any existing retry
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    
    // Schedule new retry
    this.retryTimeoutId = window.setTimeout(() => {
      this.retryTimeoutId = null;
      
      // Only sync if online
      if (isOnline()) {
        this.sync();
      }
    }, this.retryInterval);
  }
  
  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to save offline queue to storage:', e);
    }
  }
  
  /**
   * Restore queue from localStorage
   */
  private restoreQueue(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      
      if (saved) {
        this.queue = JSON.parse(saved);
        
        // Re-sort by priority
        this.queue.sort((a, b) => b.priority - a.priority);
      }
    } catch (e) {
      console.error('Failed to restore offline queue from storage:', e);
      this.queue = [];
    }
  }
}

// Export singleton instance for app-wide use
export const offlineQueue = new OfflineQueue();

export default offlineQueue;
