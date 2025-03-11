
/**
 * Async Operation Utilities
 * 
 * Provides robust patterns for handling asynchronous operations,
 * including cancellation, timeout handling, and retry logic.
 */

/**
 * Options for async operations
 */
export interface AsyncOperationOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to abort on timeout */
  abortOnTimeout?: boolean;
  /** Abort signal to use for cancellation */
  signal?: AbortSignal;
  /** Number of retry attempts */
  retryCount?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** Whether to retry on specific error */
  retryPredicate?: (error: any) => boolean;
  /** Callback for retry attempts */
  onRetry?: (attempt: number, error: any) => void;
  /** Callback for operation completion */
  onComplete?: (result: any) => void;
  /** Callback for operation failure */
  onError?: (error: any) => void;
}

/**
 * Create a timeout promise that rejects after specified milliseconds
 * 
 * @param ms Timeout in milliseconds
 * @param controller Optional AbortController to abort the timeout
 * @returns Promise that rejects after timeout
 */
export function createTimeout(ms: number, controller?: AbortController): Promise<never> {
  return new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
    
    // Clean up timeout if AbortController is aborted
    if (controller) {
      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
      });
    }
  });
}

/**
 * Wraps an async operation with timeout, retry, and cancellation support
 * 
 * @param operation Async operation to execute
 * @param options Options for execution
 * @returns Promise with operation result
 */
export async function withAsyncOperation<T>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
): Promise<T> {
  const {
    timeout = 30000,
    abortOnTimeout = true,
    signal,
    retryCount = 0,
    retryDelay = 1000,
    retryPredicate = () => true,
    onRetry,
    onComplete,
    onError
  } = options;
  
  // Create an AbortController if none provided
  const controller = new AbortController();
  
  // Link external abort signal if provided
  if (signal) {
    signal.addEventListener('abort', () => {
      controller.abort(signal.reason);
    });
  }
  
  let attempt = 0;
  let lastError: any;
  
  while (attempt <= retryCount) {
    try {
      // Set up timeout if specified
      const operationWithTimeout = timeout > 0
        ? Promise.race([
            operation(),
            createTimeout(timeout, controller)
          ])
        : operation();
      
      // Execute operation with timeout
      const result = await operationWithTimeout;
      
      // Call completion callback if provided
      if (onComplete) {
        try {
          onComplete(result);
        } catch (callbackError) {
          console.error('Error in onComplete callback:', callbackError);
        }
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if operation should be retried
      const shouldRetry = attempt < retryCount && retryPredicate(error);
      
      // Call retry callback if provided
      if (shouldRetry && onRetry) {
        try {
          onRetry(attempt + 1, error);
        } catch (callbackError) {
          console.error('Error in onRetry callback:', callbackError);
        }
      }
      
      // If error is a timeout and abortOnTimeout is true, abort the controller
      if (
        error instanceof Error && 
        error.message.includes('timed out') && 
        abortOnTimeout
      ) {
        controller.abort(error);
      }
      
      // Check if operation was aborted
      if (
        error instanceof DOMException && 
        error.name === 'AbortError'
      ) {
        // Call error callback if provided
        if (onError) {
          try {
            onError(error);
          } catch (callbackError) {
            console.error('Error in onError callback:', callbackError);
          }
        }
        
        throw error;
      }
      
      // If retries are exhausted, call error callback and throw
      if (!shouldRetry) {
        // Call error callback if provided
        if (onError) {
          try {
            onError(error);
          } catch (callbackError) {
            console.error('Error in onError callback:', callbackError);
          }
        }
        
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      attempt++;
    }
  }
  
  // This should never be reached due to the checks above,
  // but TypeScript requires a return statement
  throw lastError;
}

/**
 * Creates a debounced version of an async function
 * 
 * @param fn Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;
  
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // If there's already a pending promise for the same operation, return it
    if (pendingPromise) {
      return pendingPromise;
    }
    
    // Create a new promise
    const promise = new Promise<ReturnType<T>>((resolve, reject) => {
      // Clear any existing timeout
      if (timeout) {
        clearTimeout(timeout);
      }
      
      // Set a new timeout
      timeout = setTimeout(async () => {
        timeout = null;
        
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          pendingPromise = null;
        }
      }, wait);
    });
    
    pendingPromise = promise;
    return promise;
  };
}

/**
 * Creates a throttled version of an async function
 * 
 * @param fn Function to throttle
 * @param limit Limit in milliseconds
 * @returns Throttled function
 */
export function throttleAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let lastRun = 0;
  let pendingPromise: Promise<ReturnType<T>> | null = null;
  let queuedArgs: Parameters<T> | null = null;
  let queuedResolve: ((value: ReturnType<T>) => void) | null = null;
  let queuedReject: ((reason: any) => void) | null = null;
  
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now();
    
    // If function was called recently and there's a pending promise, queue the call
    if (now - lastRun < limit && pendingPromise) {
      return new Promise<ReturnType<T>>((resolve, reject) => {
        queuedArgs = args;
        queuedResolve = resolve;
        queuedReject = reject;
      });
    }
    
    // Update last run time
    lastRun = now;
    
    // Create a new promise for this invocation
    const promise = fn(...args)
      .then(result => {
        // Check if there's a queued call
        if (queuedArgs && queuedResolve) {
          const nextArgs = queuedArgs;
          const nextResolve = queuedResolve;
          const nextReject = queuedReject;
          
          // Clear queued call
          queuedArgs = null;
          queuedResolve = null;
          queuedReject = null;
          
          // Schedule next call
          setTimeout(() => {
            fn(...nextArgs)
              .then(nextResolve)
              .catch(nextReject);
          }, limit - (Date.now() - lastRun));
        }
        
        pendingPromise = null;
        return result;
      })
      .catch(error => {
        pendingPromise = null;
        throw error;
      });
    
    pendingPromise = promise;
    return promise;
  };
}

/**
 * Implements the concurrency limited queue pattern for async operations
 * 
 * @param concurrency Maximum number of concurrent operations
 * @returns Queue controller object
 */
export function createAsyncQueue(concurrency: number = 3) {
  let running = 0;
  const queue: Array<() => void> = [];
  
  /**
   * Adds an operation to the queue
   * 
   * @param operation Async operation to enqueue
   * @returns Promise that resolves when operation completes
   */
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        running++;
        
        operation()
          .then(result => {
            running--;
            processNext();
            resolve(result);
          })
          .catch(error => {
            running--;
            processNext();
            reject(error);
          });
      });
      
      processNext();
    });
  }
  
  /**
   * Processes the next operation in the queue if possible
   */
  function processNext() {
    if (running < concurrency && queue.length > 0) {
      const next = queue.shift();
      if (next) {
        next();
      }
    }
  }
  
  /**
   * Clears all pending operations from the queue
   */
  function clear() {
    queue.length = 0;
  }
  
  return {
    enqueue,
    clear,
    getQueueLength: () => queue.length,
    getRunningCount: () => running
  };
}

/**
 * Creates a pooled resource that limits concurrent usage
 * 
 * @param factory Factory function to create resources
 * @param options Pool options
 * @returns Resource pool
 */
export function createResourcePool<T>(
  factory: () => Promise<T>,
  options: {
    size?: number;
    maxWaitTime?: number;
    destroyResource?: (resource: T) => Promise<void>;
  } = {}
) {
  const { 
    size = 5,
    maxWaitTime = 30000,
    destroyResource = async () => {} 
  } = options;
  
  type PoolItem = {
    resource: T;
    busy: boolean;
  };
  
  let pool: PoolItem[] = [];
  let pendingInitializations: Promise<T>[] = [];
  
  /**
   * Initializes the resource pool
   */
  async function initialize() {
    for (let i = 0; i < size; i++) {
      const initPromise = factory().then(resource => {
        pool.push({ resource, busy: false });
        return resource;
      });
      
      pendingInitializations.push(initPromise);
    }
    
    await Promise.all(pendingInitializations);
    pendingInitializations = [];
  }
  
  /**
   * Acquires a resource from the pool
   * 
   * @returns Promise that resolves with a resource
   */
  async function acquire(): Promise<T> {
    // Wait for pool initialization
    if (pendingInitializations.length > 0) {
      await Promise.all(pendingInitializations);
    }
    
    // Find a free resource
    const freeItem = pool.find(item => !item.busy);
    
    if (freeItem) {
      freeItem.busy = true;
      return freeItem.resource;
    }
    
    // If no free resources, wait for one to become available
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timed out waiting for resource after ${maxWaitTime}ms`));
      }, maxWaitTime);
      
      const checkInterval = setInterval(() => {
        const freeItem = pool.find(item => !item.busy);
        
        if (freeItem) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          
          freeItem.busy = true;
          resolve(freeItem.resource);
        }
      }, 100);
    });
  }
  
  /**
   * Releases a resource back to the pool
   * 
   * @param resource Resource to release
   */
  function release(resource: T) {
    const item = pool.find(item => item.resource === resource);
    
    if (item) {
      item.busy = false;
    }
  }
  
  /**
   * Destroys the resource pool
   */
  async function destroy() {
    await Promise.all(
      pool.map(item => destroyResource(item.resource))
    );
    
    pool = [];
  }
  
  return {
    initialize,
    acquire,
    release,
    destroy,
    getPoolSize: () => pool.length,
    getAvailableCount: () => pool.filter(item => !item.busy).length
  };
}
