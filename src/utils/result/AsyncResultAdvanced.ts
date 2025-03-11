
/**
 * Advanced utilities for working with AsyncResult types
 */
import { Result, success, failure } from './Result';
import { AsyncResult, RetryOptions, DEFAULT_RETRY_OPTIONS } from './AsyncResultTypes';
import { mapAsync, flatMapAsync } from './AsyncResultCore';

/**
 * Recovers from a failure by returning a default value
 * @param asyncResult The AsyncResult to recover from
 * @param defaultValue The default value to use in case of failure
 * @returns A new AsyncResult with the recovered value
 */
export async function recoverAsync<T, E>(
  asyncResult: AsyncResult<T, E>,
  defaultValue: T
): AsyncResult<T, E> {
  const result = await asyncResult;
  
  if (result.type === 'failure') {
    return success(defaultValue);
  }
  
  return result;
}

/**
 * Recovers from a failure by calling a function to provide a new value
 * @param asyncResult The AsyncResult to recover from
 * @param fn The function to call to provide a recovery value
 * @returns A new AsyncResult with the recovered value
 */
export async function recoverWithAsync<T, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (error: E) => T | Promise<T>
): AsyncResult<T, E> {
  const result = await asyncResult;
  
  if (result.type === 'failure') {
    try {
      const recovery = await fn(result.error);
      return success(recovery);
    } catch (error) {
      return failure(error as E);
    }
  }
  
  return result;
}

/**
 * Runs multiple AsyncResults in parallel and collects their results
 * @param asyncResults An array of AsyncResults to run
 * @returns A new AsyncResult with an array of the results
 */
export async function allAsync<T, E>(
  asyncResults: Array<AsyncResult<T, E>>
): AsyncResult<T[], E> {
  try {
    const results = await Promise.all(asyncResults);
    
    // Check if any result is a failure
    for (const result of results) {
      if (result.type === 'failure') {
        return result as AsyncResult<any, E>;
      }
    }
    
    // All succeeded, map to values
    return success(results.map(r => (r as Result<T, E> & { type: 'success' }).value));
  } catch (error) {
    return failure(error as E);
  }
}

/**
 * Returns the first successful result from multiple AsyncResults
 * @param asyncResults An array of AsyncResults to try
 * @returns The first successful AsyncResult, or the last failure if all fail
 */
export async function firstSuccessAsync<T, E>(
  asyncResults: Array<AsyncResult<T, E>>
): AsyncResult<T, E> {
  let lastError: E | undefined;
  
  for (const asyncResult of asyncResults) {
    try {
      const result = await asyncResult;
      
      if (result.type === 'success') {
        return result;
      }
      
      lastError = result.error;
    } catch (error) {
      lastError = error as E;
    }
  }
  
  // If we get here, all failed
  return failure(lastError as E);
}

/**
 * Adds a timeout to an AsyncResult
 * @param asyncResult The AsyncResult to add a timeout to
 * @param timeoutMs The timeout in milliseconds
 * @param timeoutError The error to return on timeout
 * @returns A new AsyncResult that fails if the timeout is reached
 */
export async function withTimeout<T, E>(
  asyncResult: AsyncResult<T, E>,
  timeoutMs: number,
  timeoutError: E
): AsyncResult<T, E> {
  return Promise.race([
    asyncResult,
    new Promise<Result<T, E>>((resolve) => {
      setTimeout(() => resolve(failure(timeoutError)), timeoutMs);
    })
  ]);
}

/**
 * Retries an AsyncResult operation with backoff
 * @param operation The operation to retry
 * @param options The retry options
 * @returns A new AsyncResult with the eventual result
 */
export async function retryAsync<T, E>(
  operation: () => AsyncResult<T, E>,
  options: Partial<RetryOptions> = {}
): AsyncResult<T, E> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let currentDelay = config.initialDelayMs;
  let attempts = 0;
  let lastError: E | undefined;
  
  while (attempts < config.maxRetries) {
    try {
      const result = await operation();
      
      if (result.type === 'success') {
        return result;
      }
      
      // Check if this error is retryable
      if (config.retryableErrors && !config.retryableErrors(result.error)) {
        return result;
      }
      
      lastError = result.error;
    } catch (error) {
      lastError = error as E;
      
      // Check if this error is retryable
      if (config.retryableErrors && !config.retryableErrors(error)) {
        return failure(error as E);
      }
    }
    
    // Exponential backoff with jitter
    const jitter = Math.random() * 0.1 * currentDelay;
    await new Promise(resolve => setTimeout(resolve, currentDelay + jitter));
    
    // Increase delay, but cap at maxDelayMs
    currentDelay = Math.min(currentDelay * config.backoffFactor, config.maxDelayMs);
    attempts++;
  }
  
  return failure(lastError as E);
}
