
import { ValidationError } from './ValidationError';
import type { ZodError, ZodSchema } from 'zod';

/**
 * Creates a schema validator function using Zod schemas
 * 
 * @param schema - The Zod schema to validate against
 * @param errorMessage - Optional custom error message
 * @returns A validation function that validates data against the schema
 */
export function createSchemaValidator<T>(
  schema: ZodSchema<T>,
  errorMessage?: string
): (data: unknown) => T {
  return (data: unknown): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as ZodError;
        const firstError = zodError.errors[0];
        const errorPath = firstError.path.join('.');
        const errorMsg = firstError.message;
        
        throw new ValidationError(
          errorMessage || `Validation failed: ${errorPath ? `${errorPath}: ` : ''}${errorMsg}`,
          {
            rule: 'schema',
            details: {
              errors: zodError.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
                code: err.code
              }))
            }
          }
        );
      }
      
      throw new ValidationError(
        errorMessage || 'Schema validation failed',
        {
          rule: 'schema',
          details: { error: String(error) }
        }
      );
    }
  };
}

/**
 * Creates an API request validator for a specific endpoint
 * 
 * @param schema - The Zod schema for validating request body
 * @param endpointName - The name of the API endpoint (for error messages)
 * @returns A validation function for the API request
 */
export function createApiValidator<T>(
  schema: ZodSchema<T>,
  endpointName: string
): (data: unknown) => T {
  return createSchemaValidator(
    schema,
    `Invalid request to ${endpointName}`
  );
}

export default {
  createSchemaValidator,
  createApiValidator
};
