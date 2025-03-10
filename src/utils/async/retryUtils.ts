
/**
 * Configuration options for retry behavior
 */
export interface RetryOptions {
  maxRetries?: number;                // Maximum number of retry attempts
  initialDelay?: number;              // Initial delay in milliseconds
  maxDelay?: number;                  // Maximum delay between retries
  factor?: number;                    // Exponential backoff factor
  jitter?: boolean;                   // Whether to add randomness to delay
  retryCondition?: (error: any) => boolean;  // Custom condition to determine if retry should occur
  onRetry?: (error: any, attempt: number) => void; // Called before each retry
}

/**
 * Default retry options
 */
const defaultOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 300,
  maxDelay: 10000,
  factor: 2,
  jitter: true,
  retryCondition: () => true,
};

/**
 * Calculate delay for the next retry attempt using exponential backoff with jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  { initialDelay = 300, factor = 2, maxDelay = 10000, jitter = true }: RetryOptions
): number {
  // Calculate exponential backoff
  const exponentialDelay = initialDelay * Math.pow(factor, attempt);
  const delay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter to prevent thundering herd problem
  if (jitter) {
    // Add random jitter between 0-25% of the delay
    return delay * (1 + Math.random() * 0.25);
  }
  
  return delay;
}

/**
 * Retry an async function with backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  const { maxRetries, retryCondition, onRetry } = opts;
  
  let attempt = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      
      // Check if we should retry
      const shouldRetry = 
        attempt <= (maxRetries ?? 3) && 
        (retryCondition ? retryCondition(error) : true);
      
      if (!shouldRetry) {
        throw error;
      }
      
      // Calculate backoff delay
      const delay = calculateBackoffDelay(attempt, opts);
      
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt);
      }
      
      // Wait for the calculated delay
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Create a retryable version of an async function
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}

/**
 * Default retry condition for network and API errors
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  // Retry on network errors
  if (error instanceof TypeError && error.message.includes('network')) {
    return true;
  }
  
  // Retry on timeout errors
  if (error.message?.includes('timeout')) {
    return true;
  }
  
  // Retry on specific HTTP status codes
  if (error.status) {
    // Retry on server errors (5xx) and some specific client errors
    return (
      (error.status >= 500 && error.status < 600) ||
      error.status === 408 || // Request Timeout
      error.status === 429    // Too Many Requests
    );
  }
  
  return false;
}
