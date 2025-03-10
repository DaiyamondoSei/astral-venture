
import { ValidationError } from './ValidationError';
import {
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateOneOf,
  validateDefined
} from './runtimeValidation';

/**
 * Validates an API response
 * 
 * @param response - The API response to validate
 * @param apiName - The name of the API for error messages
 * @returns The validated response
 * @throws ValidationError if validation fails
 */
export async function validateApiResponse<T>(
  response: Response, 
  apiName: string
): Promise<T> {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new ValidationError(
        `API error from ${apiName}: ${errorData.message || response.statusText}`,
        {
          statusCode: response.status,
          details: errorData
        }
      );
    } catch (error) {
      // If we can't parse the error JSON, throw a basic error
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new ValidationError(
        `API error from ${apiName}: ${response.statusText}`,
        {
          statusCode: response.status
        }
      );
    }
  }
  
  try {
    const data = await response.json();
    return data as T;
  } catch (error) {
    throw new ValidationError(
      `Failed to parse JSON response from ${apiName}`,
      {
        statusCode: 500,
        details: { originalError: String(error) }
      }
    );
  }
}

/**
 * Validates query parameters for an API request
 * 
 * @param params - The query parameters to validate
 * @param validations - The validation rules for each parameter
 * @returns The validated query parameters
 * @throws ValidationError if validation fails
 */
export function validateQueryParams(
  params: Record<string, string | string[] | undefined>,
  validations: Record<string, (value: unknown, name: string) => unknown>
): Record<string, unknown> {
  const validated: Record<string, unknown> = {};
  
  for (const [key, validator] of Object.entries(validations)) {
    try {
      validated[key] = validator(params[key], key);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(`Invalid query parameter: ${key}`, {
        details: { originalError: String(error) }
      });
    }
  }
  
  return validated;
}

/**
 * Validates request body for an API request
 * 
 * @param body - The request body to validate
 * @param validations - The validation rules for the body
 * @returns The validated request body
 * @throws ValidationError if validation fails
 */
export function validateRequestBody<T extends Record<string, unknown>>(
  body: unknown,
  validations: Record<keyof T, (value: unknown, name: string) => unknown>
): T {
  try {
    const validatedBody = validateObject(body, 'request body');
    const result: Record<string, unknown> = {};
    
    for (const [key, validator] of Object.entries(validations)) {
      result[key] = validator(validatedBody[key], key);
    }
    
    return result as T;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid request body', {
      details: { originalError: String(error) }
    });
  }
}

/**
 * Creates a parameter validator with a default value
 * 
 * @param validator - The validator function to use
 * @param defaultValue - The default value to use if the parameter is undefined
 * @returns A validator function that applies the default value
 */
export function withDefaultParam<T>(
  validator: (value: unknown, name: string) => T,
  defaultValue: T
): (value: unknown, name: string) => T {
  return (value: unknown, name: string): T => {
    if (value === undefined) {
      return defaultValue;
    }
    return validator(value, name);
  };
}

/**
 * Validates a required parameter
 * 
 * @param validator - The validator function to use
 * @returns A validator function that ensures the parameter is defined
 */
export function required<T>(
  validator: (value: unknown, name: string) => T
): (value: unknown, name: string) => T {
  return (value: unknown, name: string): T => {
    if (value === undefined) {
      throw new ValidationError(`${name} is required`, {
        rule: 'required'
      });
    }
    return validator(value, name);
  };
}

export default {
  validateApiResponse,
  validateQueryParams,
  validateRequestBody,
  withDefaultParam,
  required
};
