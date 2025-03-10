
/**
 * Offline request queue for deferred API operations
 * Allows operations to be queued when offline and processed when online
 */

import { withRetry } from '../networkUtils';

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: number;
  groupId?: string;
  metadata?: Record<string, unknown>;
}

export interface RequestQueueOptions {
  maxRetries?: number;
  retryDelay?: number;
  processingInterval?: number;
  persistQueue?: boolean;
  debug?: boolean;
  onOnlineStatusChange?: (isOnline: boolean) => void;
  onQueueUpdate?: (queue: QueuedRequest[]) => void;
  onRequestComplete?: (request: QueuedRequest, response: Response) => void;
  onRequestError?: (request: QueuedRequest, error: Error) => void;
}

export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private isOnline = navigator.onLine;
  private options: Required<RequestQueueOptions>;
  private processingIntervalId: number | null = null;
  
  constructor(options: RequestQueueOptions = {}) {
    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      processingInterval: 5000,
      persistQueue: true,
      debug: false,
      onOnlineStatusChange: () => {},
      onQueueUpdate: () => {},
      onRequestComplete: () => {},
      onRequestError: () => {},
      ...options
    };
    
    // Load persisted queue if enabled
    if (this.options.persistQueue) {
      this.loadQueue();
    }
    
    // Set up online/offline event listeners
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Start processing if online
    if (this.isOnline) {
      this.startProcessing();
    }
    
    if (this.options.debug) {
      console.log(`RequestQueue: Initialized with ${this.queue.length} requests`);
    }
  }
  
  /**
   * Add a request to the queue
   */
  add(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): string {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    const queuedRequest: QueuedRequest = {
      id,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: request.maxRetries || this.options.maxRetries,
      ...request
    };
    
    this.queue.push(queuedRequest);
    
    // Sort queue by priority (higher first) and timestamp (older first)
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });
    
    if (this.options.debug) {
      console.log(`RequestQueue: Added request ${id}`, queuedRequest);
    }
    
    // Persist queue if enabled
    if (this.options.persistQueue) {
      this.saveQueue();
    }
    
    // Notify listeners
    this.options.onQueueUpdate(this.queue);
    
    // Start processing if online
    if (this.isOnline && !this.isProcessing) {
      this.startProcessing();
    }
    
    return id;
  }
  
  /**
   * Remove a request from the queue
   */
  remove(id: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(request => request.id !== id);
    
    const removed = initialLength > this.queue.length;
    
    if (removed) {
      if (this.options.debug) {
        console.log(`RequestQueue: Removed request ${id}`);
      }
      
      // Persist queue if enabled
      if (this.options.persistQueue) {
        this.saveQueue();
      }
      
      // Notify listeners
      this.options.onQueueUpdate(this.queue);
    }
    
    return removed;
  }
  
  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    this.isOnline = true;
    
    if (this.options.debug) {
      console.log('RequestQueue: Online status changed to online');
    }
    
    // Notify listeners
    this.options.onOnlineStatusChange(true);
    
    // Start processing
    this.startProcessing();
  };
  
  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    this.isOnline = false;
    
    if (this.options.debug) {
      console.log('RequestQueue: Online status changed to offline');
    }
    
    // Notify listeners
    this.options.onOnlineStatusChange(false);
    
    // Stop processing
    this.stopProcessing();
  };
  
  /**
   * Start processing the queue
   */
  private startProcessing(): void {
    if (this.isProcessing || !this.isOnline || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    if (this.options.debug) {
      console.log(`RequestQueue: Started processing ${this.queue.length} requests`);
    }
    
    // Process immediately
    this.processNextRequest();
    
    // Set up interval for continuous processing
    this.processingIntervalId = window.setInterval(() => {
      if (this.queue.length > 0 && this.isOnline && !this.isProcessing) {
        this.processNextRequest();
      } else if (this.queue.length === 0) {
        this.stopProcessing();
      }
    }, this.options.processingInterval);
  }
  
  /**
   * Stop processing the queue
   */
  private stopProcessing(): void {
    if (this.processingIntervalId !== null) {
      clearInterval(this.processingIntervalId);
      this.processingIntervalId = null;
    }
    
    this.isProcessing = false;
    
    if (this.options.debug) {
      console.log('RequestQueue: Stopped processing');
    }
  }
  
  /**
   * Process the next request in the queue
   */
  private async processNextRequest(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    
    const request = this.queue[0];
    
    if (this.options.debug) {
      console.log(`RequestQueue: Processing request ${request.id}`);
    }
    
    try {
      const response = await withRetry(
        () => this.executeRequest(request),
        {
          maxRetries: request.maxRetries,
          retryDelay: this.options.retryDelay,
          exponentialBackoff: true,
          onRetry: (error, attemptCount) => {
            request.retryCount = attemptCount;
            
            if (this.options.debug) {
              console.log(`RequestQueue: Retry ${attemptCount} for request ${request.id}`, error);
            }
            
            // Persist queue with updated retry count
            if (this.options.persistQueue) {
              this.saveQueue();
            }
          }
        }
      );
      
      // If successful, remove from queue
      this.remove(request.id);
      
      // Notify listeners
      this.options.onRequestComplete(request, response);
      
      if (this.options.debug) {
        console.log(`RequestQueue: Successfully processed request ${request.id}`);
      }
    } catch (error) {
      // If max retries reached, remove from queue
      if (request.retryCount >= request.maxRetries) {
        this.remove(request.id);
        
        if (this.options.debug) {
          console.error(`RequestQueue: Max retries reached for request ${request.id}`, error);
        }
        
        // Notify listeners
        this.options.onRequestError(request, error as Error);
      } else {
        // Move to end of queue for retry later
        this.queue.shift();
        request.retryCount++;
        this.queue.push(request);
        
        if (this.options.debug) {
          console.warn(`RequestQueue: Failed to process request ${request.id}, will retry later`, error);
        }
        
        // Persist queue with updated retry count
        if (this.options.persistQueue) {
          this.saveQueue();
        }
        
        // Notify listeners
        this.options.onQueueUpdate(this.queue);
      }
    } finally {
      this.isProcessing = false;
      
      // Process next request if available
      if (this.queue.length > 0 && this.isOnline) {
        setTimeout(() => this.processNextRequest(), 50);
      }
    }
  }
  
  /**
   * Execute a request
   */
  private async executeRequest(request: QueuedRequest): Promise<Response> {
    const { url, method, body, headers = {} } = request;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: 'include'
    };
    
    if (body && method !== 'GET' && method !== 'HEAD') {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    return response;
  }
  
  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem('requestQueue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save request queue to localStorage:', error);
    }
  }
  
  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const savedQueue = localStorage.getItem('requestQueue');
      
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
        
        if (this.options.debug) {
          console.log(`RequestQueue: Loaded ${this.queue.length} requests from localStorage`);
        }
        
        // Notify listeners
        this.options.onQueueUpdate(this.queue);
      }
    } catch (error) {
      console.error('Failed to load request queue from localStorage:', error);
    }
  }
  
  /**
   * Get current queue
   */
  getQueue(): readonly QueuedRequest[] {
    return [...this.queue];
  }
  
  /**
   * Get queue length
   */
  get length(): number {
    return this.queue.length;
  }
  
  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
    
    if (this.options.persistQueue) {
      localStorage.removeItem('requestQueue');
    }
    
    if (this.options.debug) {
      console.log('RequestQueue: Cleared queue');
    }
    
    // Notify listeners
    this.options.onQueueUpdate(this.queue);
  }
  
  /**
   * Destroy the queue instance
   */
  destroy(): void {
    this.stopProcessing();
    
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if (this.options.debug) {
      console.log('RequestQueue: Destroyed');
    }
  }
}

// Export singleton instance
export const requestQueue = new RequestQueue();
