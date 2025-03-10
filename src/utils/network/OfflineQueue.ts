
import { enhancedFetch, EnhancedFetchOptions } from './networkUtils';
import { toast } from 'sonner';

// Offline request data structure
interface OfflineRequest {
  id: string;
  url: string;
  options: EnhancedFetchOptions;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  priority: 'high' | 'normal' | 'low';
  operation: string;
  entityId?: string;
  entityType?: string;
  data?: any;
}

// Queue options
interface OfflineQueueOptions {
  maxQueueSize: number;
  persistToStorage: boolean;
  storageKey: string;
  processBatchSize: number;
  automaticProcessing: boolean;
  processingInterval: number;
  debug: boolean;
}

/**
 * Manages queuing and processing of offline API requests
 */
export class OfflineQueue {
  private queue: OfflineRequest[] = [];
  private isProcessing = false;
  private processingIntervalId?: NodeJS.Timeout;
  private options: OfflineQueueOptions;
  
  constructor(options?: Partial<OfflineQueueOptions>) {
    // Default options
    this.options = {
      maxQueueSize: 100,
      persistToStorage: true,
      storageKey: 'offline_request_queue',
      processBatchSize: 5,
      automaticProcessing: true,
      processingInterval: 30000, // 30 seconds
      debug: false,
      ...options
    };
    
    // Load existing queue from storage
    this.loadFromStorage();
    
    // Set up automatic processing if enabled
    if (this.options.automaticProcessing) {
      this.startAutomaticProcessing();
    }
    
    // Add online listener to process queue when coming back online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (navigator.onLine && this.queue.length > 0) {
          this.processQueue();
        }
      });
    }
  }
  
  /**
   * Add a request to the offline queue
   */
  enqueue(
    url: string,
    options: EnhancedFetchOptions,
    metadata: {
      operation: string;
      entityType?: string;
      entityId?: string;
      priority?: 'high' | 'normal' | 'low';
      maxAttempts?: number;
      data?: any;
    }
  ): string {
    // Generate unique ID for the request
    const id = crypto.randomUUID();
    
    // Create request object
    const request: OfflineRequest = {
      id,
      url,
      options: {
        ...options,
        useOfflineQueue: false // Prevent infinite loops
      },
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: metadata.maxAttempts || 3,
      priority: metadata.priority || 'normal',
      operation: metadata.operation,
      entityId: metadata.entityId,
      entityType: metadata.entityType,
      data: metadata.data
    };
    
    // Check queue size limit
    if (this.queue.length >= this.options.maxQueueSize) {
      // Remove oldest low priority item
      const lowestPriorityIndex = this.queue.findIndex(r => r.priority === 'low');
      if (lowestPriorityIndex !== -1) {
        this.queue.splice(lowestPriorityIndex, 1);
      } else {
        // Remove oldest normal priority if no low priority exists
        const normalPriorityIndex = this.queue.findIndex(r => r.priority === 'normal');
        if (normalPriorityIndex !== -1) {
          this.queue.splice(normalPriorityIndex, 1);
        } else {
          // Remove oldest item if all are high priority
          this.queue.shift();
        }
      }
      
      toast.info("Offline queue limit reached. Oldest request was removed.");
    }
    
    // Add to queue
    this.queue.push(request);
    
    // Sort queue by priority
    this.sortQueue();
    
    // Save to storage
    this.saveToStorage();
    
    if (this.options.debug) {
      console.debug(`[OfflineQueue] Added request: ${request.operation}, ID: ${id}`);
    }
    
    // Show notification to user
    toast.info(`${request.operation} will be processed when you're back online.`);
    
    return id;
  }
  
  /**
   * Remove a request from the queue
   */
  remove(id: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(request => request.id !== id);
    
    // Save if anything changed
    if (initialLength !== this.queue.length) {
      this.saveToStorage();
      
      if (this.options.debug) {
        console.debug(`[OfflineQueue] Removed request: ${id}`);
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all requests in the queue
   */
  getAll(): OfflineRequest[] {
    return [...this.queue];
  }
  
  /**
   * Get requests by entity type
   */
  getByEntityType(entityType: string): OfflineRequest[] {
    return this.queue.filter(request => request.entityType === entityType);
  }
  
  /**
   * Get requests by entity ID
   */
  getByEntityId(entityId: string): OfflineRequest[] {
    return this.queue.filter(request => request.entityId === entityId);
  }
  
  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }
  
  /**
   * Clear the entire queue
   */
  clear(): void {
    this.queue = [];
    this.saveToStorage();
    
    if (this.options.debug) {
      console.debug('[OfflineQueue] Queue cleared');
    }
  }
  
  /**
   * Process all queued requests
   */
  async processQueue(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
    remaining: number;
  }> {
    // Don't process if offline or already processing
    if (!navigator.onLine || this.isProcessing || this.queue.length === 0) {
      return {
        processed: 0,
        succeeded: 0,
        failed: 0,
        remaining: this.queue.length
      };
    }
    
    this.isProcessing = true;
    
    // Get batch to process
    const batchSize = Math.min(this.options.processBatchSize, this.queue.length);
    const batch = this.queue.slice(0, batchSize);
    
    if (this.options.debug) {
      console.debug(`[OfflineQueue] Processing batch of ${batchSize} requests`);
    }
    
    // Show toast for user
    const toastId = batch.length > 0 
      ? toast.loading(`Processing ${batch.length} offline ${batch.length === 1 ? 'request' : 'requests'}...`)
      : undefined;
    
    let succeeded = 0;
    let failed = 0;
    
    // Process each request
    for (const request of batch) {
      if (!navigator.onLine) {
        // Stop processing if we go offline
        break;
      }
      
      try {
        // Increment attempt counter
        request.attempts++;
        
        // Process request
        await enhancedFetch(request.url, {
          ...request.options,
          skipErrorToast: true
        });
        
        // Success - remove from queue
        this.remove(request.id);
        succeeded++;
        
        if (this.options.debug) {
          console.debug(`[OfflineQueue] Successfully processed: ${request.operation}, ID: ${request.id}`);
        }
      } catch (error) {
        // Failed - handle retry logic
        if (request.attempts >= request.maxAttempts) {
          // Max attempts reached - remove from queue
          this.remove(request.id);
          failed++;
          
          if (this.options.debug) {
            console.error(`[OfflineQueue] Failed after ${request.attempts} attempts: ${request.operation}, ID: ${request.id}`, error);
          }
        } else {
          // Update queue entry with increased attempt count
          this.saveToStorage();
          failed++;
          
          if (this.options.debug) {
            console.warn(`[OfflineQueue] Failed attempt ${request.attempts}/${request.maxAttempts}: ${request.operation}, ID: ${request.id}`, error);
          }
        }
      }
    }
    
    // Update toast
    if (toastId) {
      if (succeeded > 0 && failed === 0) {
        toast.success(`Successfully processed ${succeeded} offline ${succeeded === 1 ? 'request' : 'requests'}`, { id: toastId });
      } else if (succeeded > 0 && failed > 0) {
        toast.info(`Processed ${succeeded} request(s), ${failed} failed`, { id: toastId });
      } else if (succeeded === 0 && failed > 0) {
        toast.error(`Failed to process ${failed} offline ${failed === 1 ? 'request' : 'requests'}`, { id: toastId });
      }
    }
    
    this.isProcessing = false;
    
    return {
      processed: succeeded + failed,
      succeeded,
      failed,
      remaining: this.queue.length
    };
  }
  
  /**
   * Start automatic processing of the queue
   */
  startAutomaticProcessing(): void {
    if (this.processingIntervalId) {
      clearInterval(this.processingIntervalId);
    }
    
    this.processingIntervalId = setInterval(() => {
      if (navigator.onLine && this.queue.length > 0 && !this.isProcessing) {
        this.processQueue();
      }
    }, this.options.processingInterval);
    
    if (this.options.debug) {
      console.debug(`[OfflineQueue] Started automatic processing (interval: ${this.options.processingInterval}ms)`);
    }
  }
  
  /**
   * Stop automatic processing of the queue
   */
  stopAutomaticProcessing(): void {
    if (this.processingIntervalId) {
      clearInterval(this.processingIntervalId);
      this.processingIntervalId = undefined;
      
      if (this.options.debug) {
        console.debug('[OfflineQueue] Stopped automatic processing');
      }
    }
  }
  
  /**
   * Sort queue by priority (high -> normal -> low)
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // First by priority
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // Then by timestamp (oldest first)
      return a.timestamp - b.timestamp;
    });
  }
  
  /**
   * Save queue to localStorage
   */
  private saveToStorage(): void {
    if (!this.options.persistToStorage) return;
    
    try {
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.queue));
    } catch (e) {
      console.error('[OfflineQueue] Error saving queue to storage:', e);
    }
  }
  
  /**
   * Load queue from localStorage
   */
  private loadFromStorage(): void {
    if (!this.options.persistToStorage) return;
    
    try {
      const data = localStorage.getItem(this.options.storageKey);
      
      if (data) {
        this.queue = JSON.parse(data);
        
        if (this.options.debug) {
          console.debug(`[OfflineQueue] Loaded ${this.queue.length} requests from storage`);
        }
      }
    } catch (e) {
      console.error('[OfflineQueue] Error loading queue from storage:', e);
    }
  }
}

// Create default instance
const offlineQueue = new OfflineQueue();

export default offlineQueue;
