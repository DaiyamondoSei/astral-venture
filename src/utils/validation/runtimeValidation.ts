
import { ValidationError } from './ValidationError';

/**
 * Validates that a value is defined (not undefined or null)
 * 
 * @param value - Value to validate
 * @param name - Name for error messages
 * @returns The value if it's defined
 * @throws ValidationError if validation fails
 */
export function validateDefined<T>(value: T | undefined | null, name: string): T {
  if (value === undefined || value === null) {
    throw new ValidationError(`${name} is required but was ${value === null ? 'null' : 'undefined'}`, {
      expectedType: 'defined',
      rule: 'required'
    });
  }
  return value;
}

/**
 * Validates that a value is a string
 * 
 * @param value - Value to validate
 * @param name - Name for error messages
 * @returns The value as a string
 * @throws ValidationError if validation fails
 */
export function validateString(value: unknown, name: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${name} must be a string, but got ${typeof value}`, {
      expectedType: 'string'
    });
  }
  return value;
}

/**
 * Validates that a value is a non-empty string
 * 
 * @param value - Value to validate
 * @param name - Name for error messages
 * @returns The value as a string
 * @throws ValidationError if validation fails
 */
export function validateNonEmptyString(value: unknown, name: string): string {
  const str = validateString(value, name);
  if (str.trim() === '') {
    throw new ValidationError(`${name} cannot be empty`, {
      expectedType: 'non-empty string',
      rule: 'minLength'
    });
  }
  return str;
}

/**
 * Validates that a value is a number
 * 
 * @param value - Value to validate
 * @param name - Name for error messages
 * @returns The value as a number
 * @throws ValidationError if validation fails
 */
export function validateNumber(value: unknown, name: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${name} must be a number, but got ${typeof value}`, {
      expectedType: 'number'
    });
  }
  return value;
}

/**
 * Validates that a value is a boolean
 * 
 * @param value - Value to validate
 * @param name - Name for error messages
 * @returns The value as a boolean
 * @throws ValidationError if validation fails
 */
export function validateBoolean(value: unknown, name: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${name} must be a boolean, but got ${typeof value}`, {
      expectedType: 'boolean'
    });
  }
  return value;
}

/**
 * Validates that a value is an object
 * 
 * @param value - Value to validate
 * @param name - Name for error messages
 * @returns The value as an object
 * @throws ValidationError if validation fails
 */
export function validateObject(value: unknown, name: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${name} must be an object, but got ${value === null ? 'null' : typeof value}`, {
      expectedType: 'object'
    });
  }
  return value as Record<string, unknown>;
}

/**
 * Validates that a value is an array
 * 
 * @param value - Value to validate
 * @param name - Name for error messages
 * @returns The value as an array
 * @throws ValidationError if validation fails
 */
export function validateArray<T>(value: unknown, name: string): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${name} must be an array, but got ${typeof value}`, {
      expectedType: 'array'
    });
  }
  return value as T[];
}

/**
 * Validates that a value is one of the allowed values
 * 
 * @param value - Value to validate
 * @param allowedValues - Array of allowed values
 * @param name - Name for error messages
 * @returns The value if it's in allowedValues
 * @throws ValidationError if validation fails
 */
export function validateOneOf<T>(value: unknown, allowedValues: T[], name: string): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${name} must be one of [${allowedValues.join(', ')}], but got ${String(value)}`,
      {
        expectedType: 'oneOf',
        rule: 'enum',
        details: { allowedValues }
      }
    );
  }
  return value as T;
}

/**
 * Validates that a value matches a regular expression
 * 
 * @param value - String value to validate
 * @param pattern - RegExp to match against
 * @param name - Name for error messages
 * @returns The value if it matches the pattern
 * @throws ValidationError if validation fails
 */
export function validatePattern(value: unknown, pattern: RegExp, name: string): string {
  const str = validateString(value, name);
  if (!pattern.test(str)) {
    throw new ValidationError(`${name} doesn't match required pattern ${pattern}`, {
      expectedType: 'pattern match',
      rule: 'pattern',
      details: { pattern: pattern.toString() }
    });
  }
  return str;
}

/**
 * Validates that a number is within a range
 * 
 * @param value - Number to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @param name - Name for error messages
 * @returns The value if it's within range
 * @throws ValidationError if validation fails
 */
export function validateRange(value: unknown, min: number, max: number, name: string): number {
  const num = validateNumber(value, name);
  if (num < min || num > max) {
    throw new ValidationError(`${name} must be between ${min} and ${max}, but got ${num}`, {
      expectedType: 'number in range',
      rule: 'range',
      details: { min, max }
    });
  }
  return num;
}

/**
 * Validates a date string or Date object
 * 
 * @param value - Value to validate
 * @param name - Name for error messages
 * @returns A valid Date object
 * @throws ValidationError if validation fails
 */
export function validateDate(value: unknown, name: string): Date {
  let date: Date;
  
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    date = new Date(value);
  } else {
    throw new ValidationError(`${name} must be a Date or date string, but got ${typeof value}`, {
      expectedType: 'date'
    });
  }
  
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${name} is an invalid date`, {
      expectedType: 'valid date'
    });
  }
  
  return date;
}

/**
 * Validates a UUID string
 * 
 * @param value - Value to validate
 * @param name - Name for error messages
 * @returns The UUID string
 * @throws ValidationError if validation fails
 */
export function validateUUID(value: unknown, name: string): string {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return validatePattern(value, uuidPattern, name);
}

/**
 * Validates an email address
 * 
 * @param value - Value to validate
 * @param name - Name for error messages
 * @returns The email string
 * @throws ValidationError if validation fails
 */
export function validateEmail(value: unknown, name: string): string {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return validatePattern(value, emailPattern, name);
}

export default {
  validateDefined,
  validateString,
  validateNonEmptyString,
  validateNumber,
  validateBoolean,
  validateObject,
  validateArray,
  validateOneOf,
  validatePattern,
  validateRange,
  validateDate,
  validateUUID,
  validateEmail
};
