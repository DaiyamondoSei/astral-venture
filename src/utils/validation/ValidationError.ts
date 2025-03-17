
/**
 * ValidationError class
 * A standardized error class for validation errors
 */
import { ValidationErrorDetail, ValidationErrorCode, ErrorSeverity, ValidationErrorOptions } from '@/types/core/validation/types';
import { ValidationErrorCodes, ErrorSeverities } from '@/types/core/validation/constants';

export class ValidationError extends Error {
  public readonly details: ValidationErrorDetail[];
  public readonly code: ValidationErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly path: string;
  public readonly originalError?: Error;

  constructor(message: string, options: ValidationErrorOptions = {}) {
    super(message);
    this.name = 'ValidationError';
    this.code = options.code || ValidationErrorCodes.UNKNOWN_ERROR;
    this.severity = options.severity || ErrorSeverities.ERROR;
    this.path = options.path || '';
    this.originalError = options.originalError;
    
    // If details were provided directly, use them
    // Otherwise, create a single detail from the message and options
    if (Array.isArray(options.details)) {
      this.details = options.details as ValidationErrorDetail[];
    } else {
      this.details = [{
        path: options.path || '',
        field: options.path || '', // For backwards compatibility
        message,
        code: this.code,
        severity: this.severity
      }];
    }
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Creates a required field error
   */
  static createRequiredError(fieldName: string): ValidationError {
    return new ValidationError(`Field '${fieldName}' is required`, {
      code: ValidationErrorCodes.REQUIRED,
      path: fieldName,
      severity: ErrorSeverities.ERROR
    });
  }

  /**
   * Creates a type error
   */
  static createTypeError(fieldName: string, expectedType: string): ValidationError {
    return new ValidationError(
      `Field '${fieldName}' must be of type '${expectedType}'`, 
      {
        code: ValidationErrorCodes.TYPE_ERROR,
        path: fieldName,
        severity: ErrorSeverities.ERROR
      }
    );
  }

  /**
   * Creates a format error
   */
  static createFormatError(fieldName: string, format: string): ValidationError {
    return new ValidationError(
      `Field '${fieldName}' must match format '${format}'`,
      {
        code: ValidationErrorCodes.FORMAT_ERROR,
        path: fieldName,
        severity: ErrorSeverities.ERROR
      }
    );
  }

  /**
   * Create an error from API response
   */
  static fromApiError(apiError: any): ValidationError {
    let message = 'API validation error';
    let details: ValidationErrorDetail[] = [];
    let code = ValidationErrorCodes.UNKNOWN_ERROR;
    
    if (apiError && typeof apiError === 'object') {
      // Handle common API error formats
      if (apiError.message) {
        message = apiError.message;
      }
      
      if (apiError.code) {
        code = apiError.code;
      }
      
      if (Array.isArray(apiError.details)) {
        details = apiError.details.map((detail: any) => ({
          path: detail.path || detail.field || '',
          field: detail.field || detail.path || '',
          message: detail.message || 'Invalid value',
          code: detail.code || ValidationErrorCodes.UNKNOWN_ERROR,
          severity: detail.severity || ErrorSeverities.ERROR
        }));
      }
    }
    
    return new ValidationError(message, {
      code,
      details
    });
  }
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

// Export convenience functions
export const createRequiredError = ValidationError.createRequiredError;
export const createTypeError = ValidationError.createTypeError;
