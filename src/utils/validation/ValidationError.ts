
/**
 * Validation Error Class
 * 
 * A specialized error class for validation errors with rich metadata
 */
import { ValidationErrorDetail, ValidationErrorCodes, ErrorSeverities } from './types';

export class ValidationError extends Error {
  details: ValidationErrorDetail[];
  
  constructor(message: string, details: ValidationErrorDetail[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    
    // Capture stack trace properly in modern JS environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
  
  /**
   * Create a field required error
   */
  static requiredError(path: string, message?: string): ValidationError {
    return new ValidationError(
      message || `Field ${path} is required`,
      [{
        path,
        message: message || `Field ${path} is required`,
        code: ValidationErrorCodes.REQUIRED,
        severity: ErrorSeverities.ERROR
      }]
    );
  }
  
  /**
   * Create a type error
   */
  static typeError(path: string, expectedType: string, message?: string): ValidationError {
    return new ValidationError(
      message || `Field ${path} must be of type ${expectedType}`,
      [{
        path,
        message: message || `Field ${path} must be of type ${expectedType}`,
        code: ValidationErrorCodes.TYPE_ERROR,
        severity: ErrorSeverities.ERROR
      }]
    );
  }
  
  /**
   * Create a format error
   */
  static formatError(path: string, format: string, message?: string): ValidationError {
    return new ValidationError(
      message || `Field ${path} must match format ${format}`,
      [{
        path,
        message: message || `Field ${path} must match format ${format}`,
        code: ValidationErrorCodes.FORMAT_ERROR,
        severity: ErrorSeverities.ERROR
      }]
    );
  }
  
  /**
   * Create a range error
   */
  static rangeError(path: string, min?: number, max?: number, message?: string): ValidationError {
    let defaultMessage = `Field ${path} is out of range`;
    if (min !== undefined && max !== undefined) {
      defaultMessage = `Field ${path} must be between ${min} and ${max}`;
    } else if (min !== undefined) {
      defaultMessage = `Field ${path} must be at least ${min}`;
    } else if (max !== undefined) {
      defaultMessage = `Field ${path} must be at most ${max}`;
    }
    
    return new ValidationError(
      message || defaultMessage,
      [{
        path,
        message: message || defaultMessage,
        code: min !== undefined ? ValidationErrorCodes.MIN_VALUE_ERROR : ValidationErrorCodes.MAX_VALUE_ERROR,
        severity: ErrorSeverities.ERROR
      }]
    );
  }
  
  /**
   * Create an API error from existing error detail
   */
  static fromApiError(error: any): ValidationError {
    if (error instanceof ValidationError) {
      return error;
    }
    
    const message = error.message || 'API Validation Error';
    const details: ValidationErrorDetail[] = [];
    
    if (error.details && Array.isArray(error.details)) {
      error.details.forEach((detail: Record<string, any> | ValidationErrorDetail) => {
        details.push({
          path: detail.path || '',
          message: detail.message || 'Unknown validation error',
          code: ValidationErrorCodes.UNKNOWN_ERROR,
          severity: ErrorSeverities.ERROR
        });
      });
    }
    
    return new ValidationError(message, details);
  }
  
  /**
   * Gets a formatted message suitable for UI display
   */
  getFormattedMessage(): string {
    if (this.details.length === 0) {
      return this.message;
    }
    
    return this.details.map(detail => detail.message).join('\n');
  }
  
  /**
   * Gets UI friendly details for rendering
   */
  getUIDetails(): Record<string, string> {
    const result: Record<string, string> = {};
    
    this.details.forEach(detail => {
      result[detail.path || 'general'] = detail.message;
    });
    
    return result;
  }
}
