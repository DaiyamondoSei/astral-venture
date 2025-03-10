
import { PostgrestError } from '@supabase/supabase-js';
import { ValidationError } from '@/utils/validation/ValidationError';

/**
 * Type guard to check if an object is a PostgrestError
 */
export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

/**
 * Safely extracts data from a Supabase response, with type validation
 * 
 * @param data The data to extract from a Supabase response
 * @param errorMsg The error message to show if extraction fails
 * @param validator Optional validation function to ensure data matches expected type
 * @returns Extracted and validated data
 * @throws ValidationError if data is invalid
 */
export function extractSupabaseData<T>(
  data: T | null | undefined,
  errorMsg: string,
  validator?: (data: unknown) => T
): T {
  if (data === null || data === undefined) {
    throw new ValidationError(errorMsg, {
      field: 'response',
      rule: 'required',
      details: 'Received null or undefined from database'
    });
  }
  
  if (validator) {
    try {
      return validator(data);
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }
      throw new ValidationError(`${errorMsg}: ${err instanceof Error ? err.message : String(err)}`, {
        field: 'response',
        rule: 'validation',
        originalError: err
      });
    }
  }
  
  return data;
}

/**
 * Safely extracts a Supabase result or throws appropriate errors
 */
export function unwrapSupabaseResult<T>(
  result: { data: T | null; error: PostgrestError | null },
  entityName: string,
  validator?: (data: unknown) => T
): T {
  if (result.error) {
    throw new ValidationError(`Error fetching ${entityName}: ${result.error.message}`, {
      field: entityName,
      details: result.error.details,
      originalError: result.error
    });
  }
  
  return extractSupabaseData(
    result.data,
    `No ${entityName} data found`,
    validator
  );
}

/**
 * Generic type helper to extract database row types from Supabase tables
 */
export type TableRow<T extends keyof any> = T extends any
  ? { id: string; [key: string]: any }
  : never;

/**
 * Safely handle Supabase errors in a consistent way
 */
export function handleSupabaseError(
  error: unknown,
  operation: string,
  entity: string
): ValidationError {
  if (isPostgrestError(error)) {
    return new ValidationError(`${operation} ${entity} failed: ${error.message}`, {
      field: entity,
      details: error.details,
      originalError: error
    });
  }
  
  if (error instanceof ValidationError) {
    return error;
  }
  
  return new ValidationError(
    `${operation} ${entity} failed: ${error instanceof Error ? error.message : String(error)}`,
    {
      field: entity,
      originalError: error
    }
  );
}
