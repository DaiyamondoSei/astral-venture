
/**
 * Runtime validation utilities for type checking
 */
import { ValidationError, isValidationError } from './ValidationError';

/**
 * Options for validation functions
 */
export interface ValidationOptions {
  /** Whether to throw an error on validation failure */
  throwOnError?: boolean;
  /** Custom error message */
  customMessage?: string;
  /** Optional parent field name for nested validations */
  parentField?: string;
}

/**
 * Default validation options
 */
const defaultOptions: ValidationOptions = {
  throwOnError: true
};

/**
 * Get the full field name including parent
 */
function getFullFieldName(field: string, options?: ValidationOptions): string {
  return options?.parentField ? `${options.parentField}.${field}` : field;
}

/**
 * Validate that a value is defined (not undefined or null)
 */
export function validateDefined<T>(
  value: T | null | undefined,
  field: string,
  options?: ValidationOptions
): T {
  const opts = { ...defaultOptions, ...options };
  const fullField = getFullFieldName(field, opts);
  
  if (value === undefined || value === null) {
    const errorMessage = opts.customMessage || `${fullField} is required but was not provided`;
    const error = ValidationError.requiredError(fullField);
    
    if (opts.throwOnError) {
      throw error;
    }
    
    return undefined as unknown as T;
  }
  
  return value;
}

/**
 * Validate that a value is a string
 */
export function validateString(
  value: unknown,
  field: string,
  options?: ValidationOptions
): string {
  const opts = { ...defaultOptions, ...options };
  const fullField = getFullFieldName(field, opts);
  
  // First validate that the value is defined
  if (value === undefined || value === null) {
    if (!opts.throwOnError) {
      return '' as string;
    }
    
    throw ValidationError.requiredError(fullField);
  }
  
  if (typeof value !== 'string') {
    const errorMessage = opts.customMessage || 
      `Expected ${fullField} to be a string, but got ${typeof value}`;
    const error = ValidationError.typeError(value, 'string', fullField);
    
    if (opts.throwOnError) {
      throw error;
    }
    
    return String(value);
  }
  
  return value;
}

/**
 * Validate that a value is a number
 */
export function validateNumber(
  value: unknown,
  field: string,
  options?: ValidationOptions
): number {
  const opts = { ...defaultOptions, ...options };
  const fullField = getFullFieldName(field, opts);
  
  // First validate that the value is defined
  if (value === undefined || value === null) {
    if (!opts.throwOnError) {
      return 0;
    }
    
    throw ValidationError.requiredError(fullField);
  }
  
  // Handle string numbers by converting
  if (typeof value === 'string') {
    const num = Number(value);
    if (!isNaN(num)) {
      return num;
    }
  }
  
  if (typeof value !== 'number' || isNaN(value)) {
    const errorMessage = opts.customMessage || 
      `Expected ${fullField} to be a number, but got ${typeof value}`;
    const error = ValidationError.typeError(value, 'number', fullField);
    
    if (opts.throwOnError) {
      throw error;
    }
    
    return 0;
  }
  
  return value;
}

/**
 * Validate that a value is a boolean
 */
export function validateBoolean(
  value: unknown,
  field: string,
  options?: ValidationOptions
): boolean {
  const opts = { ...defaultOptions, ...options };
  const fullField = getFullFieldName(field, opts);
  
  // First validate that the value is defined
  if (value === undefined || value === null) {
    if (!opts.throwOnError) {
      return false;
    }
    
    throw ValidationError.requiredError(fullField);
  }
  
  // Convert string 'true'/'false' to boolean
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  
  if (typeof value !== 'boolean') {
    const errorMessage = opts.customMessage || 
      `Expected ${fullField} to be a boolean, but got ${typeof value}`;
    const error = ValidationError.typeError(value, 'boolean', fullField);
    
    if (opts.throwOnError) {
      throw error;
    }
    
    return Boolean(value);
  }
  
  return value;
}

/**
 * Validate that a value is an array
 */
export function validateArray<T>(
  value: unknown,
  field: string,
  itemValidator?: (item: unknown, index: number) => T,
  options?: ValidationOptions
): T[] {
  const opts = { ...defaultOptions, ...options };
  const fullField = getFullFieldName(field, opts);
  
  // First validate that the value is defined
  if (value === undefined || value === null) {
    if (!opts.throwOnError) {
      return [];
    }
    
    throw ValidationError.requiredError(fullField);
  }
  
  if (!Array.isArray(value)) {
    const errorMessage = opts.customMessage || 
      `Expected ${fullField} to be an array, but got ${typeof value}`;
    const error = ValidationError.typeError(value, 'array', fullField);
    
    if (opts.throwOnError) {
      throw error;
    }
    
    return [];
  }
  
  // If an item validator is provided, validate each item
  if (itemValidator) {
    try {
      return value.map((item, index) => {
        try {
          return itemValidator(item, index);
        } catch (error) {
          if (isValidationError(error)) {
            // Enhance error with array index
            throw new ValidationError(
              `${fullField}[${index}]: ${error.message}`,
              {
                ...error,
                field: `${fullField}[${index}]`
              }
            );
          }
          throw error;
        }
      });
    } catch (error) {
      if (opts.throwOnError) {
        throw error;
      }
      return [];
    }
  }
  
  return value as T[];
}

/**
 * Validate that a value is an object
 */
export function validateObject<T extends object>(
  value: unknown,
  field: string,
  options?: ValidationOptions
): T {
  const opts = { ...defaultOptions, ...options };
  const fullField = getFullFieldName(field, opts);
  
  // First validate that the value is defined
  if (value === undefined || value === null) {
    if (!opts.throwOnError) {
      return {} as T;
    }
    
    throw ValidationError.requiredError(fullField);
  }
  
  if (typeof value !== 'object' || Array.isArray(value)) {
    const errorMessage = opts.customMessage || 
      `Expected ${fullField} to be an object, but got ${Array.isArray(value) ? 'array' : typeof value}`;
    const error = ValidationError.typeError(value, 'object', fullField);
    
    if (opts.throwOnError) {
      throw error;
    }
    
    return {} as T;
  }
  
  return value as T;
}

/**
 * Validate that a value is a record (object with string keys)
 */
export function validateRecord<T>(
  value: unknown,
  field: string,
  valueValidator?: (value: unknown, key: string) => T,
  options?: ValidationOptions
): Record<string, T> {
  const opts = { ...defaultOptions, ...options };
  const fullField = getFullFieldName(field, opts);
  
  // First validate as object
  const obj = validateObject<Record<string, unknown>>(value, field, {
    ...opts,
    throwOnError: false
  });
  
  if (typeof obj !== 'object' || obj === null) {
    if (opts.throwOnError) {
      throw ValidationError.typeError(value, 'record', fullField);
    }
    return {} as Record<string, T>;
  }
  
  // If a value validator is provided, validate each value
  if (valueValidator) {
    const result: Record<string, T> = {};
    try {
      for (const key in obj) {
        try {
          result[key] = valueValidator(obj[key], key);
        } catch (error) {
          if (isValidationError(error)) {
            // Enhance error with property path
            throw new ValidationError(
              `${fullField}.${key}: ${error.message}`,
              {
                ...error,
                field: `${fullField}.${key}`
              }
            );
          }
          throw error;
        }
      }
      return result;
    } catch (error) {
      if (opts.throwOnError) {
        throw error;
      }
      return {} as Record<string, T>;
    }
  }
  
  return obj as Record<string, T>;
}

/**
 * Validate that a value is one of the allowed values
 */
export function validateOneOf<T extends string | number>(
  value: unknown,
  allowedValues: T[],
  field: string,
  options?: ValidationOptions
): T {
  const opts = { ...defaultOptions, ...options };
  const fullField = getFullFieldName(field, opts);
  
  // First validate that the value is defined
  if (value === undefined || value === null) {
    if (!opts.throwOnError) {
      return allowedValues[0];
    }
    
    throw ValidationError.requiredError(fullField);
  }
  
  // For string enums, convert to string and check
  const stringValue = String(value);
  for (const allowedValue of allowedValues) {
    if (value === allowedValue || stringValue === String(allowedValue)) {
      return allowedValue;
    }
  }
  
  const errorMessage = opts.customMessage || 
    `Expected ${fullField} to be one of [${allowedValues.join(', ')}], but got ${value}`;
  const error = ValidationError.constraintError(
    fullField,
    'oneOf',
    `Expected one of: ${allowedValues.join(', ')}`
  );
  
  if (opts.throwOnError) {
    throw error;
  }
  
  return allowedValues[0];
}

/**
 * Validate that a string matches a regex pattern
 */
export function validatePattern(
  value: unknown,
  pattern: RegExp,
  field: string,
  options?: ValidationOptions
): string {
  const opts = { ...defaultOptions, ...options };
  const fullField = getFullFieldName(field, opts);
  
  // First validate as string
  const str = validateString(value, field, {
    ...opts,
    throwOnError: false
  });
  
  if (!pattern.test(str)) {
    const errorMessage = opts.customMessage || 
      `${fullField} does not match required pattern ${pattern}`;
    const error = ValidationError.constraintError(
      fullField,
      'pattern',
      `Must match pattern: ${pattern}`
    );
    
    if (opts.throwOnError) {
      throw error;
    }
  }
  
  return str;
}

/**
 * Validate that a value is within a numeric range
 */
export function validateRange(
  value: unknown,
  min: number,
  max: number,
  field: string,
  options?: ValidationOptions
): number {
  const opts = { ...defaultOptions, ...options };
  const fullField = getFullFieldName(field, opts);
  
  // First validate as number
  const num = validateNumber(value, field, {
    ...opts,
    throwOnError: false
  });
  
  if (num < min || num > max) {
    const errorMessage = opts.customMessage || 
      `${fullField} must be between ${min} and ${max}, but got ${num}`;
    const error = ValidationError.constraintError(
      fullField,
      'range',
      `Must be between ${min} and ${max}`
    );
    
    if (opts.throwOnError) {
      throw error;
    }
    
    // Return closest valid value
    return num < min ? min : max;
  }
  
  return num;
}

/**
 * Validate API response data
 */
export function validateApiResponse<T>(
  data: unknown,
  field: string,
  validator: (data: unknown) => T,
  options?: ValidationOptions
): T {
  const opts = { ...defaultOptions, ...options };
  const fullField = getFullFieldName(field, opts);
  
  try {
    return validator(data);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw ValidationError.fromError(
      `Invalid API response for ${fullField}`,
      error,
      fullField
    );
  }
}

export default {
  validateDefined,
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateRecord,
  validateOneOf,
  validatePattern,
  validateRange,
  validateApiResponse,
  isValidationError
};
