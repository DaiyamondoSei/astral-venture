
/**
 * Validation Utilities
 * 
 * Provides type-safe validation primitives for runtime type checking.
 */

import { ValidationError, ValidationErrorDetail } from './ValidationError';

/**
 * Result of a validation check
 */
export interface ValidationResult {
  valid: boolean;
  error?: ValidationErrorDetail;
}

/**
 * Validator function type
 */
export type Validator<T = any> = (value: unknown) => ValidationResult;

/**
 * Required field validator
 */
export const required = (field: string): Validator => {
  return (value: unknown): ValidationResult => {
    if (value === undefined || value === null) {
      return {
        valid: false,
        error: {
          path: field,
          message: `${field} is required`,
          rule: 'required',
          code: 'REQUIRED'
        }
      };
    }
    return { valid: true };
  };
};

/**
 * Type guard validator creator
 */
export function createTypeGuard<T>(
  guard: (value: unknown) => value is T,
  code: string,
  message: string
): Validator<T> {
  return (value: unknown): ValidationResult => {
    if (!guard(value)) {
      return {
        valid: false,
        error: {
          path: '',
          message,
          code,
          rule: 'type'
        }
      };
    }
    return { valid: true };
  };
}

/**
 * Combine multiple validators
 */
export function combineValidators(validators: Validator[]): Validator {
  return (value: unknown): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  };
}

/**
 * Common type guards for primitive types
 */
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value);
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isArray = <T>(itemGuard?: (item: unknown) => item is T) => 
  (value: unknown): value is T[] => {
    if (!Array.isArray(value)) return false;
    if (!itemGuard) return true;
    return value.every(item => itemGuard(item));
  };
export const isObject = (value: unknown): value is Record<string, unknown> => 
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Validate unknown data against a schema
 */
export function validateData<T>(
  data: unknown, 
  schema: Record<string, Validator>,
  errorMessage: string = 'Validation failed'
): T {
  if (!isObject(data)) {
    throw new ValidationError(
      'Invalid data format', 
      [{ path: '', message: 'Expected an object', code: 'TYPE_ERROR' }]
    );
  }

  const errors: ValidationErrorDetail[] = [];

  for (const [field, validator] of Object.entries(schema)) {
    const result = validator(data[field]);
    if (!result.valid && result.error) {
      errors.push({
        ...result.error,
        path: result.error.path || field
      });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errorMessage, errors);
  }

  return data as T;
}

/**
 * Type-safe object property access with validation
 */
export function getProperty<T>(
  obj: unknown, 
  key: string,
  validator?: Validator
): T | undefined {
  if (!isObject(obj)) return undefined;
  
  const value = obj[key];
  
  if (validator) {
    const result = validator(value);
    if (!result.valid) return undefined;
  }
  
  return value as T;
}
