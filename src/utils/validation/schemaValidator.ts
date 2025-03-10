
import { z } from 'zod';
import { ValidationError } from './ValidationError';

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: ValidationError;
}

/**
 * Create a schema validator function
 */
export function createSchemaValidator<T>(schema: z.ZodType<T>) {
  return (data: unknown): ValidationResult<T> => {
    try {
      const result = schema.parse(data);
      return {
        isValid: true,
        data: result
      };
    } catch (err) {
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0];
        return {
          isValid: false,
          error: new ValidationError(
            firstError.message,
            'SCHEMA_VALIDATION_ERROR',
            firstError.path.join('.')
          )
        };
      }
      return {
        isValid: false,
        error: new ValidationError('Unknown validation error')
      };
    }
  };
}

/**
 * Validate data against a schema
 */
export function validateSchema<T>(
  data: unknown,
  schema: z.ZodType<T>
): ValidationResult<T> {
  const validator = createSchemaValidator(schema);
  return validator(data);
}

export default {
  createSchemaValidator,
  validateSchema
};
