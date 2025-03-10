
import { ValidationError, isValidationError } from './runtimeValidation';
import { ValidationSchema, validateSchema } from './schemaValidator';
import { ErrorCategory, ErrorSeverity, handleError } from '../errorHandling';

/**
 * Options for API data validation
 */
export interface ApiValidationOptions {
  /** Field name for error reporting */
  fieldName?: string;
  /** Error category for classification */
  category?: ErrorCategory;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Whether to include validation errors in the response */
  includeValidationErrors?: boolean;
}

/**
 * Result of an API data validation
 */
export interface ApiValidationResult<T> {
  /** Whether the validation was successful */
  isValid: boolean;
  /** The validated data (if successful) */
  data?: T;
  /** Error message (if unsuccessful) */
  error?: string;
  /** Validation errors (if unsuccessful and includeValidationErrors is true) */
  validationErrors?: ValidationError[];
}

/**
 * Safely validates API data against a schema
 * 
 * @param data - Data to validate
 * @param schema - Validation schema
 * @param options - Validation options
 * @returns Validation result
 */
export function validateApiData<T extends Record<string, unknown>>(
  data: unknown,
  schema: ValidationSchema<T>,
  options: ApiValidationOptions = {}
): ApiValidationResult<T> {
  try {
    const validatedData = validateSchema(data, schema);
    return {
      isValid: true,
      data: validatedData
    };
  } catch (error) {
    // Handle validation errors
    if (isValidationError(error)) {
      // Log the error with our centralized error handling
      handleError(error, {
        category: options.category || ErrorCategory.VALIDATION,
        severity: options.severity || ErrorSeverity.WARNING,
        context: `API Validation${options.fieldName ? ` (${options.fieldName})` : ''}`,
        showToast: false,
        metadata: {
          data,
          validationError: error
        }
      });
      
      return {
        isValid: false,
        error: error.message,
        ...(options.includeValidationErrors ? { validationErrors: [error] } : {})
      };
    }
    
    // Handle unexpected errors
    const unexpectedError = error instanceof Error 
      ? error 
      : new Error(String(error));
    
    handleError(unexpectedError, {
      category: ErrorCategory.UNEXPECTED,
      severity: ErrorSeverity.ERROR,
      context: `API Validation${options.fieldName ? ` (${options.fieldName})` : ''}`,
      showToast: false,
      metadata: { data }
    });
    
    return {
      isValid: false,
      error: 'An unexpected error occurred during validation'
    };
  }
}

/**
 * Validates API data and throws if invalid
 * 
 * @param data - Data to validate
 * @param schema - Validation schema
 * @param options - Validation options
 * @returns Validated data
 * @throws ValidationError if validation fails
 */
export function validateApiDataOrThrow<T extends Record<string, unknown>>(
  data: unknown,
  schema: ValidationSchema<T>,
  options: ApiValidationOptions = {}
): T {
  try {
    return validateSchema(data, schema);
  } catch (error) {
    if (isValidationError(error)) {
      // Add status code for API responses
      if (!error.statusCode) {
        error.statusCode = 400;
      }
      
      // Log the error
      handleError(error, {
        category: options.category || ErrorCategory.VALIDATION,
        severity: options.severity || ErrorSeverity.WARNING,
        context: `API Validation${options.fieldName ? ` (${options.fieldName})` : ''}`,
        showToast: false
      });
      
      throw error;
    }
    
    // Convert unexpected errors to ValidationError
    const validationError = new ValidationError(
      'Invalid data format',
      {
        code: 'INVALID_DATA',
        statusCode: 400,
        details: { error }
      }
    );
    
    // Log the error
    handleError(validationError, {
      category: ErrorCategory.UNEXPECTED,
      severity: ErrorSeverity.ERROR,
      context: `API Validation${options.fieldName ? ` (${options.fieldName})` : ''}`,
      showToast: false
    });
    
    throw validationError;
  }
}

export default {
  validateApiData,
  validateApiDataOrThrow
};
