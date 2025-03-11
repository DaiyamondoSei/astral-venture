
/**
 * AsyncResult Advanced Functions
 * 
 * Advanced functions for working with AsyncResult types.
 */

import {
  Result,
  success,
  failure,
  isSuccess,
  isFailure
} from './Result';
import { AsyncResult, RetryOptions, DEFAULT_RETRY_OPTIONS } from './AsyncResultTypes';

/**
 * Applies a recovery function to a failed AsyncResult
 */
export async function recoverAsync<T, E>(
  resultPromise: AsyncResult<T, E>,
  fn: (error: E) => T | Promise<T>
): Promise<T> {
  const result = await resultPromise;
  
  if (isSuccess(result)) {
    return result.value;
  } else {
    return fn(result.error);
  }
}

/**
 * Applies a recovery function that returns an AsyncResult to a failed AsyncResult
 */
export async function recoverWithAsync<T, E, F>(
  resultPromise: AsyncResult<T, E>,
  fn: (error: E) => AsyncResult<T, F>
): AsyncResult<T, F> {
  const result = await resultPromise;
  
  if (isSuccess(result)) {
    return success(result.value);
  } else {
    return fn(result.error);
  }
}

/**
 * Combines multiple AsyncResults into a single AsyncResult containing an array of values
 */
export async function allAsync<T, E>(
  resultPromises: AsyncResult<T, E>[]
): AsyncResult<T[], E> {
  try {
    const results = await Promise.all(resultPromises);
    const values: T[] = [];
    
    for (const result of results) {
      if (isFailure(result)) {
        return result;
      }
      values.push(result.value);
    }
    
    return success(values);
  } catch (error) {
    return failure(error instanceof Error ? error as unknown as E : new Error(String(error)) as unknown as E);
  }
}

/**
 * Returns the first successful AsyncResult or the last failure
 */
export async function firstSuccessAsync<T, E>(
  resultPromises: AsyncResult<T, E>[]
): AsyncResult<T, E> {
  const results = await Promise.all(resultPromises);
  
  for (const result of results) {
    if (isSuccess(result)) {
      return result;
    }
  }
  
  // Return the last failure if all failed
  return results[results.length - 1];
}

/**
 * Applies a timeout to an AsyncResult
 */
export async function withTimeout<T, E>(
  resultPromise: AsyncResult<T, E>,
  timeoutMs: number,
  timeoutError: E
): AsyncResult<T, E> {
  try {
    const timeoutPromise = new Promise<Result<T, E>>(
      (_, reject) => setTimeout(() => reject(timeoutError), timeoutMs)
    );
    
    return await Promise.race([resultPromise, timeoutPromise]);
  } catch (error) {
    if (error === timeoutError) {
      return failure(timeoutError);
    }
    return failure(error instanceof Error ? error as unknown as E : new Error(String(error)) as unknown as E);
  }
}

/**
 * Utility to wait a specified amount of time
 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retries an AsyncResult operation with exponential backoff
 */
export async function retryAsync<T, E>(
  operation: () => AsyncResult<T, E>,
  options: Partial<RetryOptions> = {}
): AsyncResult<T, E> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  
  let lastError: Result<T, E> = failure(new Error('Operation failed') as unknown as E);
  let attempt = 0;
  let delay = config.initialDelayMs;
  
  while (attempt < config.maxRetries) {
    try {
      const result = await operation();
      
      if (isSuccess(result)) {
        return result;
      }
      
      if (config.retryableErrors && !config.retryableErrors(result.error)) {
        return result;
      }
      
      lastError = result;
    } catch (error) {
      lastError = failure(error instanceof Error ? error as unknown as E : new Error(String(error)) as unknown as E);
      
      if (config.retryableErrors && !config.retryableErrors(error)) {
        return lastError;
      }
    }
    
    attempt++;
    
    if (attempt < config.maxRetries) {
      await wait(delay);
      delay = Math.min(delay * config.backoffFactor, config.maxDelayMs);
    }
  }
  
  return lastError;
}
