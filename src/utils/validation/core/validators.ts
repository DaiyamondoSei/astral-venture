
/**
 * Common validators
 */
import { Validator, ValidationResult } from '../types';

/**
 * Required value validator
 */
export function required(field: string): Validator {
  return (value: unknown): ValidationResult => {
    if (value === undefined || value === null || value === '') {
      return {
        valid: false,
        error: {
          path: field,
          message: `${field} is required`,
          code: 'REQUIRED'
        }
      };
    }
    return { valid: true, validatedData: value };
  };
}

/**
 * String validator
 */
export function string(field: string): Validator<string> {
  return (value: unknown): ValidationResult<string> => {
    if (typeof value !== 'string') {
      return {
        valid: false,
        error: {
          path: field,
          message: `${field} must be a string`,
          code: 'TYPE_ERROR'
        }
      };
    }
    return { valid: true, validatedData: value };
  };
}

/**
 * Number validator
 */
export function number(field: string): Validator<number> {
  return (value: unknown): ValidationResult<number> => {
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        valid: false,
        error: {
          path: field,
          message: `${field} must be a number`,
          code: 'TYPE_ERROR'
        }
      };
    }
    return { valid: true, validatedData: value };
  };
}

/**
 * Boolean validator
 */
export function boolean(field: string): Validator<boolean> {
  return (value: unknown): ValidationResult<boolean> => {
    if (typeof value !== 'boolean') {
      return {
        valid: false,
        error: {
          path: field,
          message: `${field} must be a boolean`,
          code: 'TYPE_ERROR'
        }
      };
    }
    return { valid: true, validatedData: value };
  };
}

/**
 * Array validator
 */
export function array<T>(
  itemValidator: Validator<T>,
  field: string
): Validator<T[]> {
  return (value: unknown): ValidationResult<T[]> => {
    if (!Array.isArray(value)) {
      return {
        valid: false,
        error: {
          path: field,
          message: `${field} must be an array`,
          code: 'TYPE_ERROR'
        }
      };
    }

    const errors: ValidationResult['error'][] = [];
    const validItems: T[] = [];

    value.forEach((item, index) => {
      const result = itemValidator(item);
      if (!result.valid && result.error) {
        errors.push({
          ...result.error,
          path: `${field}[${index}]`
        });
      } else if (result.valid && result.validatedData) {
        validItems.push(result.validatedData);
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        errors
      };
    }

    return { valid: true, validatedData: validItems };
  };
}
