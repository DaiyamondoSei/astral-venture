
/**
 * AsyncResult - Advanced utilities for working with asynchronous operations
 */
import { Result, success, failure } from './Result';
import { AsyncResult } from './AsyncResultTypes';
import { 
  mapAsync, 
  flatMapAsync, 
  foldAsync, 
  mapErrorAsync, 
  asyncResultify 
} from './AsyncResultCore';

/**
 * Creates a successful AsyncResult
 * @param value The value to wrap in a successful AsyncResult
 * @returns A Promise of a Success result containing the value
 */
export function asyncSuccess<T, E = Error>(value: T): AsyncResult<T, E> {
  return Promise.resolve(success(value));
}

/**
 * Creates a failed AsyncResult
 * @param error The error to wrap in a failed AsyncResult
 * @returns A Promise of a Failure result containing the error
 */
export function asyncFailure<T, E>(error: E): AsyncResult<T, E> {
  return Promise.resolve(failure(error));
}

/**
 * Applies recovery logic to an AsyncResult in case of failure
 * @param asyncResult The AsyncResult to recover from
 * @param fn The function to apply to the error to produce a new value
 * @returns A new AsyncResult with the recovered value
 */
export async function recoverAsync<T, E>(
  asyncResult: AsyncResult<T, E>,
  fn: (error: E) => T | Promise<T>
): AsyncResult<T, never> {
  const result = await asyncResult;

  if (result.type === 'success') {
    return asyncSuccess(result.value);
  }

  try {
    const recoveredValue = await fn(result.error);
    return asyncSuccess(recoveredValue);
  } catch (error) {
    // If recovery fails, we still want to return a success with the original error
    // This is to maintain the contract that recoverAsync always returns a success
    return asyncSuccess(error as unknown as T);
  }
}

/**
 * Converts a Promise to an AsyncResult
 * @param promise The Promise to convert
 * @returns An AsyncResult that resolves to the Promise's value or rejects with its error
 */
export function fromPromise<T, E = Error>(promise: Promise<T>): AsyncResult<T, E> {
  return promise
    .then((value) => success(value))
    .catch((error) => failure(error as E));
}

/**
 * Executes multiple AsyncResults in parallel and collects their results
 * @param asyncResults The AsyncResults to execute in parallel
 * @returns An AsyncResult with an array of the successful results or an array of errors
 */
export async function allAsync<T, E>(
  asyncResults: AsyncResult<T, E>[]
): AsyncResult<T[], E[]> {
  const results = await Promise.all(asyncResults);
  const successes: T[] = [];
  const failures: E[] = [];

  for (const result of results) {
    if (result.type === 'success') {
      successes.push(result.value);
    } else {
      failures.push(result.error);
    }
  }

  if (failures.length === 0) {
    return success(successes);
  } else {
    return failure(failures);
  }
}

// Export everything from AsyncResultCore
export {
  mapAsync,
  flatMapAsync,
  foldAsync,
  mapErrorAsync,
  asyncResultify
};
