
import { ValidationError, isValidationError } from './ValidationError';

/**
 * Validates that a value is a string
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @param options - Optional validation options
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateString(
  value: unknown, 
  fieldName: string,
  options?: { 
    minLength?: number; 
    maxLength?: number;
    pattern?: RegExp;
  }
): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, {
      expectedType: 'string',
      rule: 'type'
    });
  }

  if (options?.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.minLength} characters long`,
      {
        rule: 'minLength',
        details: { minLength: options.minLength, actualLength: value.length }
      }
    );
  }

  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.maxLength} characters long`,
      {
        rule: 'maxLength',
        details: { maxLength: options.maxLength, actualLength: value.length }
      }
    );
  }

  if (options?.pattern !== undefined && !options.pattern.test(value)) {
    throw new ValidationError(
      `${fieldName} does not match the required pattern`,
      {
        rule: 'pattern',
        details: { pattern: options.pattern.toString() }
      }
    );
  }

  return value;
}

/**
 * Validates that a value is a number
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @param options - Optional validation options
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateNumber(
  value: unknown, 
  fieldName: string,
  options?: { 
    min?: number; 
    max?: number;
    integer?: boolean;
  }
): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`, {
      expectedType: 'number',
      rule: 'type'
    });
  }

  if (options?.integer === true && !Number.isInteger(value)) {
    throw new ValidationError(`${fieldName} must be an integer`, {
      rule: 'integer'
    });
  }

  if (options?.min !== undefined && value < options.min) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.min}`,
      {
        rule: 'min',
        details: { min: options.min, actual: value }
      }
    );
  }

  if (options?.max !== undefined && value > options.max) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.max}`,
      {
        rule: 'max',
        details: { max: options.max, actual: value }
      }
    );
  }

  return value;
}

/**
 * Validates that a value is a boolean
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns The validated boolean
 * @throws ValidationError if validation fails
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`, {
      expectedType: 'boolean',
      rule: 'type'
    });
  }

  return value;
}

/**
 * Validates that a value is an array
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @param options - Optional validation options
 * @returns The validated array
 * @throws ValidationError if validation fails
 */
export function validateArray<T>(
  value: unknown, 
  fieldName: string,
  options?: {
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: unknown, index: number) => T;
  }
): T[] | unknown[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, {
      expectedType: 'array',
      rule: 'type'
    });
  }

  if (options?.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(
      `${fieldName} must contain at least ${options.minLength} items`,
      {
        rule: 'minLength',
        details: { minLength: options.minLength, actualLength: value.length }
      }
    );
  }

  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must contain at most ${options.maxLength} items`,
      {
        rule: 'maxLength',
        details: { maxLength: options.maxLength, actualLength: value.length }
      }
    );
  }

  if (options?.itemValidator) {
    return value.map((item, index) => options.itemValidator!(item, index));
  }

  return value;
}

/**
 * Validates that a value is an object
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns The validated object
 * @throws ValidationError if validation fails
 */
export function validateObject(
  value: unknown, 
  fieldName: string
): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`, {
      expectedType: 'object',
      rule: 'type'
    });
  }

  return value as Record<string, unknown>;
}

/**
 * Validates that a value is one of the allowed values
 * 
 * @param value - The value to validate
 * @param allowedValues - The allowed values
 * @param fieldName - The name of the field being validated
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateOneOf<T>(
  value: unknown, 
  allowedValues: readonly T[], 
  fieldName: string
): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      {
        rule: 'oneOf',
        details: { allowedValues, actualValue: value }
      }
    );
  }

  return value as T;
}

/**
 * Validates that a value is defined (not undefined)
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateDefined<T>(
  value: T | undefined, 
  fieldName: string
): T {
  if (value === undefined) {
    throw new ValidationError(`${fieldName} is required`, {
      rule: 'required'
    });
  }

  return value;
}

/**
 * Applies a default value if the input is undefined
 * 
 * @param value - The value to check
 * @param defaultValue - The default value to use if value is undefined
 * @returns The original value or the default value
 */
export function withDefault<T>(value: T | undefined, defaultValue: T): T {
  return value === undefined ? defaultValue : value;
}

/**
 * Validates that a value matches a specific shape (object structure)
 * 
 * @param value - The value to validate
 * @param shape - The shape definition
 * @param fieldName - The name of the field being validated
 * @returns The validated object
 * @throws ValidationError if validation fails
 */
export function validateShape<T extends Record<string, unknown>>(
  value: unknown,
  shape: Record<keyof T, (value: unknown, fieldName: string) => unknown>,
  fieldName: string = 'object'
): T {
  const obj = validateObject(value, fieldName);
  const result: Record<string, unknown> = {};

  for (const key in shape) {
    if (Object.prototype.hasOwnProperty.call(shape, key)) {
      try {
        result[key] = shape[key](obj[key], `${fieldName}.${key}`);
      } catch (error) {
        if (isValidationError(error)) {
          throw error;
        }
        throw new ValidationError(`Invalid ${fieldName}.${key}: ${error}`, {
          rule: 'shape',
          details: { key, error: String(error) }
        });
      }
    }
  }

  return result as T;
}

export default {
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateOneOf,
  validateDefined,
  withDefault,
  validateShape,
  isValidationError
};
