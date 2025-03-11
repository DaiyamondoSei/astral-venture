
/**
 * Type-safe Result pattern implementation
 * 
 * The Result pattern provides a consistent way to handle operations
 * that can succeed or fail, avoiding exceptions for expected failures.
 */

// Success result type
export interface Success<T> {
  type: 'success';
  value: T;
}

// Failure result type
export interface Failure<E> {
  type: 'failure';
  error: E;
}

// Combined Result type
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Create a success result
 */
export function success<T>(value: T): Success<T> {
  return { type: 'success', value };
}

/**
 * Create a failure result
 */
export function failure<E>(error: E): Failure<E> {
  return { type: 'failure', error };
}

/**
 * Check if result is success
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.type === 'success';
}

/**
 * Check if result is failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.type === 'failure';
}

/**
 * Map success value to a new value
 */
export function map<T, U, E>(
  result: Result<T, E>,
  mapFn: (value: T) => U
): Result<U, E> {
  if (isSuccess(result)) {
    return success(mapFn(result.value));
  }
  return result;
}

/**
 * Handle both success and failure cases
 */
export function match<T, E, U>(
  result: Result<T, E>,
  onSuccess: (value: T) => U,
  onFailure: (error: E) => U
): U {
  if (isSuccess(result)) {
    return onSuccess(result.value);
  }
  return onFailure(result.error);
}

/**
 * Try to execute a function that might throw, and convert to Result
 */
export function tryResult<T>(fn: () => T): Result<T, Error> {
  try {
    return success(fn());
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Try to execute an async function that might throw, and convert to Result
 */
export async function tryResultAsync<T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> {
  try {
    const value = await fn();
    return success(value);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
}
