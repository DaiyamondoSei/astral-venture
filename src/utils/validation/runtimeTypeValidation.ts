
import { z } from 'zod';

/**
 * Generic type for API response validation
 * T is the expected data type, defined by a Zod schema
 */
export interface ValidationResult<T> {
  isValid: boolean;
  data: T | null;
  errors: string[];
}

/**
 * Validate data against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns ValidationResult with typed data if valid
 */
export function validateData<T>(
  schema: z.ZodType<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      isValid: true,
      data: validatedData,
      errors: []
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        data: null,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    
    return {
      isValid: false,
      data: null,
      errors: [error instanceof Error ? error.message : 'Unknown validation error']
    };
  }
}

/**
 * Validate API response data and handle errors
 * @param schema Zod schema for the expected response data
 * @param data Raw response data from API
 * @param onError Optional callback for handling validation errors
 * @returns Typed and validated data or null if invalid
 */
export function validateApiResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  onError?: (errors: string[]) => void
): T | null {
  const result = validateData(schema, data);
  
  if (!result.isValid) {
    console.error('API response validation failed:', result.errors);
    if (onError) {
      onError(result.errors);
    }
    return null;
  }
  
  return result.data;
}

/**
 * Create a typed validation function for a specific schema
 * @param schema Zod schema to validate against
 * @returns Function that validates data against the schema
 */
export function createValidator<T>(schema: z.ZodType<T>) {
  return (data: unknown): ValidationResult<T> => validateData(schema, data);
}
