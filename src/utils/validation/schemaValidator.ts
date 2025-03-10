
import { z } from 'zod';
import { ValidationError } from './ValidationError';

/**
 * Result of validation with schema
 */
export interface ValidationResult<T> {
  /** Whether validation was successful */
  isValid: boolean;
  /** Validated and parsed data (if successful) */
  data?: T;
  /** Validation error (if unsuccessful) */
  error?: ValidationError;
}

/**
 * Validates data against a Zod schema with proper error handling
 * 
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @param options Additional validation options
 * @returns Validation result with parsed data or error
 */
export function validateWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
  options: {
    /** Field name for error messages */
    name?: string;
    /** Include raw data in error details */
    includeData?: boolean;
  } = {}
): ValidationResult<T> {
  const { name = 'input', includeData = false } = options;
  
  try {
    // Validate and parse data with the schema
    const validData = schema.parse(data);
    
    return {
      isValid: true,
      data: validData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod error to ValidationError
      const firstIssue = error.issues[0];
      const path = firstIssue.path.join('.');
      const fieldName = path ? `${name}.${path}` : name;
      
      // Create a user-friendly error message
      const message = firstIssue.message;
      
      // Create ValidationError with details
      const validationError = new ValidationError(
        message,
        fieldName,
        firstIssue.path.length ? getValueAtPath(data, firstIssue.path) : data,
        {
          rule: firstIssue.code,
          details: {
            issues: error.issues,
            ...(includeData ? { data } : {})
          }
        }
      );
      
      return {
        isValid: false,
        error: validationError
      };
    }
    
    // Handle other types of errors
    return {
      isValid: false,
      error: new ValidationError(
        error instanceof Error ? error.message : 'Validation failed',
        name,
        includeData ? data : undefined
      )
    };
  }
}

/**
 * Get a value at a specific path in an object
 * 
 * @param obj Object to get value from
 * @param path Path to the value
 * @returns Value at the path or undefined
 */
function getValueAtPath(obj: unknown, path: (string | number)[]): unknown {
  if (!obj || typeof obj !== 'object' || path.length === 0) {
    return undefined;
  }
  
  let current: any = obj;
  
  for (const key of path) {
    if (current === undefined || current === null) {
      return undefined;
    }
    
    current = current[key];
  }
  
  return current;
}

/**
 * Create a validator function for a specific schema
 * 
 * @param schema Zod schema to validate against
 * @param schemaName Name for error messages
 * @returns Validator function
 */
export function createSchemaValidator<T>(
  schema: z.ZodType<T>,
  schemaName?: string
): (data: unknown) => ValidationResult<T> {
  return (data: unknown) => validateWithSchema(schema, data, { name: schemaName });
}

/**
 * Assert that data conforms to a schema or throw an error
 * 
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @param name Name for error messages
 * @returns Validated and parsed data
 * @throws ValidationError if validation fails
 */
export function assertSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
  name = 'input'
): T {
  const result = validateWithSchema(schema, data, { name });
  
  if (!result.isValid) {
    throw result.error;
  }
  
  return result.data as T;
}

export default {
  validateWithSchema,
  createSchemaValidator,
  assertSchema
};
