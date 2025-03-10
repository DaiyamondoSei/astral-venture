
/**
 * Runtime Type Validation Utilities
 * 
 * Provides utilities for validating data types at runtime with detailed errors.
 */

import ValidationError, { isValidationError } from './ValidationError';

/**
 * Validates that a value is not undefined or null
 */
export function validateRequired(
  value: unknown, 
  fieldName: string, 
  message?: string
): void {
  if (value === undefined || value === null) {
    throw ValidationError.requiredError(fieldName, message);
  }
}

/**
 * Validates that a value is of a specific primitive type
 */
export function validateType(
  value: unknown, 
  expectedType: 'string' | 'number' | 'boolean' | 'object' | 'function' | 'symbol' | 'bigint', 
  fieldName: string,
  message?: string
): void {
  // Skip validation for null/undefined to avoid confusing errors
  if (value === null || value === undefined) {
    return;
  }
  
  if (typeof value !== expectedType) {
    throw ValidationError.typeError(
      fieldName, 
      expectedType, 
      value,
      message
    );
  }
}

/**
 * Validates that a value is an array
 */
export function validateArray(
  value: unknown, 
  fieldName: string,
  message?: string
): void {
  // Skip validation for null/undefined to avoid confusing errors
  if (value === null || value === undefined) {
    return;
  }
  
  if (!Array.isArray(value)) {
    throw ValidationError.typeError(
      fieldName, 
      'array', 
      value,
      message
    );
  }
}

/**
 * Validates that a value is one of the allowed values
 */
export function validateOneOf<T>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string,
  message?: string
): void {
  // Skip validation for null/undefined to avoid confusing errors
  if (value === null || value === undefined) {
    return;
  }
  
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      message || `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      {
        field: fieldName,
        rule: 'oneOf',
        details: {
          allowedValues,
          received: value
        },
        code: 'invalid_value'
      }
    );
  }
}

/**
 * Validates that a string matches a specific pattern
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  fieldName: string,
  message?: string
): void {
  // Skip validation for null/undefined to avoid confusing errors
  if (value === null || value === undefined) {
    return;
  }
  
  validateType(value, 'string', fieldName);
  
  if (!pattern.test(value)) {
    throw ValidationError.formatError(
      fieldName,
      pattern.toString(),
      value,
      message
    );
  }
}

/**
 * Validates that a number is within a specific range
 */
export function validateRange(
  value: number,
  min: number | undefined,
  max: number | undefined,
  fieldName: string,
  message?: string
): void {
  // Skip validation for null/undefined to avoid confusing errors
  if (value === null || value === undefined) {
    return;
  }
  
  validateType(value, 'number', fieldName);
  
  if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
    throw ValidationError.rangeError(
      fieldName,
      min,
      max,
      value,
      message
    );
  }
}

/**
 * Validates an object against a schema of validation functions
 */
export function validateObject<T extends Record<string, unknown>>(
  value: unknown,
  schema: Record<string, (value: unknown) => void>,
  fieldName: string = 'object'
): void {
  // Skip validation for null/undefined to avoid confusing errors
  if (value === null || value === undefined) {
    return;
  }
  
  validateType(value, 'object', fieldName);
  
  const errors: ValidationError[] = [];
  
  Object.entries(schema).forEach(([key, validator]) => {
    try {
      validator((value as Record<string, unknown>)[key]);
    } catch (error) {
      if (isValidationError(error)) {
        errors.push(error);
      } else {
        errors.push(new ValidationError(
          `Validation failed for ${key}`,
          {
            field: key,
            rule: 'custom',
            originalError: error
          }
        ));
      }
    }
  });
  
  if (errors.length > 0) {
    throw new ValidationError(
      `Object validation failed`,
      {
        field: fieldName,
        rule: 'object',
        details: { errors: errors.map(e => e.message) },
        code: 'object_validation'
      }
    );
  }
}

// Re-export isValidationError from ValidationError.ts
export { isValidationError };

export default {
  validateRequired,
  validateType,
  validateArray,
  validateOneOf,
  validatePattern,
  validateRange,
  validateObject,
  isValidationError
};
