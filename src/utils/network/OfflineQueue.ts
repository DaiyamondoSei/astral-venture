
import { isOnline, addConnectivityListener } from './networkUtils';

/**
 * Defines an operation that can be queued for offline execution
 */
export interface QueuedOperation<T = any> {
  id: string;                  // Unique identifier for the operation
  type: string;                // Type of operation (e.g., 'create', 'update', 'delete')
  resource: string;            // Resource being operated on (e.g., 'users', 'posts')
  data: any;                   // Data for the operation
  timestamp: number;           // When the operation was queued
  retryCount: number;          // Number of failed attempts
  priority: number;            // Priority (higher number = higher priority)
  expiration?: number;         // Optional expiration timestamp
  dependencies?: string[];     // IDs of operations this one depends on
  metadata?: Record<string, any>; // Additional metadata
}

/**
 * Configuration for the offline queue
 */
export interface OfflineQueueConfig {
  storageKey?: string;         // Local storage key for persistence
  autoSync?: boolean;          // Whether to automatically sync when online
  maxRetries?: number;         // Maximum retry attempts per operation
  conflictStrategy?: 'client-wins' | 'server-wins' | 'manual'; // How to handle conflicts
  processingOrder?: 'fifo' | 'lifo' | 'priority'; // Order to process operations
  batchSize?: number;          // Number of operations to process in one batch
  syncInterval?: number;       // Interval between sync attempts in ms
  onOperationComplete?: (op: QueuedOperation, result: any) => void;
  onOperationFailed?: (op: QueuedOperation, error: any) => void;
  onSync?: (successful: number, failed: number) => void;
}

/**
 * Handler function for processing queued operations
 */
export type OperationHandler<T = any> = (
  operation: QueuedOperation<T>
) => Promise<any>;

/**
 * Manages offline operations and syncing
 */
export class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private handlers: Map<string, OperationHandler> = new Map();
  private isSyncing: boolean = false;
  private syncTimer: number | null = null;
  private connectivityCleanup: (() => void) | null = null;
  private config: Required<OfflineQueueConfig>;

  constructor(config: OfflineQueueConfig = {}) {
    // Default configuration
    this.config = {
      storageKey: 'offlineQueue',
      autoSync: true,
      maxRetries: 5,
      conflictStrategy: 'client-wins',
      processingOrder: 'fifo',
      batchSize: 10,
      syncInterval: 60000, // 1 minute
      onOperationComplete: () => {},
      onOperationFailed: () => {},
      onSync: () => {},
      ...config
    };

    // Load queued operations from storage
    this.loadFromStorage();

    // Set up automatic sync if enabled
    if (this.config.autoSync) {
      this.setupAutoSync();
    }
  }

  /**
   * Queue an operation for execution
   */
  enqueue<T = any>(
    operation: Omit<QueuedOperation<T>, 'id' | 'timestamp' | 'retryCount'>
  ): string {
    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queuedOp: QueuedOperation<T> = {
      ...operation,
      id,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.queue.push(queuedOp);
    this.saveToStorage();

    // Try to sync immediately if online
    if (this.config.autoSync && isOnline() && !this.isSyncing) {
      this.sync();
    }

    return id;
  }

  /**
   * Register a handler for a specific operation type
   */
  registerHandler<T = any>(
    type: string,
    handler: OperationHandler<T>
  ): void {
    this.handlers.set(type, handler as OperationHandler);
  }

  /**
   * Remove a handler for a specific operation type
   */
  unregisterHandler(type: string): boolean {
    return this.handlers.delete(type);
  }

  /**
   * Manually trigger a sync operation
   */
  async sync(): Promise<{ successful: number; failed: number }> {
    if (this.isSyncing || this.queue.length === 0 || !isOnline()) {
      return { successful: 0, failed: 0 };
    }

    this.isSyncing = true;
    let successful = 0;
    let failed = 0;

    try {
      // Get operations to process in this batch
      let batch = this.getNextBatch();
      
      // Process all operations in batches
      while (batch.length > 0) {
        // Wait for all operations in batch to complete
        const results = await Promise.allSettled(
          batch.map(op => this.processOperation(op))
        );

        // Update counts
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            successful++;
          } else {
            failed++;
          }
        });

        // Check if we're still online before continuing
        if (!isOnline()) {
          break;
        }

        // Get next batch
        batch = this.getNextBatch();
      }

      // Notify about sync completion
      this.config.onSync(successful, failed);
      
      return { successful, failed };
    } finally {
      this.isSyncing = false;
      this.saveToStorage();
    }
  }

  /**
   * Check if the queue has pending operations
   */
  hasPendingOperations(): boolean {
    return this.queue.length > 0;
  }

  /**
   * Get the number of pending operations
   */
  get pendingCount(): number {
    return this.queue.length;
  }

  /**
   * Get all pending operations
   */
  getPendingOperations(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Clear all pending operations
   */
  clear(): void {
    this.queue = [];
    this.saveToStorage();
  }

  /**
   * Set up automatic sync
   */
  private setupAutoSync(): void {
    // Set up connectivity listener
    this.connectivityCleanup = addConnectivityListener(online => {
      if (online && this.hasPendingOperations()) {
        this.sync();
      }
    });

    // Set up periodic sync
    if (this.config.syncInterval > 0) {
      this.syncTimer = window.setInterval(() => {
        if (isOnline() && this.hasPendingOperations()) {
          this.sync();
        }
      }, this.config.syncInterval);
    }
  }

  /**
   * Get the next batch of operations to process
   */
  private getNextBatch(): QueuedOperation[] {
    // Sort operations based on processing order
    let sortedQueue: QueuedOperation[] = [];
    
    switch (this.config.processingOrder) {
      case 'lifo':
        sortedQueue = [...this.queue].sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'priority':
        sortedQueue = [...this.queue].sort((a, b) => b.priority - a.priority);
        break;
      case 'fifo':
      default:
        sortedQueue = [...this.queue].sort((a, b) => a.timestamp - b.timestamp);
        break;
    }

    // Filter out operations that depend on other operations still in the queue
    const filteredQueue = sortedQueue.filter(op => {
      if (!op.dependencies || op.dependencies.length === 0) {
        return true;
      }
      
      // Check if all dependencies have been processed
      return !op.dependencies.some(depId => 
        this.queue.some(queuedOp => queuedOp.id === depId)
      );
    });

    // Return the first batch
    return filteredQueue.slice(0, this.config.batchSize);
  }

  /**
   * Process a single operation
   */
  private async processOperation(operation: QueuedOperation): Promise<any> {
    // Check if operation has expired
    if (operation.expiration && Date.now() > operation.expiration) {
      this.removeOperation(operation.id);
      const error = new Error(`Operation expired: ${operation.id}`);
      this.config.onOperationFailed(operation, error);
      return Promise.reject(error);
    }

    // Check if handler exists
    const handler = this.handlers.get(operation.type);
    if (!handler) {
      const error = new Error(`No handler for operation type: ${operation.type}`);
      this.config.onOperationFailed(operation, error);
      return Promise.reject(error);
    }

    try {
      // Execute the operation
      const result = await handler(operation);
      
      // Remove from queue on success
      this.removeOperation(operation.id);
      
      // Notify about completion
      this.config.onOperationComplete(operation, result);
      
      return result;
    } catch (error) {
      // Increment retry count
      operation.retryCount++;
      
      // Remove if max retries exceeded
      if (operation.retryCount > this.config.maxRetries) {
        this.removeOperation(operation.id);
        this.config.onOperationFailed(operation, error);
      }
      
      return Promise.reject(error);
    }
  }

  /**
   * Remove an operation from the queue
   */
  private removeOperation(id: string): void {
    this.queue = this.queue.filter(op => op.id !== id);
  }

  /**
   * Save queue to local storage
   */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem(
        this.config.storageKey,
        JSON.stringify(this.queue)
      );
    } catch (error) {
      console.error('Failed to save offline queue to storage:', error);
    }
  }

  /**
   * Load queue from local storage
   */
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const data = localStorage.getItem(this.config.storageKey);
      if (data) {
        this.queue = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load offline queue from storage:', error);
      this.queue = [];
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.syncTimer !== null) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    
    if (this.connectivityCleanup) {
      this.connectivityCleanup();
      this.connectivityCleanup = null;
    }
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueue();
