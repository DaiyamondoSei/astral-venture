
/**
 * Validation Results
 * 
 * Standard response types for validation operations
 */

import { ValidationResult, ValidationErrorDetail } from './types';
import { ValidationError } from '@/utils/validation/ValidationError';

/**
 * Creates a success validation result
 */
export function success<T>(value: T): ValidationResult<T> {
  return {
    isValid: true,
    value,
    validatedData: value,
    errors: []
  };
}

/**
 * Creates a failure validation result
 */
export function failure<T>(errors: string[] | ValidationErrorDetail[]): ValidationResult<T> {
  return {
    isValid: false,
    errors
  };
}

/**
 * Converts a ValidationError to a ValidationResult
 */
export function fromValidationError<T>(error: ValidationError): ValidationResult<T> {
  return {
    isValid: false,
    errors: error.details || [error.message]
  };
}

/**
 * Converts any error to a ValidationResult
 */
export function fromError<T>(error: unknown): ValidationResult<T> {
  if (error instanceof ValidationError) {
    return fromValidationError(error);
  }
  
  const message = error instanceof Error ? error.message : String(error);
  return {
    isValid: false,
    errors: [message]
  };
}

/**
 * Safely unwraps a validation result, returning the value or throwing error
 */
export function unwrap<T>(result: ValidationResult<T>): T {
  if (!result.isValid) {
    const message = Array.isArray(result.errors) 
      ? result.errors.map(e => typeof e === 'string' ? e : e.message).join(', ')
      : 'Validation failed';
    throw new ValidationError(message);
  }
  return result.value!;
}

/**
 * Safely unwraps a validation result with a default value if invalid
 */
export function unwrapOr<T>(result: ValidationResult<T>, defaultValue: T): T {
  return result.isValid ? result.value! : defaultValue;
}

/**
 * Creates a simple validator function
 */
export function createValidator<T>(
  validate: (value: unknown) => boolean,
  errorMessage: string | ((value: unknown) => string)
): (value: unknown) => ValidationResult<T> {
  return (value: unknown): ValidationResult<T> => {
    if (validate(value)) {
      return success(value as T);
    } else {
      const message = typeof errorMessage === 'function' ? errorMessage(value) : errorMessage;
      return failure([message]);
    }
  };
}
