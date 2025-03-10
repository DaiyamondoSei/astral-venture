
import ApiError, { ApiErrorType } from '../api/ApiError';
import { toast } from 'sonner';

// Standard fetch timeout in milliseconds
const DEFAULT_TIMEOUT = 30000;

/**
 * Configuration options for enhanced fetch
 */
export interface EnhancedFetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryStatusCodes?: number[];
  skipErrorToast?: boolean;
  fallbackData?: any;
  useOfflineQueue?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
  abortSignal?: AbortSignal;
}

/**
 * Enhanced fetch with timeouts, retries, and better error handling
 */
export async function enhancedFetch(
  url: string,
  options: EnhancedFetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = 3,
    retryDelay = 1000,
    retryStatusCodes = [408, 429, 500, 502, 503, 504],
    skipErrorToast = false,
    useOfflineQueue = true,
    cacheKey,
    abortSignal,
    ...fetchOptions
  } = options;
  
  let currentRetry = 0;
  
  // Check if we're offline
  if (!navigator.onLine && useOfflineQueue) {
    // Queue the request to be processed when back online
    queueOfflineRequest(url, options);
    
    const offlineError = ApiError.offline({
      endpoint: url,
      method: fetchOptions.method || 'GET',
      requestData: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : undefined
    });
    
    if (!skipErrorToast) {
      toast.error(offlineError.getUserMessage());
    }
    
    throw offlineError;
  }
  
  // Add retry loop
  while (currentRetry <= retries) {
    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Combine with user-provided signal if any
    const signal = abortSignal
      ? combineAbortSignals(controller.signal, abortSignal)
      : controller.signal;
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal
      });
      
      clearTimeout(timeoutId);
      
      // If response is ok or we've run out of retries, return it
      if (response.ok || currentRetry >= retries) {
        return response;
      }
      
      // Check if we should retry based on status code
      if (retryStatusCodes.includes(response.status)) {
        // Check for rate limiting with Retry-After header
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : retryDelay * Math.pow(2, currentRetry);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        currentRetry++;
        continue;
      }
      
      // If not a retriable status code, just return the response
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle timeout (AbortError)
      if (error.name === 'AbortError') {
        if (currentRetry >= retries) {
          const timeoutError = ApiError.timeout({
            endpoint: url,
            method: fetchOptions.method || 'GET',
            retryCount: currentRetry
          });
          
          if (!skipErrorToast) {
            toast.error(timeoutError.getUserMessage());
          }
          
          throw timeoutError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, currentRetry)));
        currentRetry++;
        continue;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (currentRetry >= retries) {
          const networkError = ApiError.network(error.message, {
            endpoint: url,
            method: fetchOptions.method || 'GET',
            retryCount: currentRetry
          }, error);
          
          if (!skipErrorToast) {
            toast.error(networkError.getUserMessage());
          }
          
          throw networkError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, currentRetry)));
        currentRetry++;
        continue;
      }
      
      // Rethrow other errors
      throw error;
    }
  }
  
  // This should never happen, but TypeScript wants a return here
  throw new Error('Maximum retries exceeded');
}

/**
 * Combine multiple AbortSignals
 */
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  
  const onAbort = () => {
    controller.abort();
    // Cleanup
    signals.forEach(signal => {
      signal.removeEventListener('abort', onAbort);
    });
  };
  
  signals.forEach(signal => {
    // If one signal is already aborted, abort immediately
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    
    signal.addEventListener('abort', onAbort);
  });
  
  return controller.signal;
}

/**
 * Offline request entry
 */
interface OfflineRequest {
  url: string;
  options: EnhancedFetchOptions;
  timestamp: number;
}

// Queue for offline requests
const offlineQueue: OfflineRequest[] = [];

/**
 * Queue a request to be processed when back online
 */
function queueOfflineRequest(url: string, options: EnhancedFetchOptions): void {
  offlineQueue.push({
    url,
    options,
    timestamp: Date.now()
  });
  
  // Save to local storage for persistence
  try {
    localStorage.setItem('offlineRequestQueue', JSON.stringify(offlineQueue));
  } catch (e) {
    console.error('Failed to save offline queue to local storage:', e);
  }
}

/**
 * Process all queued offline requests
 */
export async function processOfflineQueue(): Promise<void> {
  // Load queue from storage if available
  try {
    const storedQueue = localStorage.getItem('offlineRequestQueue');
    if (storedQueue) {
      const parsedQueue = JSON.parse(storedQueue);
      offlineQueue.push(...parsedQueue);
      localStorage.removeItem('offlineRequestQueue');
    }
  } catch (e) {
    console.error('Failed to load offline queue from local storage:', e);
  }
  
  if (offlineQueue.length === 0) return;
  
  toast.info(`Processing ${offlineQueue.length} pending requests...`);
  
  // Process each request in order
  const requests = [...offlineQueue];
  offlineQueue.length = 0; // Clear the queue
  
  let successful = 0;
  let failed = 0;
  
  for (const request of requests) {
    try {
      // Skip offline queue to prevent infinite loop
      await enhancedFetch(request.url, {
        ...request.options,
        useOfflineQueue: false,
        skipErrorToast: true
      });
      successful++;
    } catch (error) {
      failed++;
      console.error('Failed to process offline request:', error);
    }
  }
  
  // Show toast with results
  if (successful > 0 && failed > 0) {
    toast.info(`Completed ${successful} requests, ${failed} failed`);
  } else if (successful > 0) {
    toast.success(`Successfully completed ${successful} pending requests`);
  } else if (failed > 0) {
    toast.error(`Failed to complete ${failed} pending requests`);
  }
}

// Setup listener for online status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (navigator.onLine) {
      processOfflineQueue();
    }
  });
}

/**
 * Batch multiple fetch requests into a single request
 */
export async function batchRequests<T>(
  urls: string[],
  options: EnhancedFetchOptions = {}
): Promise<T[]> {
  if (urls.length === 0) return [];
  
  // If only one URL, just use enhancedFetch
  if (urls.length === 1) {
    const response = await enhancedFetch(urls[0], options);
    const data = await response.json();
    return [data];
  }
  
  // Use Promise.all for parallel requests
  const promises = urls.map(url => {
    return enhancedFetch(url, options)
      .then(response => {
        if (!response.ok) {
          throw ApiError.fromResponse(response, undefined, {
            endpoint: url,
            method: options.method || 'GET'
          });
        }
        return response.json();
      })
      .catch(error => {
        // Convert to ApiError if needed
        if (!(error instanceof ApiError)) {
          error = ApiError.fromError(error, {
            endpoint: url,
            method: options.method || 'GET'
          });
        }
        throw error;
      });
  });
  
  // Use allSettled to get all results even if some fail
  const results = await Promise.allSettled(promises);
  
  // Process results
  const successResults: T[] = [];
  const errors: ApiError[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successResults.push(result.value);
    } else {
      // Store errors for reporting
      errors.push(result.reason);
      // Add null placeholder to maintain array ordering
      successResults.push(null as unknown as T);
    }
  });
  
  // Report errors if any
  if (errors.length > 0) {
    console.error(`${errors.length} of ${urls.length} batch requests failed:`, errors);
    
    // Show toast for errors if enabled
    if (!options.skipErrorToast) {
      toast.error(`${errors.length} of ${urls.length} requests failed`);
    }
  }
  
  return successResults;
}

export default {
  enhancedFetch,
  processOfflineQueue,
  batchRequests
};
