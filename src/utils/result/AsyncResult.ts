
/**
 * AsyncResult Pattern Implementation
 * 
 * A robust type-safe approach for handling asynchronous operations that may succeed or fail.
 * This pattern builds on the Result type and provides utility functions for working with
 * Promises that resolve to Result types.
 */

import {
  Result,
  Success,
  Failure,
  success,
  failure,
  isSuccess,
  isFailure
} from './Result';

/**
 * Type alias for a Promise that resolves to a Result
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Maps a successful AsyncResult value using the provided function
 */
export async function mapAsync<T, U, E>(
  resultPromise: AsyncResult<T, E>,
  fn: (value: T) => U | Promise<U>
): AsyncResult<U, E> {
  try {
    const result = await resultPromise;
    
    if (isSuccess(result)) {
      const mappedValue = await fn(result.value);
      return success(mappedValue);
    }
    
    return result;
  } catch (error) {
    return failure(error instanceof Error ? error as unknown as E : new Error(String(error)) as unknown as E);
  }
}

/**
 * Chains AsyncResults by applying a function that returns an AsyncResult
 */
export async function flatMapAsync<T, U, E>(
  resultPromise: AsyncResult<T, E>,
  fn: (value: T) => AsyncResult<U, E>
): AsyncResult<U, E> {
  try {
    const result = await resultPromise;
    
    if (isSuccess(result)) {
      return fn(result.value);
    }
    
    return result;
  } catch (error) {
    return failure(error instanceof Error ? error as unknown as E : new Error(String(error)) as unknown as E);
  }
}

/**
 * Applies a success or failure handler to an AsyncResult
 */
export async function foldAsync<T, E, R>(
  resultPromise: AsyncResult<T, E>,
  successFn: (value: T) => R | Promise<R>,
  failureFn: (error: E) => R | Promise<R>
): Promise<R> {
  const result = await resultPromise;
  
  if (isSuccess(result)) {
    return successFn(result.value);
  } else {
    return failureFn(result.error);
  }
}

/**
 * Maps a failed AsyncResult's error to a different error type
 */
export async function mapErrorAsync<T, E, F>(
  resultPromise: AsyncResult<T, E>,
  fn: (error: E) => F | Promise<F>
): AsyncResult<T, F> {
  const result = await resultPromise;
  
  if (isFailure(result)) {
    const mappedError = await fn(result.error);
    return failure(mappedError);
  }
  
  return success(result.value);
}

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
 * Retry options for the retryAsync function
 */
export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryableErrors?: (error: unknown) => boolean;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffFactor: 2
};

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

/**
 * Type-safe wrapper to ensure async operations consistently return AsyncResults
 */
export function asyncResultify<T, E = Error>(
  fn: (...args: any[]) => Promise<T>,
  errorMapper?: (error: unknown) => E
): (...args: any[]) => AsyncResult<T, E> {
  return async (...args: any[]) => {
    try {
      const result = await fn(...args);
      return success(result);
    } catch (error) {
      if (errorMapper) {
        return failure(errorMapper(error));
      }
      return failure(error instanceof Error ? error as unknown as E : new Error(String(error)) as unknown as E);
    }
  };
}
