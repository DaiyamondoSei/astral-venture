
/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  public readonly details: ValidationErrorDetail[] = [];
  public readonly code: ValidationErrorCode;
  public readonly statusCode: number;
  
  /**
   * Create a new validation error
   * 
   * @param message Error message
   * @param details Error details (optional)
   * @param code Error code (optional)
   * @param statusCode HTTP status code (optional)
   */
  constructor(
    message: string, 
    details?: ValidationErrorDetail | ValidationErrorDetail[],
    code: ValidationErrorCode = ValidationErrorCode.VALIDATION_ERROR,
    statusCode: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.statusCode = statusCode;
    
    if (details) {
      this.details = Array.isArray(details) ? details : [details];
    }

    // Ensure Error stack traces work properly in modern JS engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Create an error from an API response
   */
  static fromApiError(apiError: any): ValidationError {
    // Default values
    let message = "Validation failed";
    let details: ValidationErrorDetail[] = [];
    let code = ValidationErrorCode.VALIDATION_ERROR;
    let statusCode = 400;

    if (apiError) {
      message = apiError.message || message;
      statusCode = apiError.status || apiError.statusCode || statusCode;
      
      // Handle Supabase error format
      if (apiError.details || apiError.hint || apiError.code) {
        details = [{
          path: apiError.details || 'unknown',
          message: apiError.hint || apiError.message || 'Unknown error',
          severity: ValidationSeverity.ERROR
        }];
      }
    }

    return new ValidationError(message, details, code, statusCode);
  }
}

/**
 * Validation error codes
 */
export enum ValidationErrorCode {
  VALIDATION_ERROR = 'validation_error',
  REQUIRED = 'required',
  FORMAT = 'format',
  TYPE = 'type',
  CONSTRAINT = 'constraint',
  LOGIC = 'logic',
  RANGE = 'range',
  SCHEMA = 'schema'
}

/**
 * Validation error severity levels
 */
export enum ValidationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

/**
 * Validation error detail structure
 */
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code?: ValidationErrorCode;
  rule?: string;
  value?: unknown;
  severity: ValidationSeverity;
}

/**
 * Check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Helper to create a validation error for a required field
 */
export function requiredFieldError(fieldName: string): ValidationErrorDetail {
  return {
    path: fieldName,
    message: `The ${fieldName} field is required`,
    code: ValidationErrorCode.REQUIRED,
    severity: ValidationSeverity.ERROR
  };
}

/**
 * Helper to create a validation error for an invalid type
 */
export function typeError(fieldName: string, expectedType: string): ValidationErrorDetail {
  return {
    path: fieldName,
    message: `The ${fieldName} field must be a ${expectedType}`,
    code: ValidationErrorCode.TYPE,
    severity: ValidationSeverity.ERROR
  };
}

/**
 * Helper to create a validation error for a range constraint
 */
export function rangeError(fieldName: string, min?: number, max?: number): ValidationErrorDetail {
  let message = `The ${fieldName} field has an invalid value`;
  
  if (min !== undefined && max !== undefined) {
    message = `The ${fieldName} field must be between ${min} and ${max}`;
  } else if (min !== undefined) {
    message = `The ${fieldName} field must be at least ${min}`;
  } else if (max !== undefined) {
    message = `The ${fieldName} field must not exceed ${max}`;
  }
  
  return {
    path: fieldName,
    message,
    code: ValidationErrorCode.RANGE,
    severity: ValidationSeverity.ERROR
  };
}

/**
 * Helper to create a validation error for an invalid format
 */
export function formatError(fieldName: string, format: string): ValidationErrorDetail {
  return {
    path: fieldName,
    message: `The ${fieldName} field must be in ${format} format`,
    code: ValidationErrorCode.FORMAT,
    severity: ValidationSeverity.ERROR
  };
}
