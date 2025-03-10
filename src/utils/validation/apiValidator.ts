
import { ValidationError, validateObject } from './runtimeValidation';
import { createSchemaValidator, ValidationSchema } from './schemaValidator';
import { handleError, ErrorCategory } from '@/utils/errorHandling';

/**
 * API validation result
 */
export interface ApiValidationResult<T> {
  /** Whether the validation was successful */
  isValid: boolean;
  
  /** The validated data */
  data?: T;
  
  /** Error message if validation failed */
  error?: string;
}

/**
 * Validate an API response using a schema
 * 
 * @param response - The API response to validate
 * @param schema - The validation schema to use
 * @param context - Context name for error handling
 * @returns Validation result with data if valid
 */
export async function validateApiResponse<T>(
  response: Response,
  schema: ValidationSchema<T>,
  context = 'API'
): Promise<ApiValidationResult<T>> {
  try {
    // Check if response is OK
    if (!response.ok) {
      let errorData = null;
      
      try {
        errorData = await response.json();
      } catch (e) {
        // If we can't parse the error, just use the status text
        errorData = { error: response.statusText };
      }
      
      const errorMessage = errorData?.error || errorData?.message || `API error: ${response.status}`;
      
      throw new ValidationError(errorMessage, {
        code: 'API_ERROR',
        details: {
          status: response.status,
          url: response.url,
          errorData
        },
        statusCode: response.status
      });
    }
    
    // Parse the response
    const data = await response.json();
    
    // Create a validator from the schema
    const validator = createSchemaValidator(schema, {
      allowUnknown: true
    });
    
    // Validate the data
    const validatedData = validator(data, 'response');
    
    // Return successful result
    return {
      isValid: true,
      data: validatedData
    };
  } catch (error) {
    // Handle the error
    handleError(error, {
      category: ErrorCategory.VALIDATION,
      context,
      showToast: true
    });
    
    // Return error result
    return {
      isValid: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Options for the API validator
 */
export interface ApiValidatorOptions {
  /** Context name for error handling */
  context?: string;
  
  /** Whether to throw on validation errors */
  throwOnError?: boolean;
  
  /** Custom error handler */
  onError?: (error: unknown) => void;
}

/**
 * Create an API response validator function for a specific schema
 * 
 * @param schema - The validation schema to use
 * @param options - Validator options
 * @returns A function that validates API responses against the schema
 */
export function createApiValidator<T>(
  schema: ValidationSchema<T>,
  options: ApiValidatorOptions = {}
): (response: Response) => Promise<ApiValidationResult<T>> {
  const { context = 'API', throwOnError = false, onError } = options;
  
  return async (response: Response): Promise<ApiValidationResult<T>> => {
    try {
      const result = await validateApiResponse(response, schema, context);
      
      if (!result.isValid && throwOnError) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      if (onError) {
        onError(error);
      }
      
      if (throwOnError) {
        throw error;
      }
      
      return {
        isValid: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };
}

export default {
  validateApiResponse,
  createApiValidator
};
