
import { ApiError, ApiErrorCode } from '../api/ApiError';

// Default retry configuration
export interface RetryConfig {
  retries: number;             // Maximum number of retry attempts
  initialDelay: number;        // Initial delay in ms
  maxDelay: number;            // Maximum delay in ms
  backoffFactor: number;       // Exponential backoff factor
  shouldRetry?: (error: unknown, attempt: number) => boolean;  // Custom retry condition
  onRetry?: (error: unknown, attempt: number, delay: number) => void;  // Called before retry
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  initialDelay: 300,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error) => {
    // Automatically retry network errors and server errors
    if (error instanceof ApiError) {
      return (
        error.code === ApiErrorCode.NETWORK_ERROR ||
        error.code === ApiErrorCode.TIMEOUT ||
        (error.statusCode !== undefined && error.statusCode >= 500)
      );
    }
    return false;
  }
};

/**
 * Execute a function with retry logic for better network resilience
 * @param fn The function to execute, which returns a Promise
 * @param config Retry configuration
 * @returns Promise with the result or last error
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
    try {
      // First attempt or retry
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      const shouldRetry = attempt < retryConfig.retries && 
        (retryConfig.shouldRetry?.(error, attempt) ?? false);
      
      if (!shouldRetry) {
        break;
      }
      
      // Calculate backoff delay
      const delay = Math.min(
        retryConfig.initialDelay * Math.pow(retryConfig.backoffFactor, attempt),
        retryConfig.maxDelay
      );
      
      // Add some jitter to prevent synchronized retries
      const jitteredDelay = delay * (0.8 + Math.random() * 0.4);
      
      // Call retry callback if provided
      if (retryConfig.onRetry) {
        retryConfig.onRetry(error, attempt + 1, jitteredDelay);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  // If we get here, we've exhausted all retries
  throw lastError;
}

/**
 * Batch multiple network requests together
 * @param requests Array of request functions that return promises
 * @param options Batching options
 * @returns Promise with array of results or errors
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  options: {
    concurrency?: number;  // Maximum concurrent requests
    abortOnError?: boolean;  // Whether to abort on first error
    timeout?: number;  // Overall timeout for all requests
  } = {}
): Promise<Array<T | Error>> {
  const {
    concurrency = 4,
    abortOnError = false,
    timeout
  } = options;
  
  const results: Array<T | Error> = new Array(requests.length);
  const queue = [...requests.keys()];
  const inProgress = new Set<number>();
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const signal = controller.signal;
  
  // Set timeout if specified
  let timeoutId: number | undefined;
  if (timeout) {
    timeoutId = window.setTimeout(() => controller.abort(), timeout);
  }
  
  try {
    await new Promise<void>((resolve, reject) => {
      // Process a specific request
      const processRequest = async (index: number) => {
        inProgress.add(index);
        
        try {
          // Execute the request with abort signal
          results[index] = await requests[index]();
        } catch (error) {
          results[index] = error instanceof Error ? error : new Error(String(error));
          
          // If set to abort on error, abort all remaining requests
          if (abortOnError) {
            controller.abort();
            reject(results[index]);
            return;
          }
        }
        
        inProgress.delete(index);
        
        // Process next request in queue
        if (queue.length > 0) {
          const nextIndex = queue.shift()!;
          processRequest(nextIndex);
        } else if (inProgress.size === 0) {
          // All requests completed
          resolve();
        }
      };
      
      // Set up abort handler
      signal.addEventListener('abort', () => {
        reject(new Error('Batch request aborted'));
      });
      
      // Start initial batch of requests
      const initialBatch = Math.min(concurrency, requests.length);
      for (let i = 0; i < initialBatch; i++) {
        const index = queue.shift()!;
        processRequest(index);
      }
    });
    
    return results;
  } finally {
    // Clean up timeout
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Deduplicate identical API calls made close together
 */
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Execute a request with deduplication of identical concurrent requests
 * @param key Unique key to identify the request
 * @param fn The request function
 * @param options Deduplication options
 * @returns Promise with the result
 */
export async function deduplicateRequest<T>(
  key: string,
  fn: () => Promise<T>,
  options: {
    expirationMs?: number;  // How long to cache the request
  } = {}
): Promise<T> {
  const { expirationMs = 50 } = options;
  
  // Check if an identical request is already in progress
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }
  
  // Create a new request promise
  const requestPromise = fn();
  
  // Store the promise for deduplication
  pendingRequests.set(key, requestPromise);
  
  // Remove from pending after completion or expiration
  const cleanup = () => {
    pendingRequests.delete(key);
  };
  
  // Set expiration
  setTimeout(cleanup, expirationMs);
  
  try {
    return await requestPromise;
  } finally {
    // Clean up after completion
    cleanup();
  }
}

/**
 * Check online status and optionally update connectivity
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && 
        typeof navigator.onLine === 'boolean' ? 
        navigator.onLine : true;
}

/**
 * Add a listener for online/offline events
 */
export function addConnectivityListener(
  callback: (online: boolean) => void
): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Utility to create a throttled network request
 * @param fn The function to throttle
 * @param limit Maximum calls per interval
 * @param interval Time interval in ms
 * @returns Throttled function
 */
export function throttleRequests<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  limit: number = 10,
  interval: number = 1000
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  const queue: Array<{
    args: Parameters<T>;
    resolve: (value: ReturnType<T>) => void;
    reject: (reason: any) => void;
  }> = [];
  
  let activeCount = 0;
  let lastIntervalStart = Date.now();
  
  // Process the next item in the queue
  const processQueue = async () => {
    if (queue.length === 0 || activeCount >= limit) return;
    
    // Check if we need to reset the interval
    const now = Date.now();
    if (now - lastIntervalStart > interval) {
      activeCount = 0;
      lastIntervalStart = now;
    }
    
    // If we're still under the limit, process the next request
    if (activeCount < limit) {
      activeCount++;
      const { args, resolve, reject } = queue.shift()!;
      
      try {
        const result = await fn(...args);
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        // Schedule next processing
        setTimeout(processQueue, 0);
      }
    } else {
      // Wait for the next interval
      setTimeout(processQueue, interval - (now - lastIntervalStart));
    }
  };
  
  // Return the throttled function
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      queue.push({ args, resolve, reject });
      processQueue();
    });
  };
}
