
/**
 * Runtime Type Validation
 * 
 * Provides utilities for validating data types at runtime
 */

import { ValidationError } from './ValidationError';

/**
 * Check if a value is present and not undefined or null
 */
export function validateRequired<T>(value: T | undefined | null, name = 'Value'): T {
  if (value === undefined || value === null) {
    throw ValidationError.requiredError(name);
  }
  return value;
}

/**
 * Check if a value is a string
 */
export function validateString(value: unknown, name = 'Value'): string {
  if (typeof value !== 'string') {
    throw ValidationError.typeError(name, 'string', value);
  }
  return value;
}

/**
 * Check if a value is a number
 */
export function validateNumber(value: unknown, name = 'Value'): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw ValidationError.typeError(name, 'number', value);
  }
  return value;
}

/**
 * Check if a value is a boolean
 */
export function validateBoolean(value: unknown, name = 'Value'): boolean {
  if (typeof value !== 'boolean') {
    throw ValidationError.typeError(name, 'boolean', value);
  }
  return value;
}

/**
 * Check if a value is an object
 */
export function validateObject(value: unknown, name = 'Value'): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw ValidationError.typeError(name, 'object', value);
  }
  return value as Record<string, unknown>;
}

/**
 * Check if a value is an array
 */
export function validateArray<T = unknown>(value: unknown, name = 'Value'): T[] {
  if (!Array.isArray(value)) {
    throw ValidationError.typeError(name, 'array', value);
  }
  return value as T[];
}

/**
 * Check if a value is a date
 */
export function validateDate(value: unknown, name = 'Value'): Date {
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    throw ValidationError.typeError(name, 'date', value);
  }
  return value;
}

/**
 * Check if a value is one of the allowed values
 */
export function isOneOf<T>(value: unknown, allowedValues: T[], name = 'Value'): T {
  if (!allowedValues.includes(value as T)) {
    throw ValidationError.formatError(
      name,
      `one of [${allowedValues.join(', ')}]`,
      value
    );
  }
  return value as T;
}

/**
 * Alias for compatibility with other code that uses validateOneOf
 */
export const validateOneOf = isOneOf;

/**
 * Check if a string matches a regex pattern
 */
export function validatePattern(value: string, pattern: RegExp, name = 'Value'): string {
  if (!pattern.test(value)) {
    throw ValidationError.formatError(name, pattern.toString(), value);
  }
  return value;
}

/**
 * Check if a number is in a range
 */
export function validateRange(value: number, min: number, max: number, name = 'Value'): number {
  if (value < min || value > max) {
    throw ValidationError.rangeError(name, min, max, value);
  }
  return value;
}

/**
 * Check if a string has a minimum length
 */
export function validateMinLength(value: string, minLength: number, name = 'Value'): string {
  if (value.length < minLength) {
    throw new ValidationError({
      message: `${name} must be at least ${minLength} characters`,
      field: name,
      value,
      rule: 'minLength',
      code: 'MIN_LENGTH_ERROR',
      details: { minLength }
    });
  }
  return value;
}

/**
 * Check if a string has a maximum length
 */
export function validateMaxLength(value: string, maxLength: number, name = 'Value'): string {
  if (value.length > maxLength) {
    throw new ValidationError({
      message: `${name} must be at most ${maxLength} characters`,
      field: name,
      value,
      rule: 'maxLength',
      code: 'MAX_LENGTH_ERROR',
      details: { maxLength }
    });
  }
  return value;
}

/**
 * Validate a value as an email
 */
export function validateEmail(value: string, name = 'Email'): string {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return validatePattern(value, emailPattern, name);
}

export default {
  validateRequired,
  validateString,
  validateNumber,
  validateBoolean,
  validateObject,
  validateArray,
  validateDate,
  validateOneOf,
  isOneOf,
  validatePattern,
  validateRange,
  validateMinLength,
  validateMaxLength,
  validateEmail
};
