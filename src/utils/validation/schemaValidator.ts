
import { ValidationError } from './runtimeValidation';

/**
 * Type for schema validator functions
 */
export type ValidatorFn<T> = (value: unknown) => T;

/**
 * Schema validation options
 */
export interface SchemaValidationOptions {
  /**
   * Whether to strip unknown properties from objects
   */
  stripUnknown?: boolean;
  
  /**
   * Additional context for error messages
   */
  context?: string;
}

/**
 * Creates a schema validator for an object
 * 
 * @param schema - Object with property validators
 * @param options - Validation options
 * @returns A validator function for the schema
 */
export function objectSchema<T>(
  schema: Record<string, ValidatorFn<any>>,
  options: SchemaValidationOptions = {}
): ValidatorFn<T> {
  return (value: unknown): T => {
    if (typeof value !== 'object' || value === null) {
      throw new ValidationError('Expected an object', {
        code: 'INVALID_TYPE',
        details: { expected: 'object', received: typeof value }
      });
    }
    
    const result: Record<string, any> = {};
    const valueObj = value as Record<string, unknown>;
    const errors: Record<string, string> = {};
    let hasErrors = false;
    
    // Validate each field according to schema
    for (const [key, validator] of Object.entries(schema)) {
      try {
        if (key in valueObj) {
          result[key] = validator(valueObj[key]);
        } else {
          // Field missing from input
          errors[key] = 'Field is required';
          hasErrors = true;
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          errors[key] = error.message;
        } else {
          errors[key] = error instanceof Error ? error.message : String(error);
        }
        hasErrors = true;
      }
    }
    
    // Include non-schema fields if not stripping unknown properties
    if (!options.stripUnknown) {
      for (const key of Object.keys(valueObj)) {
        if (!(key in schema)) {
          result[key] = valueObj[key];
        }
      }
    }
    
    // If there were validation errors, throw with details
    if (hasErrors) {
      const contextPrefix = options.context ? `${options.context}: ` : '';
      throw new ValidationError(`${contextPrefix}Invalid object data`, {
        code: 'INVALID_OBJECT',
        details: { errors }
      });
    }
    
    return result as T;
  };
}

/**
 * Creates a schema validator for an array of items
 * 
 * @param itemValidator - Validator for each array item
 * @param options - Validation options
 * @returns A validator function for an array
 */
export function arraySchema<T>(
  itemValidator: ValidatorFn<T>,
  options: SchemaValidationOptions = {}
): ValidatorFn<T[]> {
  return (value: unknown): T[] => {
    if (!Array.isArray(value)) {
      throw new ValidationError('Expected an array', {
        code: 'INVALID_TYPE',
        details: { expected: 'array', received: typeof value }
      });
    }
    
    const result: T[] = [];
    const errors: Record<number, string> = {};
    let hasErrors = false;
    
    // Validate each item in the array
    value.forEach((item, index) => {
      try {
        result.push(itemValidator(item));
      } catch (error) {
        if (error instanceof ValidationError) {
          errors[index] = error.message;
        } else {
          errors[index] = error instanceof Error ? error.message : String(error);
        }
        hasErrors = true;
      }
    });
    
    // If there were validation errors, throw with details
    if (hasErrors) {
      const contextPrefix = options.context ? `${options.context}: ` : '';
      throw new ValidationError(`${contextPrefix}Invalid array items`, {
        code: 'INVALID_ARRAY_ITEMS',
        details: { errors }
      });
    }
    
    return result;
  };
}

/**
 * Creates a validator that handles null or undefined values
 * 
 * @param validator - The validator to use if value is defined
 * @param defaultValue - Optional default value to use if input is null/undefined
 * @returns A validator function that handles null/undefined
 */
export function optional<T>(
  validator: ValidatorFn<T>,
  defaultValue?: T
): ValidatorFn<T | undefined> {
  return (value: unknown): T | undefined => {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return validator(value);
  };
}

/**
 * Creates a validator for string values
 * 
 * @param options - Optional constraints
 * @returns A validator function for strings
 */
export function string(options: {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
} = {}): ValidatorFn<string> {
  return (value: unknown): string => {
    if (typeof value !== 'string') {
      throw new ValidationError('Expected a string', {
        code: 'INVALID_TYPE',
        details: { expected: 'string', received: typeof value }
      });
    }
    
    if (options.minLength !== undefined && value.length < options.minLength) {
      throw new ValidationError(`Must be at least ${options.minLength} characters long`, {
        code: 'STRING_TOO_SHORT',
        details: { minLength: options.minLength, actual: value.length }
      });
    }
    
    if (options.maxLength !== undefined && value.length > options.maxLength) {
      throw new ValidationError(`Must be at most ${options.maxLength} characters long`, {
        code: 'STRING_TOO_LONG',
        details: { maxLength: options.maxLength, actual: value.length }
      });
    }
    
    if (options.pattern !== undefined && !options.pattern.test(value)) {
      const message = options.patternMessage || 'Does not match required pattern';
      throw new ValidationError(message, {
        code: 'PATTERN_MISMATCH',
        details: { pattern: options.pattern.toString() }
      });
    }
    
    return value;
  };
}

/**
 * Creates a validator for number values
 * 
 * @param options - Optional constraints
 * @returns A validator function for numbers
 */
export function number(options: {
  min?: number;
  max?: number;
  integer?: boolean;
} = {}): ValidatorFn<number> {
  return (value: unknown): number => {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError('Expected a number', {
        code: 'INVALID_TYPE',
        details: { expected: 'number', received: typeof value }
      });
    }
    
    if (options.integer && !Number.isInteger(value)) {
      throw new ValidationError('Must be an integer', {
        code: 'NOT_INTEGER',
        details: { value }
      });
    }
    
    if (options.min !== undefined && value < options.min) {
      throw new ValidationError(`Must be at least ${options.min}`, {
        code: 'NUMBER_TOO_SMALL',
        details: { min: options.min, actual: value }
      });
    }
    
    if (options.max !== undefined && value > options.max) {
      throw new ValidationError(`Must be at most ${options.max}`, {
        code: 'NUMBER_TOO_LARGE',
        details: { max: options.max, actual: value }
      });
    }
    
    return value;
  };
}

/**
 * Creates a validator for boolean values
 * 
 * @returns A validator function for booleans
 */
export function boolean(): ValidatorFn<boolean> {
  return (value: unknown): boolean => {
    if (typeof value !== 'boolean') {
      throw new ValidationError('Expected a boolean', {
        code: 'INVALID_TYPE',
        details: { expected: 'boolean', received: typeof value }
      });
    }
    return value;
  };
}

/**
 * Creates a validator that ensures a value is one of the specified values
 * 
 * @param allowedValues - Array of allowed values
 * @returns A validator function for the enum
 */
export function enumValue<T extends string | number>(allowedValues: readonly T[]): ValidatorFn<T> {
  return (value: unknown): T => {
    if (!allowedValues.includes(value as T)) {
      throw new ValidationError(
        `Must be one of: ${allowedValues.join(', ')}`, {
          code: 'INVALID_ENUM',
          details: { allowedValues, received: value }
        }
      );
    }
    return value as T;
  };
}

/**
 * Creates a validator that allows a value to match any of the given validators
 * 
 * @param validators - Array of possible validators
 * @returns A validator function that tries each validator
 */
export function union<T extends any[]>(
  validators: { [K in keyof T]: ValidatorFn<T[K]> }
): ValidatorFn<T[number]> {
  return (value: unknown): T[number] => {
    const errors: string[] = [];
    
    for (const validator of validators) {
      try {
        return validator(value);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
    
    throw new ValidationError(`Value did not match any allowed types`, {
      code: 'UNION_TYPE_MISMATCH',
      details: { errors }
    });
  };
}
