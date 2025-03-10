
/**
 * Runtime Validation Utilities
 * 
 * This module provides utility functions for validating data at runtime.
 * It helps ensure that data matches expected types and formats.
 */

import { ValidationError } from './ValidationError';

/**
 * Validates that a value is defined (not null or undefined)
 */
export function validateDefined<T>(
  value: T | null | undefined, 
  fieldName: string
): T {
  if (value === null || value === undefined) {
    throw ValidationError.requiredField(fieldName);
  }
  return value;
}

/**
 * Validates that a value is a string
 */
export function validateString(
  value: unknown, 
  fieldName: string
): string {
  if (typeof value !== 'string') {
    throw ValidationError.invalidType(fieldName, 'string', value);
  }
  return value;
}

/**
 * Validates that a value is a number
 */
export function validateNumber(
  value: unknown, 
  fieldName: string
): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw ValidationError.invalidType(fieldName, 'number', value);
  }
  return value;
}

/**
 * Validates that a value is a boolean
 */
export function validateBoolean(
  value: unknown, 
  fieldName: string
): boolean {
  if (typeof value !== 'boolean') {
    throw ValidationError.invalidType(fieldName, 'boolean', value);
  }
  return value;
}

/**
 * Validates that a value is an array
 */
export function validateArray<T>(
  value: unknown, 
  fieldName: string,
  itemValidator?: (item: unknown, index: number) => T
): T[] {
  if (!Array.isArray(value)) {
    throw ValidationError.invalidType(fieldName, 'array', value);
  }
  
  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          error.field = `${fieldName}[${index}].${error.field}`;
        }
        throw error;
      }
    });
  }
  
  return value as T[];
}

/**
 * Validates that a value is an object
 */
export function validateObject<T extends object = Record<string, unknown>>(
  value: unknown, 
  fieldName: string
): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw ValidationError.invalidType(fieldName, 'object', value);
  }
  return value as T;
}

/**
 * Validates that a string matches a specific format using a regular expression
 */
export function validateStringFormat(
  value: unknown, 
  fieldName: string,
  regex: RegExp,
  formatName: string
): string {
  const str = validateString(value, fieldName);
  
  if (!regex.test(str)) {
    throw ValidationError.invalidFormat(fieldName, formatName, str);
  }
  
  return str;
}

/**
 * Validates that a string has a specific length or range of lengths
 */
export function validateStringLength(
  value: unknown,
  fieldName: string,
  minLength: number | null = null,
  maxLength: number | null = null
): string {
  const str = validateString(value, fieldName);
  
  if (minLength !== null && str.length < minLength) {
    throw ValidationError.invalidLength(fieldName, minLength, maxLength, str);
  }
  
  if (maxLength !== null && str.length > maxLength) {
    throw ValidationError.invalidLength(fieldName, minLength, maxLength, str);
  }
  
  return str;
}

/**
 * Validates that a number is within a specific range
 */
export function validateNumberRange(
  value: unknown,
  fieldName: string,
  min: number | null = null,
  max: number | null = null
): number {
  const num = validateNumber(value, fieldName);
  
  if (min !== null && num < min) {
    throw ValidationError.outOfRange(fieldName, min, max, num);
  }
  
  if (max !== null && num > max) {
    throw ValidationError.outOfRange(fieldName, min, max, num);
  }
  
  return num;
}

/**
 * Validates an email address format
 */
export function validateEmail(value: unknown, fieldName: string = 'email'): string {
  return validateStringFormat(
    value,
    fieldName,
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'email address'
  );
}

/**
 * Validates a UUID format
 */
export function validateUUID(value: unknown, fieldName: string): string {
  return validateStringFormat(
    value,
    fieldName,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    'UUID'
  );
}

/**
 * Safe type assertion - returns a default value if validation fails
 */
export function safeValidate<T>(
  validator: () => T,
  defaultValue: T
): T {
  try {
    return validator();
  } catch (error) {
    return defaultValue;
  }
}

export default {
  validateDefined,
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateStringFormat,
  validateStringLength,
  validateNumberRange,
  validateEmail,
  validateUUID,
  safeValidate
};
