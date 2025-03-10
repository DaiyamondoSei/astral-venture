/**
 * Network operation utilities for improved reliability
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  shouldRetry?: (error: Error, attemptCount: number) => boolean;
  onRetry?: (error: Error, attemptCount: number) => void;
}

export interface BatchOptions {
  maxBatchSize?: number;
  batchDelayMs?: number;
  onBatchComplete?: (results: unknown[]) => void;
  onBatchError?: (errors: Error[]) => void;
}

/**
 * Retry a function multiple times if it fails
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    shouldRetry = () => true,
    onRetry
  } = options;
  
  let attemptCount = 0;
  
  const attempt = async (): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      attemptCount++;
      
      if (attemptCount <= maxRetries && shouldRetry(error as Error, attemptCount)) {
        // Calculate delay with exponential backoff if enabled
        const delay = exponentialBackoff 
          ? retryDelay * Math.pow(2, attemptCount - 1)
          : retryDelay;
          
        // Call onRetry handler if provided
        if (onRetry) {
          onRetry(error as Error, attemptCount);
        }
        
        // Wait for the delay and retry
        await new Promise(resolve => setTimeout(resolve, delay));
        return attempt();
      }
      
      // If we've reached max retries or shouldn't retry, rethrow
      throw error;
    }
  };
  
  return attempt();
}

/**
 * Process operations in batches to avoid overwhelming the server
 */
export function batchProcessor<T, R>(
  processFn: (items: T[]) => Promise<R[]>,
  options: BatchOptions = {}
): (item: T) => Promise<R> {
  const {
    maxBatchSize = 10,
    batchDelayMs = 50,
    onBatchComplete,
    onBatchError
  } = options;
  
  let batch: T[] = [];
  let batchPromises: Array<{ resolve: (value: R) => void; reject: (error: Error) => void }> = [];
  let batchTimeoutId: number | null = null;
  
  const processBatch = async () => {
    const currentBatch = [...batch];
    const currentPromises = [...batchPromises];
    
    // Clear the batch and promises for the next round
    batch = [];
    batchPromises = [];
    batchTimeoutId = null;
    
    if (currentBatch.length === 0) return;
    
    try {
      // Process the batch
      const results = await processFn(currentBatch);
      
      // Resolve promises with corresponding results
      results.forEach((result, index) => {
        if (currentPromises[index]) {
          currentPromises[index].resolve(result);
        }
      });
      
      if (onBatchComplete) {
        onBatchComplete(results);
      }
    } catch (error) {
      // Reject all promises in the batch
      currentPromises.forEach(promise => {
        promise.reject(error as Error);
      });
      
      if (onBatchError) {
        onBatchError([error as Error]);
      }
    }
  };
  
  return (item: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      // Add item to batch
      batch.push(item);
      batchPromises.push({ resolve, reject });
      
      // If we've reached max batch size, process immediately
      if (batch.length >= maxBatchSize) {
        if (batchTimeoutId !== null) {
          clearTimeout(batchTimeoutId);
        }
        processBatch();
      } else if (batchTimeoutId === null) {
        // Otherwise, schedule processing
        batchTimeoutId = window.setTimeout(processBatch, batchDelayMs);
      }
    });
  };
}

/**
 * Queue network operations to execute sequentially
 */
export function createOperationQueue() {
  const queue: Array<() => Promise<unknown>> = [];
  let isProcessing = false;
  
  const processQueue = async () => {
    if (isProcessing || queue.length === 0) return;
    
    isProcessing = true;
    
    const operation = queue.shift();
    
    try {
      if (operation) {
        await operation();
      }
    } catch (error) {
      console.error('Operation in queue failed:', error);
    } finally {
      isProcessing = false;
      processQueue();
    }
  };
  
  return {
    /**
     * Add an operation to the queue
     */
    add<T>(operation: () => Promise<T>): Promise<T> {
      return new Promise((resolve, reject) => {
        queue.push(async () => {
          try {
            const result = await operation();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        
        processQueue();
      });
    },
    
    /**
     * Get the current queue length
     */
    get length(): number {
      return queue.length;
    },
    
    /**
     * Check if the queue is currently processing
     */
    get isProcessing(): boolean {
      return isProcessing;
    },
    
    /**
     * Clear the queue
     */
    clear(): void {
      queue.length = 0;
    }
  };
}
