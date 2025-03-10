
import { ApiError, ApiErrorType } from '@/utils/api/ApiError';

/**
 * Options for network requests
 */
export interface NetworkRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  priorityLevel?: 'high' | 'medium' | 'low';
  cacheStrategy?: 'no-cache' | 'cache-first' | 'network-first' | 'stale-while-revalidate';
}

/**
 * Make a fetch request with enhanced error handling, timeouts, and retries
 */
export async function enhancedFetch(
  url: string,
  options: NetworkRequestOptions = {}
): Promise<Response> {
  const {
    timeout = 30000,
    retries = 1,
    retryDelay = 1000,
    priorityLevel = 'medium',
    cacheStrategy = 'no-cache',
    ...fetchOptions
  } = options;

  // Default headers
  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has('Content-Type') && !options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Default options with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Apply high-priority hints for critical resources if supported
  if (priorityLevel === 'high' && 'fetchPriority' in HTMLImageElement.prototype) {
    (fetchOptions as any).priority = 'high';
  }

  // Cache management based on strategy
  if (cacheStrategy !== 'no-cache') {
    fetchOptions.cache = cacheStrategy === 'cache-first' ? 'force-cache' : 'default';
  }

  // Set up optimized fetch options
  const optimizedOptions: RequestInit = {
    ...fetchOptions,
    headers,
    signal: controller.signal,
  };

  // Try to fetch with retries
  let lastError: Error | null = null;
  let attemptCount = 0;

  while (attemptCount <= retries) {
    try {
      const response = await fetch(url, optimizedOptions);
      clearTimeout(timeoutId);

      // If not ok, convert to custom ApiError
      if (!response.ok) {
        throw ApiError.fromResponse(response, url);
      }

      return response;
    } catch (error: any) {
      lastError = error;

      // Handle abort errors (timeouts)
      if (error.name === 'AbortError') {
        clearTimeout(timeoutId);
        throw new ApiError(
          'Request timed out',
          ApiErrorType.TIMEOUT_ERROR,
          { endpoint: url, retry: true }
        );
      }

      // Don't retry if we've reached the limit
      if (attemptCount >= retries) {
        break;
      }

      // Add progressive delay between retries
      const delay = retryDelay * Math.pow(1.5, attemptCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      attemptCount++;
    }
  }

  // Clear timeout if we exit the loop
  clearTimeout(timeoutId);

  // If we get here, all retries failed
  if (lastError instanceof ApiError) {
    throw lastError;
  } else if (lastError) {
    throw ApiError.fromNetworkError(lastError, url);
  } else {
    throw new ApiError('Unknown network error', ApiErrorType.UNKNOWN_ERROR, { endpoint: url });
  }
}

/**
 * Helper to make a GET request with enhanced options
 */
export async function get<T>(url: string, options: NetworkRequestOptions = {}): Promise<T> {
  const response = await enhancedFetch(url, {
    method: 'GET',
    ...options
  });
  return await response.json();
}

/**
 * Helper to make a POST request with enhanced options
 */
export async function post<T>(url: string, data: any, options: NetworkRequestOptions = {}): Promise<T> {
  const response = await enhancedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  });
  return await response.json();
}

/**
 * Helper to make a PUT request with enhanced options
 */
export async function put<T>(url: string, data: any, options: NetworkRequestOptions = {}): Promise<T> {
  const response = await enhancedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  });
  return await response.json();
}

/**
 * Helper to make a DELETE request with enhanced options
 */
export async function del<T>(url: string, options: NetworkRequestOptions = {}): Promise<T> {
  const response = await enhancedFetch(url, {
    method: 'DELETE',
    ...options
  });
  return await response.json();
}

/**
 * Check if the current browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Create an AbortController with timeout
 */
export function createTimeoutController(timeoutMs: number): {
  controller: AbortController;
  timeoutId: number;
  clear: () => void;
} {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  
  return {
    controller,
    timeoutId,
    clear: () => clearTimeout(timeoutId)
  };
}
