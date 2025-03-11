
/**
 * Result Pattern Implementation
 * 
 * A type-safe container for representing operations that may succeed or fail.
 * This eliminates the "Property does not exist on type 'never'" errors by
 * properly containing success and error states with their appropriate types.
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly type: 'success';
  readonly value: T;
}

export interface Failure<E> {
  readonly type: 'failure';
  readonly error: E;
}

/**
 * Creates a successful Result
 */
export function success<T>(value: T): Success<T> {
  return { type: 'success', value };
}

/**
 * Creates a failed Result
 */
export function failure<E>(error: E): Failure<E> {
  return { type: 'failure', error };
}

/**
 * Type guard for checking if a Result is successful
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.type === 'success';
}

/**
 * Type guard for checking if a Result is a failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.type === 'failure';
}

/**
 * Maps a successful Result to another Result using the provided function
 */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return isSuccess(result) ? success(fn(result.value)) : result;
}

/**
 * Chains Results by applying a function that returns a Result
 */
export function flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  return isSuccess(result) ? fn(result.value) : result;
}

/**
 * Applies a recovery function to a failed Result
 */
export function recover<T, E>(result: Result<T, E>, fn: (error: E) => T): T {
  return isSuccess(result) ? result.value : fn(result.error);
}

/**
 * Unwraps a Result, returning the success value or throwing the error
 */
export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (isSuccess(result)) {
    return result.value;
  }
  throw result.error;
}

/**
 * Unwraps a Result, returning the success value or a default value
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return isSuccess(result) ? result.value : defaultValue;
}

/**
 * Wraps a promise to return a Result
 */
export async function fromPromise<T>(
  promise: Promise<T>
): Promise<Result<T, Error>> {
  try {
    const value = await promise;
    return success(value);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Creates a Result from a nullable value
 */
export function fromNullable<T, E extends Error>(
  value: T | null | undefined,
  errorFn: () => E
): Result<T, E> {
  return value != null ? success(value) : failure(errorFn());
}
