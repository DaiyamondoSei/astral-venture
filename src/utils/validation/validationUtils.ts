
/**
 * Validation Utilities
 * 
 * Provides type-safe validation primitives for runtime type checking.
 */

import { ValidationError, ValidationErrorDetail } from './ValidationError';
import { 
  ValidationResult, 
  Validator, 
  ValidationSchema, 
  ValidationOptions 
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
          code: 'REQUIRED'
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
  code: string,
  message: string
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
  return (value: unknown): ValidationResult<T> => {
    for (const validator of validators) {
      const result = validator(value);
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
      [{ path: '', message: 'Expected an object', code: 'TYPE_ERROR' }]
    );
  }

  const errors: ValidationErrorDetail[] = [];
  const result: Record<string, unknown> = {};

  for (const [field, validator] of Object.entries(schema)) {
    if (!validator) continue;
    
    const fieldValue = data[field];
    const validationResult = validator(fieldValue);
    
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
            code: 'UNKNOWN_FIELD'
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
export function createSchemaValidator<T>(schema: ValidationSchema<T>): Validator<T> {
  return (data: unknown): ValidationResult<T> => {
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
