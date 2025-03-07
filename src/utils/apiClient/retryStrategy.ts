
/**
 * Configuration options for retry strategy
 */
export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryStatusCodes: number[];
  retryNetworkErrors: boolean;
  shouldRetry?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number, delay: number) => void;
}

/**
 * Default retry strategy options
 */
export const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  retryNetworkErrors: true
};

/**
 * Calculate the delay time for exponential backoff
 * @param attempt Current attempt number
 * @param options Retry options
 * @returns Delay time in milliseconds with jitter
 */
export function calculateBackoffDelay(attempt: number, options: RetryOptions): number {
  const { initialDelay, maxDelay, backoffFactor } = options;
  
  // Calculate basic exponential backoff
  const backoffDelay = initialDelay * Math.pow(backoffFactor, attempt - 1);
  
  // Apply a jitter of ±20% to prevent synchronized retries
  const jitter = 0.8 + Math.random() * 0.4;
  
  // Return the delay capped at maxDelay
  return Math.min(backoffDelay * jitter, maxDelay);
}

/**
 * Determine if a request should be retried based on the error
 * @param error The error that caused the request to fail
 * @param attempt Current attempt number
 * @param options Retry options
 * @returns Whether to retry the request
 */
export function shouldRetryRequest(error: any, attempt: number, options: RetryOptions): boolean {
  // Use custom shouldRetry function if provided
  if (options.shouldRetry) {
    return options.shouldRetry(error, attempt);
  }
  
  // Check if max retries exceeded
  if (attempt >= options.maxRetries) {
    return false;
  }
  
  // Check for network errors
  if (options.retryNetworkErrors && 
      (error instanceof TypeError || 
       error.message?.includes('network') ||
       error.message?.includes('connection'))) {
    return true;
  }
  
  // Check for specific status codes
  if (error.status && options.retryStatusCodes.includes(error.status)) {
    return true;
  }
  
  // Check for timeout errors
  if (error.message?.includes('timeout')) {
    return true;
  }
  
  return false;
}

/**
 * Sleep for a specified duration
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute an async function with retry logic
 * @param fn The function to execute with retries
 * @param options Retry options
 * @returns Promise that resolves with the result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const retryOptions: RetryOptions = { ...defaultRetryOptions, ...options };
  let attempt = 1;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      // Check if we should retry
      if (!shouldRetryRequest(error, attempt, retryOptions)) {
        throw error;
      }
      
      // Calculate delay and log retry
      const delay = calculateBackoffDelay(attempt, retryOptions);
      
      // Call onRetry callback if provided
      if (retryOptions.onRetry) {
        retryOptions.onRetry(error, attempt, delay);
      } else {
        console.warn(`Retrying (${attempt}/${retryOptions.maxRetries}) after ${delay}ms due to:`, error);
      }
      
      // Wait before retrying
      await sleep(delay);
      
      // Increment attempt counter
      attempt++;
    }
  }
}
