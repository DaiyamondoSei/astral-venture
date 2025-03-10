
/**
 * Runtime validation utilities for type safety
 */

import { isArray, isBoolean, isNumber, isObject, isString } from 'lodash';

/**
 * Type guard to check if an error is a validation error
 */
export function isValidationError(error: unknown): error is Error {
  return error instanceof Error && 
         (error.name === 'ValidationError' || error.message.includes('validation'));
}

/**
 * Validates that a value is defined (not null or undefined)
 * 
 * @param value - The value to validate
 * @param name - Name of the parameter (for error messages)
 * @returns The validated value
 * @throws Error if validation fails
 */
export function validateDefined<T>(value: T | null | undefined, name = 'value'): T {
  if (value === null || value === undefined) {
    throw new Error(`${name} is required but was not provided`);
  }
  return value;
}

/**
 * Validates that a value is a string
 * 
 * @param value - The value to validate
 * @param name - Name of the parameter (for error messages)
 * @returns The validated string
 * @throws Error if validation fails
 */
export function validateString(value: unknown, name = 'value'): string {
  if (!isString(value)) {
    throw new Error(`${name} must be a string`);
  }
  return value;
}

/**
 * Validates that a value is a number
 * 
 * @param value - The value to validate
 * @param name - Name of the parameter (for error messages)
 * @returns The validated number
 * @throws Error if validation fails
 */
export function validateNumber(value: unknown, name = 'value'): number {
  if (!isNumber(value)) {
    throw new Error(`${name} must be a number`);
  }
  return value;
}

/**
 * Validates that a value is a boolean
 * 
 * @param value - The value to validate
 * @param name - Name of the parameter (for error messages)
 * @returns The validated boolean
 * @throws Error if validation fails
 */
export function validateBoolean(value: unknown, name = 'value'): boolean {
  if (!isBoolean(value)) {
    throw new Error(`${name} must be a boolean`);
  }
  return value;
}

/**
 * Validates that a value is an array
 * 
 * @param value - The value to validate
 * @param name - Name of the parameter (for error messages)
 * @returns The validated array
 * @throws Error if validation fails
 */
export function validateArray(value: unknown, name = 'value'): unknown[] {
  if (!isArray(value)) {
    throw new Error(`${name} must be an array`);
  }
  return value;
}

/**
 * Validates that a value is an object
 * 
 * @param value - The value to validate
 * @param name - Name of the parameter (for error messages)
 * @returns The validated object
 * @throws Error if validation fails
 */
export function validateObject(value: unknown, name = 'value'): Record<string, unknown> {
  if (!isObject(value) || isArray(value) || value === null) {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

/**
 * Validates that a value is one of the allowed values
 * 
 * @param value - The value to validate
 * @param allowedValues - Array of allowed values
 * @param name - Name of the parameter (for error messages)
 * @returns The validated value
 * @throws Error if validation fails
 */
export function validateOneOf<T>(value: unknown, allowedValues: T[], name = 'value'): T {
  if (!allowedValues.includes(value as T)) {
    throw new Error(
      `${name} must be one of [${allowedValues.join(', ')}], but got ${String(value)}`
    );
  }
  return value as T;
}

/**
 * Validates that a value matches a pattern
 * 
 * @param value - The value to validate
 * @param pattern - Regular expression pattern to match
 * @param name - Name of the parameter (for error messages)
 * @returns The validated string
 * @throws Error if validation fails
 */
export function validatePattern(
  value: unknown,
  pattern: RegExp,
  name = 'value'
): string {
  const strValue = validateString(value, name);
  
  if (!pattern.test(strValue)) {
    throw new Error(`${name} must match pattern ${pattern}`);
  }
  
  return strValue;
}

/**
 * Validates that a number is within a specific range
 * 
 * @param value - The value to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @param name - Name of the parameter (for error messages)
 * @returns The validated number
 * @throws Error if validation fails
 */
export function validateRange(
  value: unknown,
  min: number,
  max: number,
  name = 'value'
): number {
  const numValue = validateNumber(value, name);
  
  if (numValue < min || numValue > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
  
  return numValue;
}

/**
 * Composes multiple validators into a single validator
 * 
 * @param validators - Array of validator functions
 * @returns A function that runs all validators in sequence
 */
export function composeValidators<T>(
  validators: Array<(value: unknown, name?: string) => unknown>
): (value: unknown, name?: string) => T {
  return (value: unknown, name = 'value'): T => {
    return validators.reduce(
      (result, validator) => validator(result, name),
      value
    ) as T;
  };
}

/**
 * Ensures a value is of a specific type or returns a default
 * 
 * @param value - Value to validate
 * @param defaultValue - Default value to use if validation fails
 * @param validator - Validation function to apply
 * @returns Validated value or default
 */
export function withDefault<T>(
  value: unknown,
  defaultValue: T,
  validator: (val: unknown, name?: string) => T
): T {
  try {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return validator(value, 'value');
  } catch (error) {
    return defaultValue;
  }
}

// Export all validation functions
export {
  // Functions exported directly in the body
};
