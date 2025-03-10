
/**
 * Type Validation Bridge
 * 
 * Provides consistent type validation across different environments.
 * This bridge ensures that type validation is handled the same way in:
 * - Frontend components
 * - Edge functions
 * - Workers
 */

import { ValidationError } from './ValidationError';
import { 
  validateString, 
  validateNumber, 
  validateBoolean, 
  validateArray, 
  validateObject,
  validateOneOf
} from './runtimeValidation';

/**
 * Validates an API request payload for type safety
 * 
 * @param payload - The request payload to validate
 * @param schema - Validation schema with field definitions
 * @returns The validated payload or throws ValidationError
 */
export function validateApiPayload<T extends Record<string, any>>(
  payload: unknown,
  schema: Record<keyof T, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    allowedValues?: any[];
    itemType?: 'string' | 'number' | 'boolean' | 'object';
    customValidator?: (value: any) => boolean;
    customMessage?: string;
  }>
): T {
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('Invalid payload: expected an object', {
      field: 'payload',
      expectedType: 'object'
    });
  }
  
  const result: Record<string, any> = {};
  const errors: Record<string, string> = {};

  // Validate each field according to schema
  for (const [field, definition] of Object.entries(schema)) {
    try {
      const value = (payload as Record<string, any>)[field];
      
      // Check if required field is missing
      if (definition.required && (value === undefined || value === null)) {
        throw new ValidationError(`${field} is required`, {
          field,
          rule: 'required'
        });
      }
      
      // Skip validation for optional fields that are not present
      if (!definition.required && (value === undefined || value === null)) {
        continue;
      }
      
      // Validate based on type
      let validatedValue: any;
      
      switch (definition.type) {
        case 'string':
          validatedValue = validateString(value, field);
          if (definition.allowedValues) {
            validatedValue = validateOneOf(
              validatedValue, 
              definition.allowedValues as string[], 
              field
            );
          }
          break;
        
        case 'number':
          validatedValue = validateNumber(value, field);
          if (definition.allowedValues) {
            validatedValue = validateOneOf(
              validatedValue, 
              definition.allowedValues as number[], 
              field
            );
          }
          break;
        
        case 'boolean':
          validatedValue = validateBoolean(value, field);
          break;
        
        case 'array':
          validatedValue = validateArray(value, field);
          break;
        
        case 'object':
          validatedValue = validateObject(value, field);
          break;
        
        default:
          throw new ValidationError(`Unknown type: ${definition.type}`, {
            field,
            rule: 'type'
          });
      }
      
      // Run custom validator if provided
      if (definition.customValidator && !definition.customValidator(validatedValue)) {
        throw new ValidationError(
          definition.customMessage || `${field} failed custom validation`,
          {
            field,
            rule: 'custom'
          }
        );
      }
      
      result[field] = validatedValue;
    } catch (error) {
      if (error instanceof ValidationError) {
        errors[field] = error.message;
      } else if (error instanceof Error) {
        errors[field] = error.message;
      } else {
        errors[field] = `Unknown error validating ${field}`;
      }
    }
  }
  
  // If there are validation errors, throw a schema validation error
  if (Object.keys(errors).length > 0) {
    throw ValidationError.schemaError('payload', errors);
  }
  
  return result as T;
}

/**
 * Validates API response data for type safety
 * 
 * @param data - The response data to validate
 * @param schema - Validation schema with field definitions
 * @returns The validated data or throws ValidationError
 */
export function validateApiResponse<T extends Record<string, any>>(
  data: unknown,
  schema: Record<keyof T, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    allowNull?: boolean;
  }>
): T {
  if (!data || typeof data !== 'object') {
    throw ValidationError.fromApiError(
      'Invalid API response: expected an object',
      500,
      { received: typeof data }
    );
  }
  
  const result: Record<string, any> = {};
  const errors: Record<string, string> = {};

  // Validate each field according to schema
  for (const [field, definition] of Object.entries(schema)) {
    try {
      const value = (data as Record<string, any>)[field];
      
      // Check if required field is missing
      if (definition.required && !definition.allowNull && (value === undefined || value === null)) {
        throw new ValidationError(`Required field '${field}' is missing in API response`, {
          field,
          rule: 'required'
        });
      }
      
      // Skip validation for null values if allowed
      if (value === null && definition.allowNull) {
        result[field] = null;
        continue;
      }
      
      // Skip validation for optional fields that are not present
      if (!definition.required && (value === undefined || value === null)) {
        continue;
      }
      
      // Validate based on type
      switch (definition.type) {
        case 'string':
          result[field] = validateString(value, field);
          break;
        
        case 'number':
          result[field] = validateNumber(value, field);
          break;
        
        case 'boolean':
          result[field] = validateBoolean(value, field);
          break;
        
        case 'array':
          result[field] = validateArray(value, field);
          break;
        
        case 'object':
          result[field] = validateObject(value, field);
          break;
        
        default:
          throw new ValidationError(`Unknown type: ${definition.type}`, {
            field,
            rule: 'type'
          });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        errors[field] = error.message;
      } else if (error instanceof Error) {
        errors[field] = error.message;
      } else {
        errors[field] = `Unknown error validating ${field}`;
      }
    }
  }
  
  // If there are validation errors, throw a schema validation error
  if (Object.keys(errors).length > 0) {
    throw ValidationError.fromApiError(
      'API response validation failed',
      500,
      { validationErrors: errors }
    );
  }
  
  return result as T;
}

export default {
  validateApiPayload,
  validateApiResponse
};
