
/**
 * Runtime validation utilities to ensure type safety at runtime
 */

import { ValidationError } from './ValidationError';

/**
 * Validate that a value is defined (not null or undefined)
 * 
 * @param value Value to validate
 * @param fieldName Name of the field for error message
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateDefined<T>(
  value: T | null | undefined,
  fieldName: string
): T {
  if (value === null || value === undefined) {
    throw new ValidationError(`${fieldName} is required but was not provided`, {
      field: fieldName,
      expectedType: 'defined',
      rule: 'required'
    });
  }
  return value;
}

/**
 * Validate that a value is a string
 * 
 * @param value Value to validate
 * @param fieldName Name of the field for error message
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateString(
  value: unknown,
  fieldName: string
): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, {
      field: fieldName,
      expectedType: 'string',
      rule: 'type'
    });
  }
  return value;
}

/**
 * Validate that a value is a number
 * 
 * @param value Value to validate
 * @param fieldName Name of the field for error message
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateNumber(
  value: unknown,
  fieldName: string
): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`, {
      field: fieldName,
      expectedType: 'number',
      rule: 'type'
    });
  }
  return value;
}

/**
 * Validate that a value is a boolean
 * 
 * @param value Value to validate
 * @param fieldName Name of the field for error message
 * @returns The validated boolean
 * @throws ValidationError if validation fails
 */
export function validateBoolean(
  value: unknown,
  fieldName: string
): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`, {
      field: fieldName,
      expectedType: 'boolean',
      rule: 'type'
    });
  }
  return value;
}

/**
 * Validate that a value is an object
 * 
 * @param value Value to validate
 * @param fieldName Name of the field for error message
 * @returns The validated object
 * @throws ValidationError if validation fails
 */
export function validateObject(
  value: unknown,
  fieldName: string
): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`, {
      field: fieldName,
      expectedType: 'object',
      rule: 'type'
    });
  }
  return value as Record<string, unknown>;
}

/**
 * Validate that a value is an array
 * 
 * @param value Value to validate
 * @param fieldName Name of the field for error message
 * @returns The validated array
 * @throws ValidationError if validation fails
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string
): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, {
      field: fieldName,
      expectedType: 'array',
      rule: 'type'
    });
  }
  return value as T[];
}

/**
 * Validate that a value is one of a set of valid values
 * 
 * @param value Value to validate
 * @param validValues Array of valid values
 * @param fieldName Name of the field for error message
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateOneOf<T>(
  value: unknown,
  validValues: T[],
  fieldName: string
): T {
  if (!validValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${validValues.join(', ')}`,
      {
        field: fieldName,
        expectedType: validValues.join('|'),
        rule: 'enum'
      }
    );
  }
  return value as T;
}

/**
 * Type guard to check if an error is a ValidationError
 */
export { isValidationError } from './ValidationError';

export default {
  validateDefined,
  validateString,
  validateNumber,
  validateBoolean,
  validateObject,
  validateArray,
  validateOneOf,
  isValidationError
};
