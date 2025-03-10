
import { ValidationError } from './ValidationError';
import { z } from 'zod';

/**
 * Results of a validation operation
 */
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: string;
}

/**
 * Creates an API validator function using a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param options - Optional configuration
 * @returns Validator function for API data
 */
export function createApiValidator<T>(
  schema: z.ZodType<T>,
  options: {
    name?: string;
    strictMode?: boolean;
  } = {}
) {
  const { name = 'data', strictMode = true } = options;
  
  return function validate(data: unknown): ValidationResult<T> {
    try {
      const result = schema.parse(data);
      return {
        isValid: true,
        data: result
      };
    } catch (error) {
      let errorMessage = 'Invalid data format';
      
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        errorMessage = `${firstError.path.join('.')} ${firstError.message}`;
        
        // In strict mode, throw a ValidationError with detailed info
        if (strictMode) {
          throw new ValidationError(
            errorMessage,
            firstError.path.join('.') || name,
            firstError.code,
            'SCHEMA_VALIDATION_ERROR',
            { zodErrors: error.errors }
          );
        }
      }
      
      return {
        isValid: false,
        error: errorMessage
      };
    }
  };
}

/**
 * Provides runtime schema validation utilities
 * for API requests and responses
 */
export function createValidationSchema<T>(
  schema: z.ZodType<T>,
  name?: string
) {
  return {
    /**
     * Validates the input against the schema
     */
    validate: (data: unknown): ValidationResult<T> => {
      try {
        const result = schema.parse(data);
        return { isValid: true, data: result };
      } catch (error) {
        let errorMessage = 'Validation failed';
        
        if (error instanceof z.ZodError) {
          const issues = error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          
          errorMessage = issues;
        }
        
        return {
          isValid: false,
          error: errorMessage
        };
      }
    },
    
    /**
     * Parses the input with the schema, throwing on error
     */
    parse: (data: unknown): T => {
      return schema.parse(data);
    },

    /**
     * Attempts to parse and returns null on error
     */
    safeParse: (data: unknown): T | null => {
      try {
        return schema.parse(data);
      } catch (error) {
        return null;
      }
    },
  };
}

export default createApiValidator;
