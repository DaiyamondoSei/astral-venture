
/**
 * Result Type - Represents either a successful result with a value or a failed result with an error
 */

export type Success<T> = {
  type: 'success';
  value: T;
};

export type Failure<E> = {
  type: 'failure';
  error: E;
};

export type Result<T, E> = Success<T> | Failure<E>;

/**
 * Creates a success result
 * @param value The value to wrap in a success result
 * @returns A Success result containing the value
 */
export function success<T>(value: T): Success<T> {
  return {
    type: 'success',
    value
  };
}

/**
 * Creates a failure result
 * @param error The error to wrap in a failure result
 * @returns A Failure result containing the error
 */
export function failure<E>(error: E): Failure<E> {
  return {
    type: 'failure',
    error
  };
}

/**
 * Maps the success value of a Result
 * @param result The Result to map
 * @param fn The function to apply to the success value
 * @returns A new Result with the mapped success value
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.type === 'success') {
    return success(fn(result.value));
  }
  return result;
}

/**
 * Maps the error of a Result
 * @param result The Result to map
 * @param fn The function to apply to the error
 * @returns A new Result with the mapped error
 */
export function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (result.type === 'failure') {
    return failure(fn(result.error));
  }
  return result as Result<T, F>;
}

/**
 * Flat maps the success value of a Result
 * @param result The Result to flat map
 * @param fn The function to apply to the success value that returns a new Result
 * @returns A new Result with the flat mapped success value
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.type === 'success') {
    return fn(result.value);
  }
  return result;
}

/**
 * Folds a Result into a single value
 * @param result The Result to fold
 * @param onSuccess The function to apply to the success value
 * @param onFailure The function to apply to the failure value
 * @returns The folded value
 */
export function fold<T, E, U>(
  result: Result<T, E>,
  onSuccess: (value: T) => U,
  onFailure: (error: E) => U
): U {
  if (result.type === 'success') {
    return onSuccess(result.value);
  } else {
    return onFailure(result.error);
  }
}

/**
 * Recovers from a failure by producing a new value
 * @param result The Result to recover from
 * @param fn The function to apply to the error to produce a new value
 * @returns A new Success result with the recovered value
 */
export function recover<T, E>(
  result: Result<T, E>,
  fn: (error: E) => T
): Success<T> {
  if (result.type === 'success') {
    return result;
  }
  return success(fn(result.error));
}

/**
 * Converts a function that may throw to one that returns a Result
 * @param fn The function to convert
 * @returns A function that returns a Result
 */
export function resultify<T extends any[], R, E = Error>(
  fn: (...args: T) => R
): (...args: T) => Result<R, E> {
  return (...args: T): Result<R, E> => {
    try {
      const result = fn(...args);
      return success(result);
    } catch (error) {
      return failure(error as E);
    }
  };
}
