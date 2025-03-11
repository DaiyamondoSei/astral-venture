/**
 * Validation Utilities
 * 
 * Provides type-safe validation primitives for runtime type checking.
 */

import { ValidationError } from './ValidationError';
import { 
  ValidationResult, 
  Validator, 
  ValidationSchema, 
  ValidationOptions,
  ValidationErrorCode,
  ValidationContext
} from './types';

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
          code: ValidationErrorCode.REQUIRED
        }
      };
    }
    return { valid: true, validatedData: value };
  };
};

/**
 * Type guard validator creator
 */
export function createTypeGuard<T>(
  guard: (value: unknown) => value is T,
  code: string = ValidationErrorCode.TYPE_ERROR,
  message: string = 'Invalid type'
): Validator<T> {
  return (value: unknown): ValidationResult<T> => {
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
    return { valid: true, validatedData: value };
  };
}

/**
 * Combine multiple validators
 */
export function combineValidators<T>(validators: Validator[]): Validator<T> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    for (const validator of validators) {
      const result = validator(value, context);
      if (!result.valid) {
        return result as ValidationResult<T>;
      }
    }
    return { valid: true, validatedData: value as T };
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
export const isDate = (value: unknown): value is Date => 
  value instanceof Date && !isNaN(value.getTime());

/**
 * Extended validator for string patterns (regex)
 */
export const matchesPattern = (pattern: RegExp, errorMessage: string): Validator<string> => {
  return (value: unknown): ValidationResult<string> => {
    if (typeof value !== 'string') {
      return {
        valid: false,
        error: {
          path: '',
          message: 'Value must be a string',
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'type'
        }
      };
    }
    
    if (!pattern.test(value)) {
      return {
        valid: false,
        error: {
          path: '',
          message: errorMessage,
          code: ValidationErrorCode.PATTERN_ERROR,
          rule: 'pattern'
        }
      };
    }
    
    return { valid: true, validatedData: value };
  };
};

/**
 * String length validator
 */
export const hasLength = (options: { min?: number; max?: number; exact?: number }): Validator<string> => {
  return (value: unknown): ValidationResult<string> => {
    if (typeof value !== 'string') {
      return {
        valid: false,
        error: {
          path: '',
          message: 'Value must be a string',
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'type'
        }
      };
    }
    
    if (options.exact !== undefined && value.length !== options.exact) {
      return {
        valid: false,
        error: {
          path: '',
          message: `Value must be exactly ${options.exact} characters`,
          code: ValidationErrorCode.RANGE_ERROR,
          rule: 'exactLength'
        }
      };
    }
    
    if (options.min !== undefined && value.length < options.min) {
      return {
        valid: false,
        error: {
          path: '',
          message: `Value must be at least ${options.min} characters`,
          code: ValidationErrorCode.RANGE_ERROR,
          rule: 'minLength'
        }
      };
    }
    
    if (options.max !== undefined && value.length > options.max) {
      return {
        valid: false,
        error: {
          path: '',
          message: `Value must be at most ${options.max} characters`,
          code: ValidationErrorCode.RANGE_ERROR,
          rule: 'maxLength'
        }
      };
    }
    
    return { valid: true, validatedData: value };
  };
};

/**
 * Validate unknown data against a schema
 */
export function validateData<T>(
  data: unknown, 
  schema: ValidationSchema<T>,
  options: ValidationOptions = {},
  errorMessage: string = 'Validation failed'
): T {
  if (!isObject(data)) {
    throw new ValidationError(
      'Invalid data format', 
      [{ path: '', message: 'Expected an object', code: ValidationErrorCode.TYPE_ERROR }]
    );
  }

  const errors = [];
  const result: Record<string, unknown> = {};

  for (const [field, validator] of Object.entries(schema)) {
    if (!validator) continue;
    
    const fieldValue = data[field];
    const context: ValidationContext = {
      fieldPath: field,
      parentValue: data,
      options,
      root: data
    };
    
    const validationResult = validator(fieldValue, context);
    
    if (!validationResult.valid && validationResult.error) {
      errors.push({
        ...validationResult.error,
        path: validationResult.error.path || field
      });
      
      // Stop on first error if abortEarly is true
      if (options.abortEarly) break;
    } else if (validationResult.validatedData !== undefined) {
      result[field] = validationResult.validatedData;
    }
  }

  // Add unknown fields if not stripped
  if (!options.stripUnknown) {
    for (const [key, value] of Object.entries(data)) {
      if (!(key in schema)) {
        if (!options.allowUnknown) {
          errors.push({
            path: key,
            message: `Unknown field: ${key}`,
            code: ValidationErrorCode.UNKNOWN_ERROR
          });
        } else {
          result[key] = value;
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errorMessage, errors);
  }

  return result as T;
}

/**
 * Type-safe object property access with validation
 */
export function getProperty<T>(
  obj: unknown, 
  key: string,
  validator?: Validator<T>
): T | undefined {
  if (!isObject(obj)) return undefined;
  
  const value = obj[key];
  
  if (validator) {
    const result = validator(value);
    if (!result.valid) return undefined;
    return result.validatedData as T;
  }
  
  return value as T;
}

/**
 * Create schema validator function from schema object
 */
export function createSchemaValidator<T>(schema: ValidationSchema<T> | Validator<T>): Validator<T> {
  // If schema is already a validator function, return it
  if (typeof schema === 'function') {
    return schema;
  }
  
  // Otherwise, create a validator from the schema object
  return (data: unknown, context?: ValidationContext): ValidationResult<T> => {
    try {
      const validated = validateData<T>(data, schema);
      return { valid: true, validatedData: validated };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { 
          valid: false, 
          errors: error.details
        };
      }
      return { 
        valid: false, 
        error: { 
          path: '', 
          message: error instanceof Error ? error.message : String(error) 
        }
      };
    }
  };
}

/**
 * Create a custom validation function
 */
export function createValidator<T>(
  validationFn: (value: unknown, context?: ValidationContext) => { valid: boolean; message?: string; },
  errorCode: string = ValidationErrorCode.CUSTOM_ERROR
): Validator<T> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    const result = validationFn(value, context);
    if (!result.valid) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message: result.message || 'Validation failed',
          code: errorCode
        }
      };
    }
    return { valid: true, validatedData: value as T };
  };
}

export default {
  required,
  createTypeGuard,
  combineValidators,
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isDate,
  matchesPattern,
  hasLength,
  validateData,
  getProperty,
  createSchemaValidator,
  createValidator
};
