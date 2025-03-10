
import { ValidationError } from './ValidationError';

/**
 * Validates that a value is a string
 * 
 * @param value - Value to validate
 * @param path - Path for error reporting
 * @param options - Optional validation options
 * @returns The value as a string if valid
 * @throws ValidationError if validation fails
 */
export function validateString(
  value: unknown, 
  path: string,
  options: { 
    allowEmpty?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  } = {}
): string {
  const { allowEmpty = false, minLength, maxLength, pattern } = options;
  
  if (typeof value !== 'string') {
    throw new ValidationError(
      `Expected string at ${path}, got ${typeof value}`,
      path,
      value,
      'TYPE_ERROR'
    );
  }
  
  if (!allowEmpty && value.trim() === '') {
    throw new ValidationError(
      `String at ${path} cannot be empty`,
      path,
      value,
      'EMPTY_STRING'
    );
  }
  
  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(
      `String at ${path} must be at least ${minLength} characters long`,
      path,
      value,
      'MIN_LENGTH'
    );
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(
      `String at ${path} must be at most ${maxLength} characters long`,
      path,
      value,
      'MAX_LENGTH'
    );
  }
  
  if (pattern !== undefined && !pattern.test(value)) {
    throw new ValidationError(
      `String at ${path} does not match required pattern`,
      path,
      value,
      'PATTERN_MISMATCH'
    );
  }
  
  return value;
}

/**
 * Validates that a value is a number
 * 
 * @param value - Value to validate
 * @param path - Path for error reporting
 * @param options - Optional validation options
 * @returns The value as a number if valid
 * @throws ValidationError if validation fails
 */
export function validateNumber(
  value: unknown, 
  path: string,
  options: { 
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): number {
  const { min, max, integer = false } = options;
  
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError(
      `Expected number at ${path}, got ${typeof value}`,
      path,
      value,
      'TYPE_ERROR'
    );
  }
  
  if (min !== undefined && value < min) {
    throw new ValidationError(
      `Number at ${path} must be at least ${min}`,
      path,
      value,
      'MIN_VALUE'
    );
  }
  
  if (max !== undefined && value > max) {
    throw new ValidationError(
      `Number at ${path} must be at most ${max}`,
      path,
      value,
      'MAX_VALUE'
    );
  }
  
  if (integer && !Number.isInteger(value)) {
    throw new ValidationError(
      `Number at ${path} must be an integer`,
      path,
      value,
      'INTEGER_REQUIRED'
    );
  }
  
  return value;
}

/**
 * Validates that a value is a boolean
 * 
 * @param value - Value to validate
 * @param path - Path for error reporting
 * @returns The value as a boolean if valid
 * @throws ValidationError if validation fails
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
 * @returns The value as an object if valid
 * @throws ValidationError if validation fails
 */
export function validateObject<T = Record<string, unknown>>(
  value: unknown, 
  path: string
): T {
  if (typeof value !== 'object' || value === null) {
    throw new ValidationError(
      `Expected object at ${path}, got ${value === null ? 'null' : typeof value}`,
      path,
      value,
      'TYPE_ERROR'
    );
  }
  
  return value as T;
}

/**
 * Validates that a value is an array
 * 
 * @param value - Value to validate
 * @param path - Path for error reporting
 * @param options - Optional validation options
 * @returns The value as an array if valid
 * @throws ValidationError if validation fails
 */
export function validateArray<T = unknown>(
  value: unknown, 
  path: string,
  options: { 
    itemValidator?: (item: unknown, itemPath: string) => T;
    minLength?: number;
    maxLength?: number;
  } = {}
): T[] {
  const { itemValidator, minLength, maxLength } = options;
  
  if (!Array.isArray(value)) {
    throw new ValidationError(
      `Expected array at ${path}, got ${typeof value}`,
      path,
      value,
      'TYPE_ERROR'
    );
  }
  
  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(
      `Array at ${path} must have at least ${minLength} items`,
      path,
      value,
      'MIN_LENGTH'
    );
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(
      `Array at ${path} must have at most ${maxLength} items`,
      path,
      value,
      'MAX_LENGTH'
    );
  }
  
  if (itemValidator) {
    return value.map((item, index) => 
      itemValidator(item, `${path}[${index}]`)
    );
  }
  
  return value as T[];
}

/**
 * Validates that a value is one of the allowed values
 * 
 * @param value - Value to validate
 * @param allowedValues - Array of allowed values
 * @param path - Path for error reporting
 * @returns The value if it's one of the allowed values
 * @throws ValidationError if validation fails
 */
export function validateOneOf<T>(value: unknown, allowedValues: T[], path: string): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `Value at ${path} must be one of: ${allowedValues.join(', ')}`,
      path,
      value,
      'INVALID_ENUM'
    );
  }
  
  return value as T;
}

/**
 * Checks if a value is defined (not undefined or null)
 * 
 * @param value - Value to check
 * @param path - Path for error reporting
 * @returns The value if it's defined
 * @throws ValidationError if validation fails
 */
export function validateDefined<T>(value: T | undefined | null, path: string): T {
  if (value === undefined || value === null) {
    throw new ValidationError(
      `Required value at ${path} is ${value === undefined ? 'undefined' : 'null'}`,
      path,
      value,
      'REQUIRED'
    );
  }
  
  return value;
}

/**
 * Provides a default value if the input is undefined or null
 * 
 * @param value - The value to check
 * @param defaultValue - Default value to use if input is undefined or null
 * @returns The input value or the default value
 */
export function withDefault<T>(value: T | undefined | null, defaultValue: T): T {
  return (value === undefined || value === null) ? defaultValue : value;
}
