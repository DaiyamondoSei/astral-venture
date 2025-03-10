
/**
 * Runtime Validation Utilities
 * 
 * Type validation functions that run at runtime
 */

import { ValidationError } from './ValidationError';

/**
 * Check if a value is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Validate that a value is defined (not null or undefined)
 */
export function validateDefined<T>(value: T | null | undefined, name = 'value'): T {
  if (value === null || value === undefined) {
    throw new ValidationError({
      message: `${name} is required, but got ${value}`,
      field: name,
      rule: 'required',
      value
    });
  }
  return value;
}

/**
 * Validate that a value is a string
 */
export function validateString(value: unknown, name = 'value'): string {
  if (typeof value !== 'string') {
    throw new ValidationError({
      message: `${name} must be a string, but got ${typeof value}`,
      field: name,
      expectedType: 'string',
      rule: 'type',
      value
    });
  }
  return value;
}

/**
 * Validate that a value is a number
 */
export function validateNumber(value: unknown, name = 'value'): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError({
      message: `${name} must be a number, but got ${typeof value}`,
      field: name,
      expectedType: 'number',
      rule: 'type',
      value
    });
  }
  return value;
}

/**
 * Validate that a value is a boolean
 */
export function validateBoolean(value: unknown, name = 'value'): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError({
      message: `${name} must be a boolean, but got ${typeof value}`,
      field: name,
      expectedType: 'boolean',
      rule: 'type',
      value
    });
  }
  return value;
}

/**
 * Validate that a value is a valid date
 */
export function validateDate(value: unknown, name = 'value'): Date {
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    throw new ValidationError({
      message: `${name} must be a valid Date, but got ${value}`,
      field: name,
      expectedType: 'Date',
      rule: 'type',
      value
    });
  }
  return value;
}

/**
 * Validate that a value is an object
 */
export function validateObject(value: unknown, name = 'value'): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError({
      message: `${name} must be an object, but got ${typeof value}`,
      field: name,
      expectedType: 'object',
      rule: 'type',
      value
    });
  }
  return value as Record<string, unknown>;
}

/**
 * Validate that a value is an array
 */
export function validateArray<T = unknown>(value: unknown, itemValidator?: (item: unknown, index: number) => T, name = 'value'): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError({
      message: `${name} must be an array, but got ${typeof value}`,
      field: name,
      expectedType: 'array',
      rule: 'type',
      value
    });
  }
  
  // Apply item validator if provided
  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError({
            message: `${name}[${index}]: ${error.message}`,
            field: `${name}[${index}]`,
            rule: error.rule,
            value: item,
            originalError: error
          });
        }
        throw error;
      }
    });
  }

  return value as unknown[];
}

/**
 * Validate that a value is one of the allowed values
 */
export function validateOneOf<T extends string | number>(
  value: unknown,
  allowedValues: readonly T[],
  name = 'value'
): T {
  // First ensure it's the right type
  const valueType = typeof allowedValues[0];
  if (typeof value !== valueType) {
    throw new ValidationError({
      message: `${name} must be a ${valueType}, but got ${typeof value}`,
      field: name,
      expectedType: valueType,
      rule: 'type',
      value
    });
  }
  
  // Then validate it's one of the allowed values
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError({
      message: `${name} must be one of [${allowedValues.join(', ')}], but got ${value}`,
      field: name,
      rule: 'oneOf',
      value
    });
  }
  
  return value as T;
}

/**
 * Validate an email address
 */
export function validateEmail(value: unknown, name = 'email'): string {
  const email = validateString(value, name);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new ValidationError({
      message: `${name} must be a valid email address`,
      field: name,
      rule: 'format',
      value
    });
  }
  
  return email;
}

/**
 * Validate a URL
 */
export function validateUrl(value: unknown, name = 'url'): string {
  const url = validateString(value, name);
  
  try {
    new URL(url);
    return url;
  } catch {
    throw new ValidationError({
      message: `${name} must be a valid URL`,
      field: name,
      rule: 'format',
      value
    });
  }
}

/**
 * Validate a UUID
 */
export function validateUuid(value: unknown, name = 'id'): string {
  const id = validateString(value, name);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    throw new ValidationError({
      message: `${name} must be a valid UUID`,
      field: name,
      rule: 'format',
      value
    });
  }
  
  return id;
}

/**
 * Validate a non-empty string
 */
export function validateNonEmptyString(value: unknown, name = 'value'): string {
  const str = validateString(value, name);
  
  if (str.trim() === '') {
    throw new ValidationError({
      message: `${name} cannot be empty`,
      field: name,
      rule: 'minLength',
      value
    });
  }
  
  return str;
}

export default {
  validateDefined,
  validateString,
  validateNumber,
  validateBoolean,
  validateDate,
  validateObject,
  validateArray,
  validateOneOf,
  validateEmail,
  validateUrl,
  validateUuid,
  validateNonEmptyString,
  isValidationError
};
