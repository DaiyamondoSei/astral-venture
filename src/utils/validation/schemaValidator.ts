
import { ValidationError } from './runtimeValidation';

/**
 * Schema validation options
 */
export interface SchemaValidationOptions {
  /** Whether to allow unknown properties */
  allowUnknown?: boolean;
  /** Whether to strip unknown properties */
  stripUnknown?: boolean;
  /** Context for validation (passed to custom validators) */
  context?: Record<string, unknown>;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult<T> {
  /** Whether validation succeeded */
  success: boolean;
  /** Validated and potentially transformed data */
  data?: T;
  /** Validation errors if any */
  errors?: ValidationError[];
}

/**
 * Validator definition for schema properties
 */
export type PropertyValidator = (value: unknown, name: string) => unknown;

/**
 * Schema definition for object validation
 */
export type Schema = Record<string, PropertyValidator>;

/**
 * Validates an object against a schema and returns a structured result
 * 
 * @param data - Data to validate
 * @param schema - Schema to validate against
 * @param options - Validation options
 * @returns Validation result with data or errors
 * 
 * @example
 * const userSchema = {
 *   name: validateString,
 *   age: (v) => validateMin(validateNumber(v, 'age'), 18, 'age')
 * };
 * 
 * const result = validateSchema({ name: 'Alice', age: 25 }, userSchema);
 * if (result.success) {
 *   // result.data is typed correctly
 *   console.log(result.data.name);
 * }
 */
export function validateSchema<T extends Record<string, unknown>>(
  data: unknown,
  schema: Record<keyof T, PropertyValidator>,
  options: SchemaValidationOptions = {}
): ValidationResult<T> {
  // Handle non-object data
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return {
      success: false,
      errors: [new ValidationError('Data must be an object')]
    };
  }

  const validatedData: Record<string, unknown> = {};
  const errors: ValidationError[] = [];
  const unknownProps: string[] = [];
  
  // Check required properties and validate them
  for (const [key, validator] of Object.entries(schema)) {
    try {
      const value = (data as Record<string, unknown>)[key];
      validatedData[key] = validator(value, key);
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error);
      } else {
        errors.push(new ValidationError(`${key}: ${error instanceof Error ? error.message : String(error)}`));
      }
    }
  }
  
  // Check for unknown properties
  if (!options.allowUnknown) {
    for (const key of Object.keys(data as Record<string, unknown>)) {
      if (!(key in schema)) {
        unknownProps.push(key);
      }
    }
    
    if (unknownProps.length > 0) {
      errors.push(new ValidationError(`Unknown properties: ${unknownProps.join(', ')}`));
    }
  } else if (options.stripUnknown) {
    // If not stripping, we'd copy all properties
    for (const key of Object.keys(data as Record<string, unknown>)) {
      if (key in schema) {
        // Already validated
        continue;
      }
      // Skip unknown properties when stripping
    }
  } else {
    // Copy unknown properties when allowUnknown but not stripping
    for (const key of Object.keys(data as Record<string, unknown>)) {
      if (key in schema) {
        // Already validated
        continue;
      }
      validatedData[key] = (data as Record<string, unknown>)[key];
    }
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, data: validatedData as T };
}

/**
 * Validates an array of items against a schema
 * 
 * @param data - Array to validate
 * @param itemSchema - Schema for each item
 * @param options - Validation options
 * @returns Validation result with data or errors
 */
export function validateArray<T extends Record<string, unknown>>(
  data: unknown,
  itemSchema: Record<keyof T, PropertyValidator>,
  options: SchemaValidationOptions = {}
): ValidationResult<T[]> {
  if (!Array.isArray(data)) {
    return {
      success: false,
      errors: [new ValidationError('Data must be an array')]
    };
  }
  
  const validatedItems: T[] = [];
  const errors: ValidationError[] = [];
  
  data.forEach((item, index) => {
    const result = validateSchema<T>(item, itemSchema, options);
    if (result.success && result.data) {
      validatedItems.push(result.data);
    } else if (result.errors) {
      result.errors.forEach(error => {
        errors.push(new ValidationError(`Item at index ${index}: ${error.message}`));
      });
    }
  });
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, data: validatedItems };
}

/**
 * Creates a validator for API responses
 * 
 * @param schema - Schema to validate against
 * @returns Function that validates API response data
 */
export function createApiValidator<T extends Record<string, unknown>>(
  schema: Record<keyof T, PropertyValidator>
) {
  return (data: unknown): ValidationResult<T> => {
    return validateSchema<T>(data, schema, { allowUnknown: true });
  };
}
