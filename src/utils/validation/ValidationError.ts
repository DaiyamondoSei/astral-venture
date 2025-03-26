
import { ValidationErrorDetail, ValidationSeverity } from '@/types/core/validation/types';
import { ValidationErrorCodes, ErrorSeverities } from '@/types/core/validation/constants';

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  public code: string;
  public details?: ValidationErrorDetail[];
  public severity: ValidationSeverity;
  
  constructor(
    message: string,
    code = ValidationErrorCodes.VALIDATION_FAILED,
    details?: ValidationErrorDetail[],
    severity = ErrorSeverities.ERROR
  ) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.details = details;
    this.severity = severity;
  }
  
  /**
   * Create an error from an API error response
   */
  static fromApiError(apiError: any): ValidationError {
    const message = apiError?.message || 'API validation error';
    const code = apiError?.code || ValidationErrorCodes.VALIDATION_FAILED;
    const details = apiError?.details || undefined;
    
    return new ValidationError(message, code, details);
  }
  
  /**
   * Create an error with pre-formatted path details
   */
  static atPath(path: string, message: string, code = ValidationErrorCodes.VALIDATION_FAILED): ValidationError {
    return new ValidationError(message, code, [
      { path, message, code, severity: ErrorSeverities.ERROR }
    ]);
  }
  
  /**
   * Create a required field error
   */
  static required(path: string): ValidationError {
    return ValidationError.atPath(
      path,
      `${path} is required`,
      ValidationErrorCodes.REQUIRED
    );
  }
  
  /**
   * Create a type error
   */
  static typeError(path: string, expectedType: string): ValidationError {
    return ValidationError.atPath(
      path,
      `${path} must be of type ${expectedType}`,
      ValidationErrorCodes.TYPE_ERROR
    );
  }
  
  /**
   * Create a range error
   */
  static rangeError(path: string, min?: number, max?: number): ValidationError {
    let message = `${path} is out of valid range`;
    if (min !== undefined && max !== undefined) {
      message = `${path} must be between ${min} and ${max}`;
    } else if (min !== undefined) {
      message = `${path} must be at least ${min}`;
    } else if (max !== undefined) {
      message = `${path} must be at most ${max}`;
    }
    
    return ValidationError.atPath(
      path,
      message,
      ValidationErrorCodes.RANGE_ERROR
    );
  }
  
  /**
   * Create a format error
   */
  static formatError(path: string, format: string): ValidationError {
    return ValidationError.atPath(
      path,
      `${path} must be in ${format} format`,
      ValidationErrorCodes.FORMAT_ERROR
    );
  }
}
