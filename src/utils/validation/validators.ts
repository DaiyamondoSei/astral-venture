
/**
 * Common Validators
 * 
 * This module provides a set of reusable validators for common data types
 * and constraints. These validators follow the Validator<T> pattern defined
 * in the validation type system.
 */

import { 
  Validator, 
  ValidationResult, 
  ValidationErrorCode,
  ValidationContext 
} from '../../types/validation/types';
import { 
  isString, 
  isNumber, 
  isBoolean, 
  isArray, 
  isObject,
  isEmail,
  isUUID,
  isURI,
  isDefined,
  isInteger,
  isFiniteNumber,
  isDate,
  isISODateString,
  matchesPattern
} from '../../types/core/guards';
import { ValidationError } from './ValidationError';

/**
 * Creates a required validator that checks if a value is defined
 */
export function required(fieldName: string): Validator<unknown> {
  return (value: unknown, context?: ValidationContext): ValidationResult => {
    const path = context?.fieldPath || fieldName;
    
    if (!isDefined(value) || (isString(value) && value.trim() === '')) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} is required`,
          code: ValidationErrorCode.REQUIRED,
          rule: 'required'
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates a string validator
 */
export function string(fieldName: string): Validator<string> {
  return (value: unknown, context?: ValidationContext): ValidationResult<string> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isString(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a string`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'string',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates a number validator
 */
export function number(fieldName: string): Validator<number> {
  return (value: unknown, context?: ValidationContext): ValidationResult<number> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isNumber(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a number`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'number',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates an integer validator
 */
export function integer(fieldName: string): Validator<number> {
  return (value: unknown, context?: ValidationContext): ValidationResult<number> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isInteger(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be an integer`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'integer',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates a boolean validator
 */
export function boolean(fieldName: string): Validator<boolean> {
  return (value: unknown, context?: ValidationContext): ValidationResult<boolean> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isBoolean(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a boolean`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'boolean',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates an array validator
 */
export function array<T>(
  fieldName: string, 
  itemValidator?: Validator<T>
): Validator<T[]> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T[]> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isArray(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be an array`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'array',
          value
        }
      };
    }
    
    if (itemValidator) {
      const errors = [];
      const validatedItems = [];
      
      for (let i = 0; i < value.length; i++) {
        const itemPath = `${path}[${i}]`;
        const itemContext = {
          ...context,
          fieldPath: itemPath,
          parentValue: value
        };
        
        const result = itemValidator(value[i], itemContext);
        
        if (!result.valid) {
          errors.push(result.error);
        } else {
          validatedItems.push(result.data);
        }
      }
      
      if (errors.length > 0) {
        return {
          valid: false,
          errors
        };
      }
      
      return { valid: true, data: validatedItems };
    }
    
    return { valid: true, data: value as T[] };
  };
}

/**
 * Creates an object validator
 */
export function object<T>(
  fieldName: string,
  schema?: Record<string, Validator<any>>
): Validator<T> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isObject(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be an object`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'object',
          value
        }
      };
    }
    
    if (schema) {
      const errors = [];
      const validatedObject: Record<string, any> = {};
      
      for (const [key, validator] of Object.entries(schema)) {
        const propertyPath = path ? `${path}.${key}` : key;
        const propertyContext = {
          ...context,
          fieldPath: propertyPath,
          parentValue: value,
          siblingValues: value as Record<string, unknown>
        };
        
        const propertyValue = (value as Record<string, unknown>)[key];
        const result = validator(propertyValue, propertyContext);
        
        if (!result.valid) {
          errors.push(result.error);
        } else if (result.data !== undefined) {
          validatedObject[key] = result.data;
        } else {
          validatedObject[key] = propertyValue;
        }
      }
      
      if (errors.length > 0) {
        return {
          valid: false,
          errors
        };
      }
      
      return { valid: true, data: validatedObject as T };
    }
    
    return { valid: true, data: value as T };
  };
}

/**
 * Creates an email validator
 */
export function email(fieldName: string): Validator<string> {
  return (value: unknown, context?: ValidationContext): ValidationResult<string> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isEmail(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a valid email address`,
          code: ValidationErrorCode.FORMAT_ERROR,
          rule: 'email',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates a UUID validator
 */
export function uuid(fieldName: string): Validator<string> {
  return (value: unknown, context?: ValidationContext): ValidationResult<string> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isUUID(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a valid UUID`,
          code: ValidationErrorCode.FORMAT_ERROR,
          rule: 'uuid',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates a URL validator
 */
export function url(fieldName: string): Validator<string> {
  return (value: unknown, context?: ValidationContext): ValidationResult<string> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isURI(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a valid URL`,
          code: ValidationErrorCode.FORMAT_ERROR,
          rule: 'url',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates a date validator
 */
export function date(fieldName: string): Validator<Date> {
  return (value: unknown, context?: ValidationContext): ValidationResult<Date> => {
    const path = context?.fieldPath || fieldName;
    
    if (isDate(value)) {
      return { valid: true, data: value };
    }
    
    if (isString(value) && isISODateString(value)) {
      return { valid: true, data: new Date(value) };
    }
    
    return {
      valid: false,
      error: {
        path,
        field: path,
        message: `${fieldName} must be a valid date`,
        code: ValidationErrorCode.TYPE_ERROR,
        rule: 'date',
        value
      }
    };
  };
}

/**
 * Creates a pattern validator
 */
export function pattern(
  fieldName: string, 
  regex: RegExp, 
  message?: string
): Validator<string> {
  return (value: unknown, context?: ValidationContext): ValidationResult<string> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isString(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a string`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'pattern',
          value
        }
      };
    }
    
    if (!matchesPattern(value, regex)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: message || `${fieldName} has invalid format`,
          code: ValidationErrorCode.PATTERN_ERROR,
          rule: 'pattern',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates a minimum value validator
 */
export function min(fieldName: string, minValue: number): Validator<number> {
  return (value: unknown, context?: ValidationContext): ValidationResult<number> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isNumber(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a number`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'min',
          value
        }
      };
    }
    
    if (value < minValue) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be at least ${minValue}`,
          code: ValidationErrorCode.RANGE_ERROR,
          rule: 'min',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates a maximum value validator
 */
export function max(fieldName: string, maxValue: number): Validator<number> {
  return (value: unknown, context?: ValidationContext): ValidationResult<number> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isNumber(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a number`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'max',
          value
        }
      };
    }
    
    if (value > maxValue) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be at most ${maxValue}`,
          code: ValidationErrorCode.RANGE_ERROR,
          rule: 'max',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates a range validator
 */
export function range(
  fieldName: string, 
  minValue: number, 
  maxValue: number
): Validator<number> {
  return (value: unknown, context?: ValidationContext): ValidationResult<number> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isNumber(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a number`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'range',
          value
        }
      };
    }
    
    if (value < minValue || value > maxValue) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be between ${minValue} and ${maxValue}`,
          code: ValidationErrorCode.RANGE_ERROR,
          rule: 'range',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates a minimum length validator
 */
export function minLength(fieldName: string, minLength: number): Validator<string | unknown[]> {
  return (value: unknown, context?: ValidationContext): ValidationResult<string | unknown[]> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isString(value) && !isArray(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a string or array`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'minLength',
          value
        }
      };
    }
    
    if (value.length < minLength) {
      const type = isString(value) ? 'characters' : 'items';
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must have at least ${minLength} ${type}`,
          code: ValidationErrorCode.RANGE_ERROR,
          rule: 'minLength',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates a maximum length validator
 */
export function maxLength(fieldName: string, maxLength: number): Validator<string | unknown[]> {
  return (value: unknown, context?: ValidationContext): ValidationResult<string | unknown[]> => {
    const path = context?.fieldPath || fieldName;
    
    if (!isString(value) && !isArray(value)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be a string or array`,
          code: ValidationErrorCode.TYPE_ERROR,
          rule: 'maxLength',
          value
        }
      };
    }
    
    if (value.length > maxLength) {
      const type = isString(value) ? 'characters' : 'items';
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must have at most ${maxLength} ${type}`,
          code: ValidationErrorCode.RANGE_ERROR,
          rule: 'maxLength',
          value
        }
      };
    }
    
    return { valid: true, data: value };
  };
}

/**
 * Creates an enum validator
 */
export function oneOf<T extends string | number>(
  fieldName: string, 
  allowedValues: readonly T[]
): Validator<T> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    const path = context?.fieldPath || fieldName;
    
    if (!allowedValues.includes(value as T)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
          code: ValidationErrorCode.FORMAT_ERROR,
          rule: 'oneOf',
          value
        }
      };
    }
    
    return { valid: true, data: value as T };
  };
}

/**
 * Creates a custom validator
 */
export function custom<T>(
  fieldName: string,
  validationFn: (value: unknown, context?: ValidationContext) => boolean,
  errorMessage: string
): Validator<T> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    const path = context?.fieldPath || fieldName;
    
    if (!validationFn(value, context)) {
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: errorMessage,
          code: ValidationErrorCode.CUSTOM_ERROR,
          rule: 'custom',
          value
        }
      };
    }
    
    return { valid: true, data: value as T };
  };
}

/**
 * Creates an optional validator
 */
export function optional<T>(validator: Validator<T>): Validator<T | undefined> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T | undefined> => {
    if (value === undefined || value === null || (isString(value) && value.trim() === '')) {
      return { valid: true, data: undefined };
    }
    
    return validator(value, context) as ValidationResult<T | undefined>;
  };
}

/**
 * Creates a default value validator
 */
export function defaultValue<T>(validator: Validator<T>, defaultVal: T): Validator<T> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    if (value === undefined || value === null || (isString(value) && value.trim() === '')) {
      return { valid: true, data: defaultVal };
    }
    
    return validator(value, context);
  };
}

/**
 * Creates a transform validator
 */
export function transform<T, R>(
  validator: Validator<T>,
  transformFn: (value: T) => R
): Validator<R> {
  return (value: unknown, context?: ValidationContext): ValidationResult<R> => {
    const result = validator(value, context);
    
    if (!result.valid) {
      return result as ValidationResult<R>;
    }
    
    try {
      const transformed = transformFn(result.data as T);
      return { valid: true, data: transformed };
    } catch (error) {
      const path = context?.fieldPath || '';
      return {
        valid: false,
        error: {
          path,
          field: path,
          message: error instanceof Error ? error.message : 'Transformation failed',
          code: ValidationErrorCode.CUSTOM_ERROR,
          rule: 'transform',
          value
        }
      };
    }
  };
}

export default {
  required,
  string,
  number,
  integer,
  boolean,
  array,
  object,
  email,
  uuid,
  url,
  date,
  pattern,
  min,
  max,
  range,
  minLength,
  maxLength,
  oneOf,
  custom,
  optional,
  defaultValue,
  transform
};
