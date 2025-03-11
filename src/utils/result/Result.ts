
/**
 * Enhanced Result Pattern Implementation
 * 
 * A robust type-safe container for representing operations that may succeed or fail.
 * This pattern eliminates "Property does not exist on type 'never'" errors and
 * provides a consistent approach to handling both success and error cases.
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
 * Maps a failed Result's error to a different error type
 */
export function mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return isFailure(result) ? failure(fn(result.error)) : result;
}

/**
 * Applies a recovery function to a failed Result
 */
export function recover<T, E>(result: Result<T, E>, fn: (error: E) => T): T {
  return isSuccess(result) ? result.value : fn(result.error);
}

/**
 * Applies a recovery function that returns a Result to a failed Result
 */
export function recoverWith<T, E, F>(result: Result<T, E>, fn: (error: E) => Result<T, F>): Result<T, F> {
  return isFailure(result) ? fn(result.error) : success(result.value);
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
 * Wraps a function to return a Result
 */
export function tryCatch<T, E = Error>(fn: () => T, errorFn?: (error: unknown) => E): Result<T, E> {
  try {
    return success(fn());
  } catch (error) {
    if (errorFn) {
      return failure(errorFn(error));
    }
    return failure(error instanceof Error ? error as unknown as E : new Error(String(error)) as unknown as E);
  }
}

/**
 * Wraps a promise to return a Result
 */
export async function fromPromise<T, E = Error>(
  promise: Promise<T>,
  errorFn?: (error: unknown) => E
): Promise<Result<T, E>> {
  try {
    const value = await promise;
    return success(value);
  } catch (error) {
    if (errorFn) {
      return failure(errorFn(error));
    }
    return failure(error instanceof Error ? error as unknown as E : new Error(String(error)) as unknown as E);
  }
}

/**
 * Creates a Result from a nullable value
 */
export function fromNullable<T, E>(
  value: T | null | undefined,
  errorFn: () => E
): Result<T, E> {
  return value != null ? success(value) : failure(errorFn());
}

/**
 * Combines multiple Results into a single Result containing an array of values
 */
export function all<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  
  for (const result of results) {
    if (isFailure(result)) {
      return result;
    }
    values.push(result.value);
  }
  
  return success(values);
}

/**
 * Combines two Results into a single Result containing a tuple of values
 */
export function combine<T1, T2, E>(
  result1: Result<T1, E>,
  result2: Result<T2, E>
): Result<[T1, T2], E> {
  if (isFailure(result1)) return result1;
  if (isFailure(result2)) return result2;
  
  return success([result1.value, result2.value]);
}

/**
 * Combines three Results into a single Result containing a tuple of values
 */
export function combine3<T1, T2, T3, E>(
  result1: Result<T1, E>,
  result2: Result<T2, E>,
  result3: Result<T3, E>
): Result<[T1, T2, T3], E> {
  if (isFailure(result1)) return result1;
  if (isFailure(result2)) return result2;
  if (isFailure(result3)) return result3;
  
  return success([result1.value, result2.value, result3.value]);
}

/**
 * Returns the first successful Result or the last failure
 */
export function firstSuccess<T, E>(results: Result<T, E>[]): Result<T, E> {
  let lastError: Failure<E> | null = null;
  
  for (const result of results) {
    if (isSuccess(result)) {
      return result;
    }
    lastError = result;
  }
  
  return lastError!;
}

/**
 * Applies a side effect function to a successful Result without changing it
 */
export function tap<T, E>(result: Result<T, E>, fn: (value: T) => void): Result<T, E> {
  if (isSuccess(result)) {
    fn(result.value);
  }
  return result;
}

/**
 * Applies a side effect function to a failed Result without changing it
 */
export function tapError<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E> {
  if (isFailure(result)) {
    fn(result.error);
  }
  return result;
}

/**
 * Utility to create typed error factories for consistent error creation
 */
export function createErrorFactory<E extends Error>(
  ErrorClass: new (message: string, ...args: any[]) => E
) {
  return (message: string, ...args: any[]): Failure<E> => {
    return failure(new ErrorClass(message, ...args));
  };
}

/**
 * Type-safe wrapper to ensure async operations consistently return Results
 */
export function asyncResultify<T, E = Error>(
  fn: (...args: any[]) => Promise<T>,
  errorMapper?: (error: unknown) => E
): (...args: any[]) => Promise<Result<T, E>> {
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
