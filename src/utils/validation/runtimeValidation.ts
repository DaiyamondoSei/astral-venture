
/**
 * Runtime Validation Utilities
 * 
 * Provides type-safe validation functions for runtime data checking.
 * These utilities help ensure data integrity across system boundaries.
 */

import { AppError } from '@/utils/errorHandling/AppError';
import { ErrorCategory, ErrorSeverity } from '@/utils/errorHandling/types';

/**
 * Custom error for validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string, fieldName?: string) {
    super(
      fieldName ? `Validation error for '${fieldName}': ${message}` : message,
      {
        severity: ErrorSeverity.WARNING,
        category: ErrorCategory.VALIDATION,
        userMessage: 'The data provided is invalid or incomplete.'
      }
    );
    this.name = 'ValidationError';
    
    // This is needed to make instanceof work correctly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  /**
   * Create a ValidationError from an API error response
   */
  static fromApiError(apiError: unknown, fieldName?: string): ValidationError {
    if (apiError instanceof Error) {
      return new ValidationError(apiError.message, fieldName);
    }
    return new ValidationError('Unknown API validation error', fieldName);
  }
  
  /**
   * Create a ValidationError from a schema validation failure
   */
  static schemaError(message: string, fieldPath?: string): ValidationError {
    return new ValidationError(message, fieldPath);
  }
}

/**
 * Check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Validates that a value is defined (not null or undefined)
 */
export function validateDefined<T>(value: T | null | undefined, name = 'value'): T {
  if (value === undefined || value === null) {
    throw new ValidationError(`${name} is required, but got ${value}`, name);
  }
  return value;
}

/**
 * Validates that a value is a string
 */
export function validateString(value: unknown, name = 'value'): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${name} must be a string, but got ${typeof value}`, name);
  }
  return value;
}

/**
 * Validates that a value is a number
 */
export function validateNumber(value: unknown, name = 'value'): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError(`${name} must be a number, but got ${typeof value}`, name);
  }
  return value;
}

/**
 * Validates that a value is a boolean
 */
export function validateBoolean(value: unknown, name = 'value'): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${name} must be a boolean, but got ${typeof value}`, name);
  }
  return value;
}

/**
 * Validates that a value is within a numeric range
 */
export function validateRange(value: unknown, min: number, max: number, name = 'value'): number {
  const num = validateNumber(value, name);
  if (num < min || num > max) {
    throw new ValidationError(`${name} must be between ${min} and ${max}, but got ${num}`, name);
  }
  return num;
}

/**
 * Validates that a value is an array
 */
export function validateArray<T>(
  value: unknown, 
  itemValidator?: (item: unknown, index: number) => T,
  name = 'value'
): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${name} must be an array, but got ${typeof value}`, name);
  }
  
  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item, index);
      } catch (err) {
        if (isValidationError(err)) {
          throw new ValidationError(
            err.message,
            `${name}[${index}]`
          );
        }
        throw err;
      }
    });
  }
  
  return value as T[];
}

/**
 * Validates that a value is an object
 */
export function validateObject<T extends Record<string, unknown>>(
  value: unknown,
  name = 'value'
): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(
      `${name} must be an object, but got ${value === null ? 'null' : typeof value}`,
      name
    );
  }
  return value as T;
}

/**
 * Validates a complex object against a schema of validators
 */
export function validateSchema<T extends Record<string, unknown>>(
  value: unknown,
  schema: Record<string, (value: unknown) => unknown>,
  name = 'value'
): T {
  const obj = validateObject(value, name);
  const result: Record<string, unknown> = {};
  
  for (const [key, validator] of Object.entries(schema)) {
    try {
      if (key in obj) {
        result[key] = validator(obj[key]);
      } else if (validator === validateDefined) {
        // If validateDefined is used as a validator, the field is required
        throw new ValidationError(`Required field '${key}' is missing`, `${name}.${key}`);
      }
    } catch (err) {
      if (isValidationError(err)) {
        throw new ValidationError(
          err.message,
          err.message.includes(`${name}.${key}`) ? err.message : `${name}.${key}`
        );
      }
      throw err;
    }
  }
  
  return result as T;
}

/**
 * Validates that a value matches one of the provided values
 */
export function validateEnum<T extends string | number>(
  value: unknown,
  allowedValues: readonly T[],
  name = 'value'
): T {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new ValidationError(
      `${name} must be a string or number, but got ${typeof value}`,
      name
    );
  }
  
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${name} must be one of [${allowedValues.join(', ')}], but got ${value}`,
      name
    );
  }
  
  return value as T;
}

/**
 * Validates and transforms an ISO date string to a Date object
 */
export function validateDate(value: unknown, name = 'value'): Date {
  if (value instanceof Date) {
    return value;
  }
  
  const strValue = validateString(value, name);
  const date = new Date(strValue);
  
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${name} must be a valid date string, but got "${strValue}"`, name);
  }
  
  return date;
}
