
import { ApiError } from './ApiError';

// Default timeouts in milliseconds
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

/**
 * Enhanced fetch with timeout and error handling
 */
export async function fetchWithTimeout(
  url: string, 
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw ApiError.timeout(`Request to ${url} timed out after ${timeout}ms`);
    }
    
    throw ApiError.network(`Failed to fetch from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    clearTimeout(id);
  }
}

/**
 * Fetch with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { 
    timeout?: number; 
    retries?: number;
    retryDelay?: number;
    shouldRetry?: (error: unknown, attemptCount: number) => boolean;
  } = {}
): Promise<Response> {
  const { 
    retries = DEFAULT_RETRY_COUNT,
    retryDelay = DEFAULT_RETRY_DELAY,
    shouldRetry = defaultShouldRetry,
    ...fetchOptions 
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(url, fetchOptions);
    } catch (error) {
      lastError = error;
      
      // Last attempt, don't retry
      if (attempt === retries) {
        break;
      }
      
      // Check if we should retry
      if (!shouldRetry(error, attempt)) {
        break;
      }
      
      // Wait before retrying - can be linear or exponential
      const delay = getRetryDelay(retryDelay, attempt);
      await sleep(delay);
      
      console.info(`Retrying request to ${url} (Attempt ${attempt + 1}/${retries})`);
    }
  }
  
  // If we get here, all retries failed
  if (lastError instanceof ApiError) {
    throw lastError;
  }
  
  throw ApiError.network(`Failed to fetch from ${url} after ${retries} retries: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

/**
 * Sleep function for delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate retry delay with exponential backoff
 */
function getRetryDelay(baseDelay: number, attempt: number): number {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // Add up to 30% randomness
  
  return exponentialDelay + jitter;
}

/**
 * Default logic for determining if a request should be retried
 */
function defaultShouldRetry(error: unknown, attemptCount: number): boolean {
  // Don't retry if we've exceeded retry count
  if (attemptCount >= DEFAULT_RETRY_COUNT) {
    return false;
  }
  
  // Retry network and timeout errors
  if (error instanceof ApiError) {
    return error.retryable;
  }
  
  // Retry network errors and timeouts
  if (error instanceof Error) {
    return /network|internet|connection|timeout|time out/i.test(error.message);
  }
  
  return false;
}

/**
 * Check if the device is currently online
 */
export function isOnline(): boolean {
  return navigator.onLine !== false;
}

/**
 * Register online/offline event listeners
 */
export function registerConnectivityListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

export default {
  fetchWithTimeout,
  fetchWithRetry,
  isOnline,
  registerConnectivityListeners
};
