
/**
 * Runtime validation utilities for type safety
 */

import { ValidationError } from './ValidationError';

/**
 * Validate that a value is defined (not null or undefined)
 */
export function validateDefined<T>(
  value: T | null | undefined, 
  fieldName: string
): T {
  if (value === null || value === undefined) {
    throw ValidationError.requiredError(fieldName);
  }
  return value;
}

/**
 * Validate that a value is a string
 */
export function validateString(
  value: unknown, 
  fieldName: string,
  options: { minLength?: number; maxLength?: number; pattern?: RegExp } = {}
): string {
  if (typeof value !== 'string') {
    throw ValidationError.typeError(value, 'string', fieldName);
  }
  
  const { minLength, maxLength, pattern } = options;
  
  if (minLength !== undefined && value.length < minLength) {
    throw ValidationError.constraintError(
      fieldName,
      'minLength',
      `String must be at least ${minLength} characters`
    );
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    throw ValidationError.constraintError(
      fieldName,
      'maxLength',
      `String must be at most ${maxLength} characters`
    );
  }
  
  if (pattern !== undefined && !pattern.test(value)) {
    throw ValidationError.constraintError(
      fieldName,
      'pattern',
      `String must match pattern ${pattern}`
    );
  }
  
  return value;
}

/**
 * Validate that a value is a number
 */
export function validateNumber(
  value: unknown, 
  fieldName: string,
  options: { min?: number; max?: number; integer?: boolean } = {}
): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw ValidationError.typeError(value, 'number', fieldName);
  }
  
  const { min, max, integer } = options;
  
  if (min !== undefined && value < min) {
    throw ValidationError.rangeError(fieldName, min, max, value);
  }
  
  if (max !== undefined && value > max) {
    throw ValidationError.rangeError(fieldName, min, max, value);
  }
  
  if (integer === true && !Number.isInteger(value)) {
    throw ValidationError.constraintError(
      fieldName,
      'integer',
      'Value must be an integer'
    );
  }
  
  return value;
}

/**
 * Validate that a value is a boolean
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw ValidationError.typeError(value, 'boolean', fieldName);
  }
  return value;
}

/**
 * Validate that a value is an array
 */
export function validateArray<T>(
  value: unknown, 
  fieldName: string,
  options: { 
    minLength?: number; 
    maxLength?: number; 
    itemValidator?: (item: unknown, index: number) => T 
  } = {}
): T[] {
  if (!Array.isArray(value)) {
    throw ValidationError.typeError(value, 'array', fieldName);
  }
  
  const { minLength, maxLength, itemValidator } = options;
  
  if (minLength !== undefined && value.length < minLength) {
    throw ValidationError.constraintError(
      fieldName,
      'minLength',
      `Array must have at least ${minLength} items`
    );
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    throw ValidationError.constraintError(
      fieldName,
      'maxLength',
      `Array must have at most ${maxLength} items`
    );
  }
  
  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(
            `Invalid item at index ${index} in array ${fieldName}: ${error.message}`,
            {
              field: `${fieldName}[${index}]`,
              rule: error.rule,
              details: error.details,
              originalError: error
            }
          );
        }
        throw error;
      }
    });
  }
  
  return value as T[];
}

/**
 * Validate that a value is an object
 */
export function validateObject<T extends object>(
  value: unknown, 
  fieldName: string
): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw ValidationError.typeError(value, 'object', fieldName);
  }
  return value as T;
}

/**
 * Validate an email address
 */
export function validateEmail(value: unknown, fieldName: string): string {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const email = validateString(value, fieldName);
  
  if (!emailRegex.test(email)) {
    throw ValidationError.formatError(fieldName, 'email', email);
  }
  
  return email;
}

/**
 * Validate a URL
 */
export function validateUrl(
  value: unknown, 
  fieldName: string,
  options: { protocols?: string[] } = {}
): string {
  const url = validateString(value, fieldName);
  
  try {
    const urlObj = new URL(url);
    
    if (options.protocols && options.protocols.length > 0) {
      const protocol = urlObj.protocol.replace(':', '');
      if (!options.protocols.includes(protocol)) {
        throw ValidationError.constraintError(
          fieldName,
          'protocol',
          `URL must use one of these protocols: ${options.protocols.join(', ')}`
        );
      }
    }
    
    return url;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw ValidationError.formatError(fieldName, 'URL', url);
  }
}

/**
 * Validate a date string or object
 */
export function validateDate(
  value: unknown, 
  fieldName: string
): Date {
  let date: Date;
  
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
  } else {
    throw ValidationError.typeError(value, 'Date, string, or number', fieldName);
  }
  
  if (isNaN(date.getTime())) {
    throw ValidationError.formatError(fieldName, 'date', String(value));
  }
  
  return date;
}

/**
 * Validate a UUID string
 */
export function validateUuid(value: unknown, fieldName: string): string {
  const uuid = validateString(value, fieldName);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(uuid)) {
    throw ValidationError.formatError(fieldName, 'UUID', uuid);
  }
  
  return uuid;
}

/**
 * Validate an enumeration value
 */
export function validateEnum<T extends string | number>(
  value: unknown, 
  fieldName: string,
  allowedValues: T[]
): T {
  if (!allowedValues.includes(value as T)) {
    throw ValidationError.constraintError(
      fieldName,
      'enum',
      `Value must be one of: ${allowedValues.join(', ')}`
    );
  }
  
  return value as T;
}

/**
 * Create a validator for optional values
 */
export function optional<T>(
  validator: (value: unknown, fieldName: string) => T,
  defaultValue?: T
): (value: unknown, fieldName: string) => T | undefined {
  return (value: unknown, fieldName: string): T | undefined => {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return validator(value, fieldName);
  };
}
