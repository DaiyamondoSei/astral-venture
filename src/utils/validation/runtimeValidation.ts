
/**
 * Runtime validation utilities
 * 
 * Provides type checking and validation functions for runtime data validation
 */

import { ValidationError } from './ValidationError';

/**
 * Validate that a value is not null or undefined
 * 
 * @param value Value to validate
 * @param name Name of the value for error messages
 * @returns The validated non-null value
 * @throws ValidationError if validation fails
 */
export function validateDefined<T>(value: T | null | undefined, name = 'value'): T {
  if (value === undefined || value === null) {
    throw ValidationError.requiredError(name);
  }
  return value;
}

/**
 * Validate that a value is a string
 * 
 * @param value Value to validate
 * @param name Name of the value for error messages
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateString(value: unknown, name = 'value'): string {
  const nonNull = validateDefined(value, name);
  
  if (typeof nonNull !== 'string') {
    throw ValidationError.typeError(name, 'string', value);
  }
  
  return nonNull;
}

/**
 * Validate that a value is a non-empty string
 * 
 * @param value Value to validate
 * @param name Name of the value for error messages
 * @returns The validated non-empty string
 * @throws ValidationError if validation fails
 */
export function validateNonEmptyString(value: unknown, name = 'value'): string {
  const str = validateString(value, name);
  
  if (str.trim() === '') {
    throw new ValidationError(`${name} cannot be empty`, { field: name, rule: 'nonEmpty' });
  }
  
  return str;
}

/**
 * Validate that a value is a number
 * 
 * @param value Value to validate
 * @param name Name of the value for error messages
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateNumber(value: unknown, name = 'value'): number {
  const nonNull = validateDefined(value, name);
  
  // Handle string numbers
  if (typeof nonNull === 'string') {
    const parsed = Number(nonNull);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  if (typeof nonNull !== 'number' || isNaN(nonNull)) {
    throw ValidationError.typeError(name, 'number', value);
  }
  
  return nonNull;
}

/**
 * Validate that a value is a boolean
 * 
 * @param value Value to validate
 * @param name Name of the value for error messages
 * @returns The validated boolean
 * @throws ValidationError if validation fails
 */
export function validateBoolean(value: unknown, name = 'value'): boolean {
  const nonNull = validateDefined(value, name);
  
  // Handle string booleans
  if (typeof nonNull === 'string') {
    if (nonNull.toLowerCase() === 'true') return true;
    if (nonNull.toLowerCase() === 'false') return false;
  }
  
  if (typeof nonNull !== 'boolean') {
    throw ValidationError.typeError(name, 'boolean', value);
  }
  
  return nonNull;
}

/**
 * Validate that a value is an object
 * 
 * @param value Value to validate
 * @param name Name of the value for error messages
 * @returns The validated object
 * @throws ValidationError if validation fails
 */
export function validateObject(value: unknown, name = 'value'): Record<string, unknown> {
  const nonNull = validateDefined(value, name);
  
  if (typeof nonNull !== 'object' || Array.isArray(nonNull) || nonNull === null) {
    throw ValidationError.typeError(name, 'object', value);
  }
  
  return nonNull as Record<string, unknown>;
}

/**
 * Validate that a value is an array
 * 
 * @param value Value to validate
 * @param itemValidator Optional validator for each item in the array
 * @param name Name of the value for error messages
 * @returns The validated array
 * @throws ValidationError if validation fails
 */
export function validateArray<T = unknown>(
  value: unknown, 
  itemValidator?: (item: unknown, index: number) => T,
  name = 'value'
): T[] {
  const nonNull = validateDefined(value, name);
  
  if (!Array.isArray(nonNull)) {
    throw ValidationError.typeError(name, 'array', value);
  }
  
  if (itemValidator) {
    try {
      return nonNull.map((item, index) => itemValidator(item, index));
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(
          `Invalid item in ${name} array: ${error.message}`,
          {
            ...error.details,
            arrayIndex: error.details.arrayIndex ?? index,
            path: `${name}[${error.details.arrayIndex ?? index}]${error.details.path ? '.' + error.details.path : ''}`
          }
        );
      }
      throw error;
    }
  }
  
  return nonNull as unknown[];
}

/**
 * Validate that a value is one of the allowed values
 * 
 * @param value Value to validate
 * @param allowedValues Array of allowed values
 * @param name Name of the value for error messages
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateOneOf<T>(value: unknown, allowedValues: T[], name = 'value'): T {
  const nonNull = validateDefined(value, name);
  
  if (!allowedValues.includes(nonNull as T)) {
    throw new ValidationError(
      `${name} must be one of: ${allowedValues.join(', ')}`,
      {
        field: name,
        rule: 'oneOf',
        allowedValues,
        actualValue: value
      }
    );
  }
  
  return nonNull as T;
}

/**
 * Validate UUID format
 * 
 * @param value Value to validate
 * @param name Name of the value for error messages
 * @returns The validated UUID string
 * @throws ValidationError if validation fails
 */
export function validateUuid(value: unknown, name = 'id'): string {
  const str = validateString(value, name);
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(str)) {
    throw new ValidationError(
      `${name} must be a valid UUID`,
      {
        field: name,
        rule: 'format',
        expectedType: 'UUID',
        actualValue: value
      }
    );
  }
  
  return str;
}

/**
 * Validate email format
 * 
 * @param value Value to validate
 * @param name Name of the value for error messages
 * @returns The validated email string
 * @throws ValidationError if validation fails
 */
export function validateEmail(value: unknown, name = 'email'): string {
  const str = validateString(value, name);
  
  // Simple email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(str)) {
    throw new ValidationError(
      `${name} must be a valid email address`,
      {
        field: name,
        rule: 'format',
        expectedType: 'email',
        actualValue: value
      }
    );
  }
  
  return str;
}

/**
 * Validate URL format
 * 
 * @param value Value to validate
 * @param name Name of the value for error messages
 * @returns The validated URL string
 * @throws ValidationError if validation fails
 */
export function validateUrl(value: unknown, name = 'url'): string {
  const str = validateString(value, name);
  
  try {
    new URL(str);
    return str;
  } catch {
    throw new ValidationError(
      `${name} must be a valid URL`,
      {
        field: name,
        rule: 'format',
        expectedType: 'URL',
        actualValue: value
      }
    );
  }
}

/**
 * Validate date format
 * 
 * @param value Value to validate
 * @param name Name of the value for error messages
 * @returns The validated Date object
 * @throws ValidationError if validation fails
 */
export function validateDate(value: unknown, name = 'date'): Date {
  const nonNull = validateDefined(value, name);
  
  if (nonNull instanceof Date) {
    if (isNaN(nonNull.getTime())) {
      throw new ValidationError(
        `${name} is an invalid Date object`,
        {
          field: name,
          rule: 'format',
          expectedType: 'Date',
          actualValue: value
        }
      );
    }
    return nonNull;
  }
  
  if (typeof nonNull === 'string' || typeof nonNull === 'number') {
    const date = new Date(nonNull);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  throw new ValidationError(
    `${name} must be a valid date`,
    {
      field: name,
      rule: 'format',
      expectedType: 'Date',
      actualValue: value
    }
  );
}

/**
 * Batch validate multiple values
 * 
 * @param validators Object of validation functions
 * @returns Object with validated values
 * @throws ValidationError if any validation fails
 */
export function validateBatch<T extends Record<string, unknown>>(
  validators: { [K in keyof T]: (value: unknown) => T[K] }
): T {
  const errors: ValidationError[] = [];
  const result = {} as T;
  
  for (const key in validators) {
    try {
      result[key] = validators[key](undefined);
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error);
      } else {
        throw error;
      }
    }
  }
  
  if (errors.length > 0) {
    throw new ValidationError(
      `Multiple validation errors occurred`,
      {
        allErrors: errors,
        rule: 'batch'
      }
    );
  }
  
  return result;
}
