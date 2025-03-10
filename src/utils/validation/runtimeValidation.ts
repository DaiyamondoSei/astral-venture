
/**
 * Runtime Validation Module
 * 
 * This module provides runtime validation utilities for ensuring type safety
 * and data correctness during application execution.
 */

import { ErrorCategory, ErrorSeverity } from '../errorHandling/types';
import { ValidationError } from './ValidationError';
import { handleError } from '../errorHandling/handleError';

/**
 * Validate that a value is not null or undefined
 */
export function validateDefined<T>(value: T | null | undefined, name = 'value'): T {
  if (value === null || value === undefined) {
    throw new ValidationError(
      `${name} is required but was ${value === null ? 'null' : 'undefined'}`,
      { field: name }
    );
  }
  return value;
}

/**
 * Validate that a value is a string
 */
export function validateString(value: unknown, name = 'value'): string {
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${name} must be a string, but was ${typeof value}`,
      { field: name, expectedType: 'string', actualType: typeof value }
    );
  }
  return value;
}

/**
 * Validate that a value is a number
 */
export function validateNumber(value: unknown, name = 'value'): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(
      `${name} must be a number, but was ${isNaN(value as number) ? 'NaN' : typeof value}`,
      { field: name, expectedType: 'number', actualType: typeof value }
    );
  }
  return value;
}

/**
 * Validate that a value is a boolean
 */
export function validateBoolean(value: unknown, name = 'value'): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(
      `${name} must be a boolean, but was ${typeof value}`,
      { field: name, expectedType: 'boolean', actualType: typeof value }
    );
  }
  return value;
}

/**
 * Validate that a value is an object (not null, not an array)
 */
export function validateObject<T extends object = Record<string, unknown>>(
  value: unknown, 
  name = 'value'
): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(
      `${name} must be an object, but was ${value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value}`,
      { field: name, expectedType: 'object', actualType: typeof value }
    );
  }
  return value as T;
}

/**
 * Validate that a value is an array
 */
export function validateArray<T = unknown>(
  value: unknown,
  itemValidator?: (item: unknown, index: number) => T,
  name = 'value'
): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(
      `${name} must be an array, but was ${typeof value}`,
      { field: name, expectedType: 'array', actualType: typeof value }
    );
  }
  
  // If an item validator is provided, validate each item in the array
  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          // Enhance the error with array index information
          throw new ValidationError(
            `${name}[${index}]: ${error.message}`,
            { ...error.details, field: `${name}[${index}]`, arrayIndex: index }
          );
        }
        throw error;
      }
    });
  }
  
  return value as T[];
}

/**
 * Validate that a value is one of the allowed values
 */
export function validateOneOf<T>(
  value: unknown, 
  allowedValues: readonly T[], 
  name = 'value'
): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${name} must be one of [${allowedValues.join(', ')}], but was ${String(value)}`,
      { 
        field: name, 
        allowedValues, 
        actualValue: value 
      }
    );
  }
  return value as T;
}

/**
 * Safely validate a value with a custom validator function
 */
export function validateSafe<T>(
  value: unknown,
  validator: (val: unknown) => T,
  options: {
    name?: string;
    defaultValue?: T;
    errorHandler?: (error: Error) => void;
  } = {}
): T | undefined {
  const { name = 'value', defaultValue, errorHandler } = options;
  
  try {
    return validator(value);
  } catch (error) {
    if (errorHandler) {
      errorHandler(error instanceof Error ? error : new Error(String(error)));
    } else {
      handleError(error, {
        severity: ErrorSeverity.WARNING,
        category: ErrorCategory.VALIDATION,
        context: { field: name, value }
      });
    }
    
    return defaultValue;
  }
}

/**
 * Validate a record object with specific validation for each field
 */
export function validateRecord<T extends Record<string, unknown>>(
  value: unknown,
  fieldValidators: {
    [K in keyof T]: (value: unknown) => T[K];
  },
  options: { 
    name?: string;
    allowExtraFields?: boolean;
    requiredFields?: (keyof T)[];
  } = {}
): T {
  const { name = 'record', allowExtraFields = false, requiredFields = [] } = options;
  
  // Ensure it's an object
  const obj = validateObject(value, name);
  const result = {} as T;
  const errors: ValidationError[] = [];
  
  // Check for required fields
  for (const field of requiredFields) {
    const fieldName = String(field);
    if (!(fieldName in obj)) {
      errors.push(
        new ValidationError(`${name}.${fieldName} is required but was missing`, {
          field: fieldName,
          recordField: fieldName
        })
      );
    }
  }
  
  // If we have required field errors, throw now
  if (errors.length > 0) {
    const primaryError = errors[0];
    primaryError.details.allErrors = errors;
    throw primaryError;
  }
  
  // Validate each field with its validator
  for (const [fieldName, validator] of Object.entries(fieldValidators)) {
    if (fieldName in obj) {
      try {
        result[fieldName as keyof T] = validator(obj[fieldName]);
      } catch (error) {
        if (error instanceof ValidationError) {
          error.details.recordField = fieldName;
          error.message = `${name}.${fieldName}: ${error.message}`;
          errors.push(error);
        } else {
          errors.push(
            new ValidationError(`${name}.${fieldName} failed validation: ${String(error)}`, {
              field: fieldName,
              recordField: fieldName,
              originalError: error
            })
          );
        }
      }
    }
  }
  
  // Check for extra fields if not allowed
  if (!allowExtraFields) {
    const validKeys = Object.keys(fieldValidators);
    const extraKeys = Object.keys(obj).filter(key => !validKeys.includes(key));
    
    if (extraKeys.length > 0) {
      errors.push(
        new ValidationError(`${name} contains unexpected fields: ${extraKeys.join(', ')}`, {
          extraFields: extraKeys
        })
      );
    }
  }
  
  // If we have validation errors, throw the first one with all errors in details
  if (errors.length > 0) {
    const primaryError = errors[0];
    primaryError.details.allErrors = errors;
    throw primaryError;
  }
  
  return result;
}

/**
 * Validate that a value is of the expected type
 */
export function validateType<T>(
  value: unknown,
  expectedType: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function',
  name = 'value'
): T {
  let typeMatches = false;
  
  switch (expectedType) {
    case 'string':
      typeMatches = typeof value === 'string';
      break;
    case 'number':
      typeMatches = typeof value === 'number' && !isNaN(value);
      break;
    case 'boolean':
      typeMatches = typeof value === 'boolean';
      break;
    case 'object':
      typeMatches = typeof value === 'object' && value !== null && !Array.isArray(value);
      break;
    case 'array':
      typeMatches = Array.isArray(value);
      break;
    case 'function':
      typeMatches = typeof value === 'function';
      break;
  }
  
  if (!typeMatches) {
    throw new ValidationError(
      `${name} must be a ${expectedType}, but was ${value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value}`,
      { field: name, expectedType, actualType: typeof value }
    );
  }
  
  return value as T;
}
