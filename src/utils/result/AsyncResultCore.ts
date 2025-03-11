
/**
 * Core utilities for working with AsyncResult types
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
  fn: (value: T) => U | Promise<U>
): AsyncResult<U, E> {
  const result = await asyncResult;

  if (result.type === 'success') {
    try {
      const mapped = await fn(result.value);
      return success(mapped);
    } catch (error) {
      return failure(error as E);
    }
  }

  return result;
}

/**
 * Flat maps the success value of an AsyncResult
 * @param asyncResult The AsyncResult to flat map
 * @param fn The function to apply to the success value that returns a new AsyncResult
 * @returns A new AsyncResult with the flat mapped success value
 */
export async function flatMapAsync<T, U, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (value: T) => AsyncResult<U, E> | Promise<AsyncResult<U, E>>
): AsyncResult<U, E> {
  const result = await asyncResult;

  if (result.type === 'success') {
    try {
      return await fn(result.value);
    } catch (error) {
      return failure(error as E);
    }
  }

  return result;
}

/**
 * Folds an AsyncResult into a single value
 * @param asyncResult The AsyncResult to fold
 * @param onSuccess The function to apply to the success value
 * @param onFailure The function to apply to the failure value
 * @returns A promise of the folded value
 */
export async function foldAsync<T, E, U>(
  asyncResult: AsyncResult<T, E>,
  onSuccess: (value: T) => U | Promise<U>,
  onFailure: (error: E) => U | Promise<U>
): Promise<U> {
  const result = await asyncResult;

  if (result.type === 'success') {
    return onSuccess(result.value);
  } else {
    return onFailure(result.error);
  }
}

/**
 * Maps the error of an AsyncResult
 * @param asyncResult The AsyncResult to map
 * @param fn The function to apply to the error
 * @returns A new AsyncResult with the mapped error
 */
export async function mapErrorAsync<T, E, F>(
  asyncResult: AsyncResult<T, E>,
  fn: (error: E) => F | Promise<F>
): AsyncResult<T, F> {
  const result = await asyncResult;

  if (result.type === 'failure') {
    try {
      const mapped = await fn(result.error);
      return failure(mapped);
    } catch (error) {
      return failure(error as F);
    }
  }

  return result as unknown as AsyncResult<T, F>;
}

/**
 * Converts a function that may throw to one that returns an AsyncResult
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
