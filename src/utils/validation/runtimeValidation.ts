
import { handleError, ErrorCategory, ErrorSeverity } from '../errorHandling';

/**
 * Error thrown when validation fails
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates that a value is defined (not null or undefined)
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateDefined<T>(value: T | null | undefined, name: string): T {
  if (value === undefined || value === null) {
    throw new ValidationError(`${name} is required but was not provided`);
  }
  return value;
}

/**
 * Validates that a value is a string
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateString(value: unknown, name: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${name} must be a string`);
  }
  return value;
}

/**
 * Validates that a value is a number
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateNumber(value: unknown, name: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${name} must be a number`);
  }
  return value;
}

/**
 * Validates that a value is a boolean
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated boolean
 * @throws ValidationError if validation fails
 */
export function validateBoolean(value: unknown, name: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${name} must be a boolean`);
  }
  return value;
}

/**
 * Validates that a value is one of the allowed values
 * 
 * @param value - The value to check
 * @param allowedValues - Array of allowed values
 * @param name - Name of the field for error messages
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateOneOf<T>(value: unknown, allowedValues: T[], name: string): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${name} must be one of [${allowedValues.join(', ')}], but got ${String(value)}`
    );
  }
  return value as T;
}

/**
 * Validates that a value is an array
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated array
 * @throws ValidationError if validation fails
 */
export function validateArray<T>(value: unknown, name: string): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${name} must be an array`);
  }
  return value as T[];
}

/**
 * Validates that a value is an object
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated object
 * @throws ValidationError if validation fails
 */
export function validateObject(value: unknown, name: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

/**
 * Creates a composed validator that runs multiple validations
 * 
 * @param validators - Array of validator functions to run
 * @returns A function that runs all validators in sequence
 */
export function composeValidators<T>(
  ...validators: Array<(value: unknown) => unknown>
): (value: unknown) => T {
  return (value: unknown) => {
    return validators.reduce(
      (result, validator) => validator(result),
      value
    ) as T;
  };
}

/**
 * Validates an email address format
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated email string
 * @throws ValidationError if validation fails
 */
export function validateEmail(value: unknown, name: string): string {
  const email = validateString(value, name);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new ValidationError(`${name} must be a valid email address`);
  }
  
  return email;
}

/**
 * Creates a safe validation function that catches and handles validation errors
 * 
 * @param validationFn - The validation function to wrap
 * @param defaultValue - Default value to return on validation failure
 * @returns A function that performs validation but never throws
 */
export function createSafeValidator<T, R>(
  validationFn: (value: T) => R,
  defaultValue: R
): (value: T) => R {
  return (value: T): R => {
    try {
      return validationFn(value);
    } catch (error) {
      if (error instanceof ValidationError) {
        handleError(error, {
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.WARNING,
          context: 'Data Validation',
          showToast: false
        });
      } else {
        handleError(error, {
          category: ErrorCategory.UNEXPECTED,
          severity: ErrorSeverity.ERROR,
          context: 'Validation System',
          showToast: false
        });
      }
      return defaultValue;
    }
  };
}
