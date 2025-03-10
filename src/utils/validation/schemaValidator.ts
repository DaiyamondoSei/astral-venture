import { ValidationError } from './runtimeValidation';

/**
 * Type for a schema validator function
 */
export type SchemaValidator<T> = (value: unknown, name: string) => T;

/**
 * Type for a validation schema object
 */
export type ValidationSchema<T> = {
  [K in keyof T]: SchemaValidator<T[K]>;
};

/**
 * Options for schema validation
 */
export interface SchemaValidationOptions {
  /** Whether to allow unknown properties */
  allowUnknown?: boolean;
  
  /** Whether to strip unknown properties */
  stripUnknown?: boolean;
  
  /** Whether to abort early on first error */
  abortEarly?: boolean;
}

/**
 * Validate an object against a schema
 * 
 * @param value - The value to validate
 * @param schema - The validation schema
 * @param options - Validation options
 * @returns The validated object
 * @throws ValidationError if validation fails
 */
export function validateSchema<T>(
  value: unknown,
  schema: ValidationSchema<T>,
  options: SchemaValidationOptions = {}
): T {
  // Make sure value is an object
  if (typeof value !== 'object' || value === null) {
    throw new ValidationError('Value must be an object', {
      code: 'VALIDATION_TYPE',
      details: { 
        expectedType: 'object', 
        actualType: value === null ? 'null' : typeof value
      }
    });
  }
  
  const { allowUnknown = false, stripUnknown = false, abortEarly = true } = options;
  
  const obj = value as Record<string, unknown>;
  const result: Partial<T> = {};
  const errors: Error[] = [];
  
  // Validate each field in the schema
  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      try {
        const validator = schema[key];
        const fieldValue = obj[key];
        
        // Validate the field
        result[key] = validator(fieldValue, key) as T[Extract<keyof T, string>];
      } catch (error) {
        if (abortEarly) {
          throw error;
        }
        
        errors.push(error as Error);
      }
    }
  }
  
  // Check for unknown properties
  if (!allowUnknown && !stripUnknown) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && !Object.prototype.hasOwnProperty.call(schema, key)) {
        const error = new ValidationError(`Unknown property: ${key}`, {
          code: 'VALIDATION_UNKNOWN',
          details: { unknownProperty: key }
        });
        
        if (abortEarly) {
          throw error;
        }
        
        errors.push(error);
      }
    }
  }
  
  // If we have errors and didn't abort early, throw a combined error
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', {
      code: 'VALIDATION_FAILED',
      details: { errors: errors.map(e => e.message) }
    });
  }
  
  // If stripUnknown is true, only include properties in the schema
  if (stripUnknown) {
    return result as T;
  }
  
  // Otherwise, include all properties from the original object
  if (allowUnknown) {
    return { ...obj, ...result } as unknown as T;
  }
  
  return result as T;
}

/**
 * Create a validation function for an object schema
 * 
 * @param schema - The validation schema
 * @param options - Validation options
 * @returns A validation function that validates objects against the schema
 */
export function createSchemaValidator<T>(
  schema: ValidationSchema<T>,
  options: SchemaValidationOptions = {}
): (value: unknown, name?: string) => T {
  return (value: unknown, name = 'value'): T => {
    try {
      return validateSchema(value, schema, options);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`${name}: ${error.message}`, {
          code: error.code,
          details: error.details,
          statusCode: error.statusCode
        });
      }
      throw error;
    }
  };
}

export default {
  validateSchema,
  createSchemaValidator
};
