
/**
 * Schema validation utilities
 */
import { z } from 'zod';
import { ValidationError } from './ValidationError';

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: string;
}

/**
 * Creates a schema for validating data
 * 
 * @param schema - Schema definition
 * @returns Schema object
 */
function createSchema<T>(schema: z.ZodType<T>) {
  return {
    /**
     * Validate data against the schema
     * 
     * @param data - Data to validate
     * @returns Validation result
     */
    validate: (data: unknown): ValidationResult<T> => {
      try {
        const result = schema.safeParse(data);
        if (result.success) {
          return {
            valid: true,
            data: result.data
          };
        } else {
          return {
            valid: false,
            error: result.error.message
          };
        }
      } catch (error) {
        return {
          valid: false,
          error: error instanceof Error ? error.message : 'Unknown validation error'
        };
      }
    },
    
    /**
     * Parse data with the schema, throwing errors if invalid
     * 
     * @param data - Data to parse
     * @returns Parsed data
     * @throws ValidationError if validation fails
     */
    parse: (data: unknown): T => {
      try {
        return schema.parse(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const firstError = error.errors[0];
          throw new ValidationError(
            firstError.message,
            firstError.path.join('.'),
            firstError.input
          );
        }
        throw error;
      }
    }
  };
}

export default createSchema;
