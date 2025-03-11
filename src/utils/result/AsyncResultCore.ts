
/**
 * AsyncResult Core Functions
 * 
 * Core functions for working with AsyncResult types.
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
import { AsyncResult } from './AsyncResultTypes';

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
