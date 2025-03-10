/**
 * Runtime type validation utilities
 */

import { z } from 'zod';

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  code?: string;
  path?: string;
  
  constructor(message: string, code?: string, path?: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.path = path;
  }
}

/**
 * Check if a value matches one of the allowed values
 */
export function validateOneOf<T>(value: unknown, allowedValues: T[], name = 'value'): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${name} must be one of: ${allowedValues.join(', ')}`,
      'INVALID_VALUE'
    );
  }
  return value as T;
}

/**
 * Validate a value is a string
 * 
 * @param value - Value to validate
 * @param name - Name of the value (for error messages)
 * @returns The validated string
 * @throws Error if validation fails
 */
export function validateString(value: unknown, name = 'value'): string {
  if (value === null || value === undefined) {
    throw new Error(`${name} is required and must be a string`);
  }
  
  if (typeof value !== 'string') {
    throw new Error(`${name} must be a string, got ${typeof value}`);
  }
  
  return value;
}

/**
 * Validate a value is a number
 * 
 * @param value - Value to validate
 * @param name - Name of the value (for error messages)
 * @returns The validated number
 * @throws Error if validation fails
 */
export function validateNumber(value: unknown, name = 'value'): number {
  if (value === null || value === undefined) {
    throw new Error(`${name} is required and must be a number`);
  }
  
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${name} must be a number, got ${typeof value}`);
  }
  
  return value;
}

/**
 * Validate a value is a boolean
 * 
 * @param value - Value to validate
 * @param name - Name of the value (for error messages)
 * @returns The validated boolean
 * @throws Error if validation fails
 */
export function validateBoolean(value: unknown, name = 'value'): boolean {
  if (value === null || value === undefined) {
    throw new Error(`${name} is required and must be a boolean`);
  }
  
  if (typeof value !== 'boolean') {
    throw new Error(`${name} must be a boolean, got ${typeof value}`);
  }
  
  return value;
}

/**
 * Validate a value is an array
 * 
 * @param value - Value to validate
 * @param name - Name of the value (for error messages)
 * @returns The validated array
 * @throws Error if validation fails
 */
export function validateArray<T = unknown>(value: unknown, name = 'value'): T[] {
  if (value === null || value === undefined) {
    throw new Error(`${name} is required and must be an array`);
  }
  
  if (!Array.isArray(value)) {
    throw new Error(`${name} must be an array, got ${typeof value}`);
  }
  
  return value as T[];
}

/**
 * Validate a value is an object
 * 
 * @param value - Value to validate
 * @param name - Name of the value (for error messages)
 * @returns The validated object
 * @throws Error if validation fails
 */
export function validateObject<T extends object = Record<string, unknown>>(
  value: unknown, 
  name = 'value'
): T {
  if (value === null || value === undefined) {
    throw new Error(`${name} is required and must be an object`);
  }
  
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name} must be an object, got ${typeof value}`);
  }
  
  return value as T;
}

/**
 * Validate a value matches a pattern
 * 
 * @param value - Value to validate
 * @param pattern - RegExp pattern to match
 * @param name - Name of the value (for error messages)
 * @returns The validated string
 * @throws Error if validation fails
 */
export function validatePattern(
  value: unknown, 
  pattern: RegExp, 
  name = 'value'
): string {
  const str = validateString(value, name);
  
  if (!pattern.test(str)) {
    throw new Error(`${name} does not match the required pattern ${pattern}`);
  }
  
  return str;
}

/**
 * Validate a value is within range
 * 
 * @param value - Value to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param name - Name of the value (for error messages)
 * @returns The validated number
 * @throws Error if validation fails
 */
export function validateRange(
  value: unknown, 
  min: number, 
  max: number, 
  name = 'value'
): number {
  const num = validateNumber(value, name);
  
  if (num < min || num > max) {
    throw new Error(`${name} must be between ${min} and ${max}, got ${num}`);
  }
  
  return num;
}

/**
 * Validate that a value is defined and matches expected type
 */
export function validateDefined<T>(value: T | null | undefined, name = 'value'): T {
  if (value === null || value === undefined) {
    throw new ValidationError(`${name} is required`, 'REQUIRED_VALUE');
  }
  return value;
}

/**
 * Compose multiple validators
 * 
 * @param validators - Array of validator functions
 * @returns A function that runs all validators
 */
export function composeValidators<T>(...validators: ((value: unknown) => T)[]): (value: unknown) => T {
  return (value: unknown): T => {
    return validators.reduce((result, validator) => validator(result), value) as T;
  };
}

/**
 * Creates a Zod validator function from a schema
 * 
 * @param schema - Zod schema
 * @returns Validator function
 */
export function createValidator<T>(schema: z.ZodType<T>): (value: unknown) => T {
  return (value: unknown): T => {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new Error(`Validation error: ${result.error.message}`);
    }
    return result.data;
  };
}
