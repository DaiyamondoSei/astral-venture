
/**
 * Result Pattern
 * 
 * Implements the Result pattern for handling operation results in a type-safe way.
 * This pattern makes it explicit whether an operation succeeded or failed and
 * provides structured error information.
 */

/**
 * Success result with data
 */
export interface Success<T> {
  success: true;
  data: T;
}

/**
 * Error result with error information
 */
export interface Failure<E = Error> {
  success: false;
  error: E;
}

/**
 * Result type - either Success or Failure
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Create a success result
 */
export function success<T>(data: T): Success<T> {
  return { 
    success: true, 
    data 
  };
}

/**
 * Create a failure result
 */
export function failure<E = Error>(error: E): Failure<E> {
  return { 
    success: false, 
    error 
  };
}

/**
 * Safely execute a function that might throw and return a Result
 */
export async function tryCatch<T, E = Error>(
  fn: () => Promise<T>,
  errorTransformer?: (error: unknown) => E
): Promise<Result<T, E>> {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    if (errorTransformer) {
      return failure(errorTransformer(error));
    }
    return failure(error as E);
  }
}

/**
 * Map a success result to a new success result with transformed data
 */
export function map<T, U, E = Error>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (result.success) {
    return success(fn(result.data));
  }
  return result;
}

/**
 * Map a failure result to a new failure result with transformed error
 */
export function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (!result.success) {
    return failure(fn(result.error));
  }
  return result as Success<T>;
}

/**
 * Unwrap a result to get the data or throw the error
 */
export function unwrap<T, E extends Error = Error>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/**
 * Get the data from a result or return a default value if it failed
 */
export function unwrapOr<T, E = Error>(result: Result<T, E>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}
