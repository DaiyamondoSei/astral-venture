
/**
 * AsyncResult Core - Core utilities for working with asynchronous operations that may fail
 */
import { Result, success, failure } from './Result';
import { AsyncResult } from './AsyncResultTypes';

/**
 * Maps the success value of an AsyncResult
 * @param asyncResult The AsyncResult to map
 * @param fn The function to apply to the success value
 * @returns A new AsyncResult with the mapped success value
 */
export async function mapAsync<T, U, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (value: T) => Promise<U> | U
): AsyncResult<U, E> {
  const result = await asyncResult;

  if (result.type === 'success') {
    try {
      const mappedValue = await fn(result.value);
      return Promise.resolve(success(mappedValue));
    } catch (error) {
      // If the mapping function throws, we still want to return a failure
      // but with the original error type
      return Promise.resolve(failure(result.error as E));
    }
  }

  return Promise.resolve(result as Result<unknown, E>) as AsyncResult<U, E>;
}

/**
 * Maps the error of an AsyncResult
 * @param asyncResult The AsyncResult to map
 * @param fn The function to apply to the error
 * @returns A new AsyncResult with the mapped error
 */
export async function mapErrorAsync<T, E, F>(
  asyncResult: AsyncResult<T, E>,
  fn: (error: E) => Promise<F> | F
): AsyncResult<T, F> {
  const result = await asyncResult;

  if (result.type === 'failure') {
    try {
      const mappedError = await fn(result.error);
      return Promise.resolve(failure(mappedError));
    } catch (error) {
      // If mapping the error throws, we still want to return a failure
      return Promise.resolve(failure(error as F));
    }
  }

  return Promise.resolve(result as Result<T, unknown>) as AsyncResult<T, F>;
}

/**
 * Flat maps the success value of an AsyncResult
 * @param asyncResult The AsyncResult to flat map
 * @param fn The function to apply to the success value that returns a new AsyncResult
 * @returns A new AsyncResult with the flat mapped success value
 */
export async function flatMapAsync<T, U, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (value: T) => AsyncResult<U, E> | Promise<Result<U, E>>
): AsyncResult<U, E> {
  const result = await asyncResult;

  if (result.type === 'success') {
    try {
      return await fn(result.value);
    } catch (error) {
      // If the mapping function throws, we want to return a failure
      return Promise.resolve(failure(error as E));
    }
  }

  return Promise.resolve(result as Result<unknown, E>) as AsyncResult<U, E>;
}

/**
 * Folds an AsyncResult into a single value
 * @param asyncResult The AsyncResult to fold
 * @param onSuccess The function to apply to the success value
 * @param onFailure The function to apply to the failure value
 * @returns The folded value
 */
export async function foldAsync<T, E, U>(
  asyncResult: AsyncResult<T, E>,
  onSuccess: (value: T) => Promise<U> | U,
  onFailure: (error: E) => Promise<U> | U
): Promise<U> {
  const result = await asyncResult;

  if (result.type === 'success') {
    return await onSuccess(result.value);
  } else {
    return await onFailure(result.error);
  }
}

/**
 * Converts a function that returns a Promise to one that returns an AsyncResult
 * @param fn The function to convert
 * @returns A function that returns an AsyncResult
 */
export function asyncResultify<T extends any[], R, E = Error>(
  fn: (...args: T) => Promise<R>
): (...args: T) => AsyncResult<R, E> {
  return async (...args: T): AsyncResult<R, E> => {
    try {
      const result = await fn(...args);
      return success(result);
    } catch (error) {
      return failure(error as E);
    }
  };
}
