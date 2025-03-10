
import { BaseValidationError, ValidationErrorOptions } from './errors/BaseValidationError';
import {
  RequiredFieldError,
  TypeValidationError,
  RangeValidationError,
  FormatValidationError,
  ConstraintValidationError,
  SchemaValidationError,
  WrappedValidationError,
  ApiValidationError
} from './errors/ValidationErrors';

/**
 * Main validation error class with factory methods for creating specific error types
 */
export class ValidationError extends BaseValidationError {
  constructor(message: string, options: ValidationErrorOptions) {
    super(message, options);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Create an error for a required field that's missing
   */
  static requiredError(field: string): ValidationError {
    return new RequiredFieldError(field);
  }

  /**
   * Create an error for an incorrect type
   */
  static typeError(value: unknown, expectedType: string, field: string): ValidationError {
    return new TypeValidationError(value, expectedType, field);
  }

  /**
   * Create an error for a value outside of allowed range
   */
  static rangeError(field: string, min?: number, max?: number, actual?: number): ValidationError {
    return new RangeValidationError(field, min, max, actual);
  }

  /**
   * Create an error for an incorrect format
   */
  static formatError(field: string, format: string, value: string): ValidationError {
    return new FormatValidationError(field, format, value);
  }

  /**
   * Create an error for a failed constraint
   */
  static constraintError(field: string, constraint: string, message: string): ValidationError {
    return new ConstraintValidationError(field, constraint, message);
  }

  /**
   * Wrap an error from another source
   */
  static wrapError(error: unknown, field: string): ValidationError {
    return new WrappedValidationError(error, field);
  }

  /**
   * Create an error from API response
   */
  static fromApiError(error: unknown, field?: string): ValidationError {
    return new ApiValidationError(error, field);
  }

  /**
   * Create a schema validation error
   */
  static schemaError(errors: string[], field: string): ValidationError {
    return new SchemaValidationError(errors, field);
  }

  /**
   * Utility to check if an error is a ValidationError
   */
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof BaseValidationError;
  }
}

export { ValidationErrorOptions } from './errors/BaseValidationError';
export default ValidationError;
export const isValidationError = ValidationError.isValidationError;
