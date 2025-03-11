
/**
 * AsyncResult Utilities
 * 
 * Type-safe utilities for working with asynchronous operations
 * that may succeed or fail, fully integrated with the Result pattern.
 */

import { Result, Success, Failure, success, failure, isSuccess, isFailure } from './Result';

/**
 * Represents an asynchronous operation that returns a Result
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Maps the success value of an AsyncResult to a new value
 */
export async function mapAsync<T, U, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (value: T) => Promise<U> | U
): AsyncResult<U, E> {
  const result = await asyncResult;
  
  if (isSuccess(result)) {
    try {
      const mapped = await fn(result.value);
      return success(mapped);
    } catch (error) {
      // If the mapping function throws, we convert it to a failure
      // This is safe because we're only changing the success type
      return failure(error as E);
    }
  }
  
  return result;
}

/**
 * Chains an AsyncResult with a function that returns another AsyncResult
 */
export async function flatMapAsync<T, U, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (value: T) => AsyncResult<U, E>
): AsyncResult<U, E> {
  const result = await asyncResult;
  
  if (isSuccess(result)) {
    try {
      return await fn(result.value);
    } catch (error) {
      return failure(error as E);
    }
  }
  
  return result;
}

/**
 * Handles both success and error cases of an AsyncResult
 */
export async function foldAsync<T, U, E>(
  asyncResult: AsyncResult<T, E>,
  onSuccess: (value: T) => Promise<U> | U,
  onFailure: (error: E) => Promise<U> | U
): Promise<U> {
  const result = await asyncResult;
  
  if (isSuccess(result)) {
    return await onSuccess(result.value);
  } else {
    return await onFailure(result.error);
  }
}

/**
 * Maps the error of an AsyncResult to a new error type
 */
export async function mapErrorAsync<T, E, F>(
  asyncResult: AsyncResult<T, E>,
  fn: (error: E) => Promise<F> | F
): AsyncResult<T, F> {
  const result = await asyncResult;
  
  if (isFailure(result)) {
    try {
      const mappedError = await fn(result.error);
      return failure(mappedError);
    } catch (error) {
      return failure(error as F);
    }
  }
  
  return success(result.value);
}

/**
 * Recovers from a failed AsyncResult by providing a default value
 */
export async function recoverAsync<T, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (error: E) => Promise<T> | T
): Promise<T> {
  const result = await asyncResult;
  
  if (isFailure(result)) {
    return await fn(result.error);
  }
  
  return result.value;
}

/**
 * Recovers from a failed AsyncResult by providing another AsyncResult
 */
export async function recoverWithAsync<T, E, F>(
  asyncResult: AsyncResult<T, E>,
  fn: (error: E) => AsyncResult<T, F>
): AsyncResult<T, F> {
  const result = await asyncResult;
  
  if (isFailure(result)) {
    try {
      return await fn(result.error);
    } catch (error) {
      return failure(error as F);
    }
  }
  
  return success(result.value);
}

/**
 * Combines multiple AsyncResults into a single AsyncResult containing an array of values
 */
export async function allAsync<T, E>(asyncResults: AsyncResult<T, E>[]): AsyncResult<T[], E> {
  try {
    const results = await Promise.all(asyncResults);
    const values: T[] = [];
    
    for (const result of results) {
      if (isFailure(result)) {
        return result;
      }
      values.push(result.value);
    }
    
    return success(values);
  } catch (error) {
    return failure(error as E);
  }
}

/**
 * Returns the first successful AsyncResult or the last failure
 */
export async function firstSuccessAsync<T, E>(asyncResults: AsyncResult<T, E>[]): AsyncResult<T, E> {
  let lastError: Failure<E> | null = null;
  
  for (const asyncResult of asyncResults) {
    try {
      const result = await asyncResult;
      
      if (isSuccess(result)) {
        return result;
      }
      
      lastError = result;
    } catch (error) {
      lastError = failure(error as E);
    }
  }
  
  return lastError!;
}

/**
 * Applies a timeout to an AsyncResult, returning a failure if the timeout is exceeded
 */
export function withTimeout<T, E>(
  asyncResult: AsyncResult<T, E>,
  timeoutMs: number,
  timeoutError: E
): AsyncResult<T, E> {
  return new Promise<Result<T, E>>(async (resolve) => {
    const timeoutId = setTimeout(() => {
      resolve(failure(timeoutError));
    }, timeoutMs);
    
    try {
      const result = await asyncResult;
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      resolve(failure(error as E));
    }
  });
}

/**
 * Retries an async operation that returns a Result with exponential backoff
 */
export async function retryAsync<T, E>(
  operation: () => AsyncResult<T, E>,
  options: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
    shouldRetry?: (error: E, attempt: number) => boolean;
  }
): AsyncResult<T, E> {
  const { maxRetries, initialDelayMs, maxDelayMs, backoffFactor, shouldRetry } = options;
  let lastResult: Result<T, E> | null = null;
  
  for (let attempt = 0; attempt < maxRetries + 1; attempt++) {
    try {
      const result = await operation();
      
      if (isSuccess(result)) {
        return result;
      }
      
      lastResult = result;
      
      if (shouldRetry && !shouldRetry(result.error, attempt)) {
        return result;
      }
      
      if (attempt < maxRetries) {
        const delayMs = Math.min(initialDelayMs * Math.pow(backoffFactor, attempt), maxDelayMs);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      lastResult = failure(error as E);
    }
  }
  
  return lastResult!;
}

/**
 * Creates a typed AsyncResult function from a Promise-returning function
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
