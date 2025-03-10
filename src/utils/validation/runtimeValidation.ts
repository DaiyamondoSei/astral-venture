
import { ValidationError } from './ValidationError';

/**
 * Validates that a value is a string
 * 
 * @param value - Value to validate
 * @param path - Path for error reporting
 * @returns The validated string
 * @throws ValidationError if the value is not a string
 */
export function validateString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(
      `Expected string at ${path}, got ${typeof value}`,
      path,
      value,
      'TYPE_ERROR'
    );
  }
  return value;
}

/**
 * Validates that a value is a number
 * 
 * @param value - Value to validate
 * @param path - Path for error reporting
 * @returns The validated number
 * @throws ValidationError if the value is not a number
 */
export function validateNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(
      `Expected number at ${path}, got ${typeof value}`,
      path,
      value,
      'TYPE_ERROR'
    );
  }
  return value;
}

/**
 * Validates that a value is a boolean
 * 
 * @param value - Value to validate
 * @param path - Path for error reporting
 * @returns The validated boolean
 * @throws ValidationError if the value is not a boolean
 */
export function validateBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(
      `Expected boolean at ${path}, got ${typeof value}`,
      path,
      value,
      'TYPE_ERROR'
    );
  }
  return value;
}

/**
 * Validates that a value is an object
 * 
 * @param value - Value to validate
 * @param path - Path for error reporting
 * @returns The validated object
 * @throws ValidationError if the value is not an object
 */
export function validateObject(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(
      `Expected object at ${path}, got ${typeof value}`,
      path,
      value,
      'TYPE_ERROR'
    );
  }
  return value as Record<string, unknown>;
}

/**
 * Validates that a value is an array
 * 
 * @param value - Value to validate
 * @param path - Path for error reporting
 * @returns The validated array
 * @throws ValidationError if the value is not an array
 */
export function validateArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(
      `Expected array at ${path}, got ${typeof value}`,
      path,
      value,
      'TYPE_ERROR'
    );
  }
  return value;
}

/**
 * Validates that a value is one of a set of allowed values
 * 
 * @param value - Value to validate
 * @param allowedValues - Set of allowed values
 * @param path - Path for error reporting
 * @returns The validated value
 * @throws ValidationError if the value is not one of the allowed values
 */
export function validateOneOf<T>(value: unknown, allowedValues: T[], path: string): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `Expected one of [${allowedValues.join(', ')}] at ${path}, got ${value}`,
      path,
      value,
      'INVALID_OPTION'
    );
  }
  return value as T;
}

/**
 * Validates that a value is defined (not null or undefined)
 * 
 * @param value - Value to validate
 * @param path - Path for error reporting
 * @returns The validated value
 * @throws ValidationError if the value is null or undefined
 */
export function validateDefined<T>(value: T | null | undefined, path: string): T {
  if (value === null || value === undefined) {
    throw new ValidationError(
      `Expected defined value at ${path}, got ${value === null ? 'null' : 'undefined'}`,
      path,
      value,
      'MISSING_VALUE'
    );
  }
  return value;
}

/**
 * Provides a default value if the input is null or undefined
 * 
 * @param value - Value to check
 * @param defaultValue - Default value to use if input is null or undefined
 * @returns The input value or the default value
 */
export function withDefault<T>(value: T | null | undefined, defaultValue: T): T {
  return value === null || value === undefined ? defaultValue : value;
}

/**
 * Type guard to check if a value is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}
