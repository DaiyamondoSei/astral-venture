
/**
 * Runtime Type Validation Utilities
 * 
 * This module provides utilities for validating types at runtime with
 * proper error handling and type assertions.
 */
import { ValidationResult, ValidationErrorCode, ValidationSeverity } from '../../types/validation/types';
import { ValidationError } from './ValidationError';

/**
 * Validates that a value is defined (not null or undefined)
 * 
 * @param value Value to validate
 * @param fieldName Field name for error reporting
 * @returns The value if defined, otherwise throws ValidationError
 */
export function validateDefined<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throw new ValidationError(
      `${fieldName} is required`,
      [{ 
        path: fieldName, 
        message: `${fieldName} is required`,
        rule: 'required',
        code: ValidationErrorCode.REQUIRED,
        severity: ValidationSeverity.ERROR
      }],
      ValidationErrorCode.REQUIRED
    );
  }
  return value;
}

/**
 * Type guard for checking if a value is a string
 * 
 * @param value Value to check
 * @returns Whether the value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Validates that a value is a string
 * 
 * @param value Value to validate
 * @param fieldName Field name for error reporting
 * @returns The value as a string if valid, otherwise throws ValidationError
 */
export function validateString(value: unknown, fieldName: string): string {
  if (!isString(value)) {
    throw new ValidationError(
      `${fieldName} must be a string`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be a string`,
        type: 'string',
        rule: 'type',
        code: ValidationErrorCode.TYPE_ERROR,
        severity: ValidationSeverity.ERROR
      }],
      ValidationErrorCode.TYPE_ERROR
    );
  }
  return value;
}

/**
 * Type guard for checking if a value is a number
 * 
 * @param value Value to check
 * @returns Whether the value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Validates that a value is a number
 * 
 * @param value Value to validate
 * @param fieldName Field name for error reporting
 * @returns The value as a number if valid, otherwise throws ValidationError
 */
export function validateNumber(value: unknown, fieldName: string): number {
  if (!isNumber(value)) {
    throw new ValidationError(
      `${fieldName} must be a number`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be a number`,
        type: 'number',
        rule: 'type',
        code: ValidationErrorCode.TYPE_ERROR,
        severity: ValidationSeverity.ERROR
      }],
      ValidationErrorCode.TYPE_ERROR
    );
  }
  return value;
}

/**
 * Type guard for checking if a value is a boolean
 * 
 * @param value Value to check
 * @returns Whether the value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Validates that a value is a boolean
 * 
 * @param value Value to validate
 * @param fieldName Field name for error reporting
 * @returns The value as a boolean if valid, otherwise throws ValidationError
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (!isBoolean(value)) {
    throw new ValidationError(
      `${fieldName} must be a boolean`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be a boolean`,
        type: 'boolean',
        rule: 'type',
        code: ValidationErrorCode.TYPE_ERROR,
        severity: ValidationSeverity.ERROR
      }],
      ValidationErrorCode.TYPE_ERROR
    );
  }
  return value;
}

/**
 * Type guard for checking if a value is an array
 * 
 * @param value Value to check
 * @returns Whether the value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Validates that a value is an array
 * 
 * @param value Value to validate
 * @param fieldName Field name for error reporting
 * @returns The value as an array if valid, otherwise throws ValidationError
 */
export function validateArray(value: unknown, fieldName: string): unknown[] {
  if (!isArray(value)) {
    throw new ValidationError(
      `${fieldName} must be an array`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be an array`,
        type: 'array',
        rule: 'type',
        code: ValidationErrorCode.TYPE_ERROR,
        severity: ValidationSeverity.ERROR
      }],
      ValidationErrorCode.TYPE_ERROR
    );
  }
  return value;
}

/**
 * Type guard for checking if a value is an object
 * 
 * @param value Value to check
 * @returns Whether the value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates that a value is an object
 * 
 * @param value Value to validate
 * @param fieldName Field name for error reporting
 * @returns The value as an object if valid, otherwise throws ValidationError
 */
export function validateObject(value: unknown, fieldName: string): Record<string, unknown> {
  if (!isObject(value)) {
    throw new ValidationError(
      `${fieldName} must be an object`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be an object`,
        type: 'object',
        rule: 'type',
        code: ValidationErrorCode.TYPE_ERROR,
        severity: ValidationSeverity.ERROR
      }],
      ValidationErrorCode.TYPE_ERROR
    );
  }
  return value;
}

/**
 * Validates that a value is one of the allowed values
 * 
 * @param value Value to validate
 * @param fieldName Field name for error reporting
 * @param allowedValues Array of allowed values
 * @returns The value if valid, otherwise throws ValidationError
 */
export function validateOneOf<T>(value: unknown, fieldName: string, allowedValues: T[]): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
        rule: 'oneOf',
        code: ValidationErrorCode.CONSTRAINT_ERROR,
        severity: ValidationSeverity.ERROR
      }],
      ValidationErrorCode.CONSTRAINT_ERROR
    );
  }
  return value as T;
}

/**
 * Check if a value is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Converts a validation function to a function that returns a ValidationResult
 * 
 * @param validationFn Validation function that throws on invalid input
 * @returns Function that returns ValidationResult instead of throwing
 */
export function toValidationResult<T>(
  validationFn: (value: unknown, fieldName: string) => T
): (value: unknown, fieldName: string) => ValidationResult<T> {
  return (value: unknown, fieldName: string): ValidationResult<T> => {
    try {
      const validatedValue = validationFn(value, fieldName);
      return {
        valid: true,
        validatedData: validatedValue
      };
    } catch (error) {
      if (isValidationError(error)) {
        return {
          valid: false,
          error: error.details[0],
          errors: error.details
        };
      }
      
      // For other errors, create a generic validation error
      const message = error instanceof Error ? error.message : String(error);
      return {
        valid: false,
        error: {
          path: fieldName,
          message,
          code: ValidationErrorCode.UNKNOWN_ERROR,
          severity: ValidationSeverity.ERROR
        },
        errors: [{
          path: fieldName,
          message,
          code: ValidationErrorCode.UNKNOWN_ERROR,
          severity: ValidationSeverity.ERROR
        }]
      };
    }
  };
}
