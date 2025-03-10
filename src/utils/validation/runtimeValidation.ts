
import { ValidationError } from './ValidationError';

/**
 * Validate that a value is defined (not null or undefined)
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @returns The validated value
 * @throws ValidationError if the value is null or undefined
 */
export function validateDefined<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throw new ValidationError(`${fieldName} is required, but received ${value}`, {
      field: fieldName,
      expectedType: 'non-null'
    });
  }
  return value;
}

/**
 * Validate that a value is a string
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @returns The validated string
 * @throws ValidationError if the value is not a string
 */
export function validateString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string, but received ${typeof value}`, {
      field: fieldName,
      expectedType: 'string'
    });
  }
  return value;
}

/**
 * Validate that a value is a number
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @returns The validated number
 * @throws ValidationError if the value is not a number
 */
export function validateNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number, but received ${typeof value}`, {
      field: fieldName,
      expectedType: 'number'
    });
  }
  return value;
}

/**
 * Validate that a value is a boolean
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @returns The validated boolean
 * @throws ValidationError if the value is not a boolean
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean, but received ${typeof value}`, {
      field: fieldName,
      expectedType: 'boolean'
    });
  }
  return value;
}

/**
 * Validate that a value is an array
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @returns The validated array
 * @throws ValidationError if the value is not an array
 */
export function validateArray<T>(value: unknown, fieldName: string): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array, but received ${typeof value}`, {
      field: fieldName,
      expectedType: 'array'
    });
  }
  return value as T[];
}

/**
 * Validate that a value is an object
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @returns The validated object
 * @throws ValidationError if the value is not an object
 */
export function validateObject<T extends object>(value: unknown, fieldName: string): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object, but received ${value === null ? 'null' : typeof value}`, {
      field: fieldName,
      expectedType: 'object'
    });
  }
  return value as T;
}

/**
 * Validate that a value is a date
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @returns The validated date
 * @throws ValidationError if the value is not a valid date
 */
export function validateDate(value: unknown, fieldName: string): Date {
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date, but received ${typeof value}`, {
      field: fieldName,
      expectedType: 'Date'
    });
  }
  return value;
}

/**
 * Validate that a value matches a specific type from a list of valid values
 * 
 * @param value The value to validate
 * @param validValues Array of valid values
 * @param fieldName Name of the field for error reporting
 * @returns The validated value
 * @throws ValidationError if the value is not in the list of valid values
 */
export function validateEnum<T extends string | number>(
  value: unknown,
  validValues: readonly T[],
  fieldName: string
): T {
  if (!validValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of [${validValues.join(', ')}], but received ${value}`,
      {
        field: fieldName,
        expectedType: `one of [${validValues.join(', ')}]`
      }
    );
  }
  return value as T;
}

/**
 * Check if a value is a validation error
 * 
 * @param error Error to check
 * @returns Whether the error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export default {
  validateDefined,
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateDate,
  validateEnum,
  isValidationError
};
