
import { ApiError, ErrorCategory } from './ApiError';
import { isOnline, registerConnectivityListeners } from './networkUtils';

/**
 * OfflineQueue manages API requests when offline
 * and processes them when online connectivity is restored
 */
export class OfflineQueue {
  private queue: QueuedRequest[];
  private processing: boolean;
  private maxRetries: number;
  private autoRetryOnReconnect: boolean;
  private persistQueue: boolean;
  private listeners: Set<(status: OfflineQueueStatus) => void>;
  private cleanupListener: (() => void) | null;
  private storageKey: string;
  
  constructor(options: OfflineQueueOptions = {}) {
    this.queue = [];
    this.processing = false;
    this.maxRetries = options.maxRetries || 3;
    this.autoRetryOnReconnect = options.autoRetryOnReconnect !== false;
    this.persistQueue = options.persistQueue !== false;
    this.listeners = new Set();
    this.cleanupListener = null;
    this.storageKey = options.storageKey || 'offline_request_queue';
    
    // Load queue from storage
    if (this.persistQueue) {
      this.loadQueue();
    }
    
    // Set up online/offline listeners
    if (this.autoRetryOnReconnect) {
      this.setupConnectivityListeners();
    }
  }
  
  /**
   * Add a request to the queue
   */
  async addToQueue<T>(request: QueueableRequest<T>): Promise<T> {
    // If online and queue is empty, try immediately
    if (isOnline() && this.queue.length === 0) {
      try {
        return await request.execute();
      } catch (error) {
        // If it's not a network error, rethrow
        if (!(error instanceof ApiError) || error.category !== ErrorCategory.NETWORK) {
          throw error;
        }
        
        console.info('Network request failed, queuing for later', request);
      }
    }
    
    // Create a deferred promise
    let resolve: (value: T) => void;
    let reject: (reason: unknown) => void;
    
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    // Create queue item
    const queueItem: QueuedRequest = {
      id: this.generateId(),
      request,
      resolve,
      reject,
      retries: 0,
      added: Date.now(),
      lastAttempt: null
    };
    
    // Add to queue
    this.queue.push(queueItem);
    
    // Save queue
    if (this.persistQueue) {
      this.saveQueue();
    }
    
    // Notify listeners
    this.notifyListeners();
    
    return promise;
  }
  
  /**
   * Process all queued requests
   */
  async processQueue(): Promise<void> {
    // If already processing or offline, skip
    if (this.processing || !isOnline()) {
      return;
    }
    
    this.processing = true;
    this.notifyListeners();
    
    try {
      // Process each item in the queue
      while (this.queue.length > 0 && isOnline()) {
        const item = this.queue[0];
        
        try {
          const result = await item.request.execute();
          item.resolve(result);
          
          // Remove from queue
          this.queue.shift();
        } catch (error) {
          // Handle failure
          item.lastAttempt = Date.now();
          
          if (item.retries >= this.maxRetries) {
            // Max retries reached, reject and remove
            item.reject(error);
            this.queue.shift();
          } else if (
            error instanceof ApiError && 
            error.category === ErrorCategory.NETWORK
          ) {
            // Network error - retry later
            item.retries++;
            
            // Move to the end of the queue
            this.queue.push(this.queue.shift()!);
          } else {
            // Non-network error - reject and remove
            item.reject(error);
            this.queue.shift();
          }
        }
        
        // Update persisted queue
        if (this.persistQueue) {
          this.saveQueue();
        }
        
        // Notify listeners after each processed item
        this.notifyListeners();
      }
    } finally {
      this.processing = false;
      this.notifyListeners();
    }
  }
  
  /**
   * Clear the entire queue
   */
  clearQueue(): void {
    // Reject all pending requests
    this.queue.forEach(item => {
      item.reject(new Error('Queue was cleared'));
    });
    
    this.queue = [];
    
    if (this.persistQueue) {
      this.saveQueue();
    }
    
    this.notifyListeners();
  }
  
  /**
   * Get the current queue status
   */
  getStatus(): OfflineQueueStatus {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      isOnline: isOnline()
    };
  }
  
  /**
   * Subscribe to queue status changes
   */
  subscribe(listener: (status: OfflineQueueStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current status
    listener(this.getStatus());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Set up online/offline event listeners
   */
  private setupConnectivityListeners(): void {
    const handleOnline = () => {
      console.info('Online status detected, processing queue...');
      this.processQueue();
    };
    
    const handleOffline = () => {
      console.info('Offline status detected');
      this.notifyListeners();
    };
    
    this.cleanupListener = registerConnectivityListeners(handleOnline, handleOffline);
  }
  
  /**
   * Notify all listeners of status changes
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in queue status listener:', error);
      }
    });
  }
  
  /**
   * Generate a unique ID for queue items
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      // Serialize queue (without promises, which can't be serialized)
      const serializedQueue = this.queue.map(item => ({
        id: item.id,
        request: item.request.serialize(),
        retries: item.retries,
        added: item.added,
        lastAttempt: item.lastAttempt
      }));
      
      localStorage.setItem(this.storageKey, JSON.stringify(serializedQueue));
    } catch (error) {
      console.warn('Failed to save offline queue:', error);
    }
  }
  
  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      
      if (!saved) return;
      
      const serializedQueue = JSON.parse(saved);
      
      // Recreate queue items from serialized data
      this.queue = serializedQueue.map((item: any) => {
        // Create a deferred promise for each item
        let resolve: (value: any) => void;
        let reject: (reason: unknown) => void;
        
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        
        return {
          id: item.id,
          request: this.deserializeRequest(item.request),
          resolve,
          reject,
          retries: item.retries,
          added: item.added,
          lastAttempt: item.lastAttempt
        };
      });
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
      // Reset queue if loading fails
      this.queue = [];
    }
  }
  
  /**
   * Deserialize a request (implementation depends on serialization format)
   */
  private deserializeRequest(serialized: any): QueueableRequest<any> {
    // This is a stub - actual implementation would depend on
    // how requests are serialized and what QueueableRequest looks like
    return {
      execute: () => Promise.reject(new Error('Deserialized request cannot be executed')),
      serialize: () => serialized
    };
  }
  
  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.cleanupListener) {
      this.cleanupListener();
      this.cleanupListener = null;
    }
    
    this.listeners.clear();
  }
}

/**
 * Queued request with metadata
 */
interface QueuedRequest {
  id: string;
  request: QueueableRequest<any>;
  resolve: (value: any) => void;
  reject: (reason: unknown) => void;
  retries: number;
  added: number;
  lastAttempt: number | null;
}

/**
 * Queue status information
 */
export interface OfflineQueueStatus {
  queueLength: number;
  processing: boolean;
  isOnline: boolean;
}

/**
 * Options for creating an offline queue
 */
export interface OfflineQueueOptions {
  maxRetries?: number;
  autoRetryOnReconnect?: boolean;
  persistQueue?: boolean;
  storageKey?: string;
}

/**
 * Interface for queueable requests
 */
export interface QueueableRequest<T> {
  execute: () => Promise<T>;
  serialize: () => any;
}

// Export singleton instance
export const offlineQueue = new OfflineQueue();

export default offlineQueue;
