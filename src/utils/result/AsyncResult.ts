
/**
 * AsyncResult Pattern Implementation
 * 
 * Provides utility functions for working with Promises that resolve to Result objects.
 * Enables functional composition of asynchronous operations with proper error handling.
 */

import { Result, success, failure, isSuccess, isFailure } from './Result';

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Maps a successful AsyncResult value using the provided function
 */
export async function mapAsync<T, U, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (value: T) => U | Promise<U>
): AsyncResult<U, E> {
  try {
    const result = await asyncResult;
    
    if (isSuccess(result)) {
      const mappedValue = await fn(result.value);
      return success(mappedValue);
    }
    
    return result;
  } catch (error) {
    return failure(error as E);
  }
}

/**
 * Chains AsyncResults by applying a function that returns an AsyncResult
 */
export async function flatMapAsync<T, U, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (value: T) => AsyncResult<U, E>
): AsyncResult<U, E> {
  const result = await asyncResult;
  
  if (isSuccess(result)) {
    return fn(result.value);
  }
  
  return result;
}

/**
 * Folds an AsyncResult into a single value by applying one of two functions
 */
export async function foldAsync<T, E, U>(
  asyncResult: AsyncResult<T, E>,
  onSuccess: (value: T) => U | Promise<U>,
  onFailure: (error: E) => U | Promise<U>
): Promise<U> {
  const result = await asyncResult;
  
  if (isSuccess(result)) {
    return onSuccess(result.value);
  } else {
    return onFailure(result.error);
  }
}

/**
 * Maps the error of an AsyncResult using the provided function
 */
export async function mapErrorAsync<T, E, F>(
  asyncResult: AsyncResult<T, E>,
  fn: (error: E) => F | Promise<F>
): AsyncResult<T, F> {
  const result = await asyncResult;
  
  if (isFailure(result)) {
    const mappedError = await fn(result.error);
    return failure(mappedError);
  }
  
  return success(result.value);
}

/**
 * Recovers from a failed AsyncResult by applying a recovery function
 */
export async function recoverAsync<T, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (error: E) => T | Promise<T>
): Promise<T> {
  const result = await asyncResult;
  
  if (isSuccess(result)) {
    return result.value;
  } else {
    return fn(result.error);
  }
}

/**
 * Recovers from a failed AsyncResult with another AsyncResult
 */
export async function recoverWithAsync<T, E, F>(
  asyncResult: AsyncResult<T, E>,
  fn: (error: E) => AsyncResult<T, F>
): AsyncResult<T, F> {
  const result = await asyncResult;
  
  if (isFailure(result)) {
    return fn(result.error);
  }
  
  return success(result.value);
}

/**
 * Combines multiple AsyncResults into a single AsyncResult with an array of values
 */
export async function allAsync<T, E>(
  asyncResults: AsyncResult<T, E>[]
): AsyncResult<T[], E> {
  const results: T[] = [];
  
  for (const asyncResult of asyncResults) {
    const result = await asyncResult;
    
    if (isFailure(result)) {
      return result;
    }
    
    results.push(result.value);
  }
  
  return success(results);
}

/**
 * Combines two AsyncResults into a single AsyncResult with a tuple of values
 */
export async function combineAsync<T1, T2, E>(
  asyncResult1: AsyncResult<T1, E>,
  asyncResult2: AsyncResult<T2, E>
): AsyncResult<[T1, T2], E> {
  const result1 = await asyncResult1;
  if (isFailure(result1)) return result1;
  
  const result2 = await asyncResult2;
  if (isFailure(result2)) return result2;
  
  return success([result1.value, result2.value]);
}

/**
 * Combines three AsyncResults into a single AsyncResult with a tuple of values
 */
export async function combine3Async<T1, T2, T3, E>(
  asyncResult1: AsyncResult<T1, E>,
  asyncResult2: AsyncResult<T2, E>,
  asyncResult3: AsyncResult<T3, E>
): AsyncResult<[T1, T2, T3], E> {
  const result1 = await asyncResult1;
  if (isFailure(result1)) return result1;
  
  const result2 = await asyncResult2;
  if (isFailure(result2)) return result2;
  
  const result3 = await asyncResult3;
  if (isFailure(result3)) return result3;
  
  return success([result1.value, result2.value, result3.value]);
}

/**
 * Returns the first successful AsyncResult or the last failure
 */
export async function firstSuccessAsync<T, E>(
  asyncResults: AsyncResult<T, E>[]
): AsyncResult<T, E> {
  let lastError: Result<T, E> | null = null;
  
  for (const asyncResult of asyncResults) {
    const result = await asyncResult;
    
    if (isSuccess(result)) {
      return result;
    }
    
    lastError = result;
  }
  
  // We know lastError is not null because we would have returned already if we had a success
  return lastError!;
}

/**
 * Applies a timeout to an AsyncResult
 */
export async function withTimeout<T, E>(
  asyncResult: AsyncResult<T, E>,
  timeoutMs: number,
  timeoutError: E
): AsyncResult<T, E> {
  try {
    const timeoutPromise = new Promise<Result<T, E>>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    return await Promise.race([asyncResult, timeoutPromise]);
  } catch (error) {
    return failure(timeoutError);
  }
}

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  backoffFactor: number;
  maxDelayMs: number;
  retryableErrors?: (error: any) => boolean;
}

/**
 * Retries a function that returns an AsyncResult with exponential backoff
 */
export async function retryAsync<T, E>(
  fn: () => AsyncResult<T, E>,
  config: RetryConfig
): AsyncResult<T, E> {
  let lastError: Result<T, E> | null = null;
  let delay = config.initialDelayMs;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await fn();
      
      if (isSuccess(result) || attempt === config.maxRetries) {
        return result;
      }
      
      if (config.retryableErrors && !config.retryableErrors(result.error)) {
        return result;
      }
      
      lastError = result;
    } catch (error) {
      // If the promise was rejected rather than returning a failure Result,
      // convert it to a failure Result
      lastError = failure(error as E);
      
      if (attempt === config.maxRetries) {
        return lastError;
      }
    }
    
    // Wait before the next retry attempt
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Calculate next delay with exponential backoff
    delay = Math.min(delay * config.backoffFactor, config.maxDelayMs);
  }
  
  return lastError!;
}

/**
 * Applies a side effect function to a successful AsyncResult without changing it
 */
export async function tapAsync<T, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (value: T) => void | Promise<void>
): AsyncResult<T, E> {
  const result = await asyncResult;
  
  if (isSuccess(result)) {
    await fn(result.value);
  }
  
  return result;
}

/**
 * Applies a side effect function to a failed AsyncResult without changing it
 */
export async function tapErrorAsync<T, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (error: E) => void | Promise<void>
): AsyncResult<T, E> {
  const result = await asyncResult;
  
  if (isFailure(result)) {
    await fn(result.error);
  }
  
  return result;
}

/**
 * Exports all the synchronous functions from Result.ts for use with AsyncResult
 */
export {
  success,
  failure,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  asyncResultify
} from './Result';
