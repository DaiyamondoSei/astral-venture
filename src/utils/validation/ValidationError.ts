
/**
 * Validation Error Implementation
 * 
 * This module provides a custom error type for validation errors.
 */
import { ValidationErrorDetail } from '@/types/core/validation/types';
import { ValidationErrorCodes, ErrorSeverities } from '@/types/core/validation/constants';

export class ValidationError extends Error {
  /** Field that failed validation */
  field: string;
  
  /** Error code */
  code: string;
  
  /** Error details */
  details?: string | ValidationErrorDetail[];
  
  /** Validation rule that failed */
  rule?: string;
  
  /** Validation error details */
  validationErrors?: ValidationErrorDetail[];
  
  /** HTTP status code to use (optional) */
  statusCode?: number;
  
  constructor(
    message: string, 
    fieldOrDetails: string | { field?: string; rule?: string; details?: string } = '', 
    code: string = ValidationErrorCodes.VALIDATION_FAILED
  ) {
    super(message);
    this.name = 'ValidationError';
    
    if (typeof fieldOrDetails === 'string') {
      this.field = fieldOrDetails;
      this.code = code;
    } else {
      this.field = fieldOrDetails.field || '';
      this.rule = fieldOrDetails.rule;
      this.details = fieldOrDetails.details;
      this.code = code;
    }
    
    // Required for extending Error in TypeScript
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  /**
   * Create a ValidationError from validation error details
   */
  static fromValidationDetails(errors: ValidationErrorDetail[]): ValidationError {
    const primaryError = errors[0];
    const error = new ValidationError(
      primaryError.message,
      primaryError.path,
      primaryError.code
    );
    error.validationErrors = errors;
    return error;
  }
  
  /**
   * Get all error messages as a string array
   */
  public getMessages(): string[] {
    if (Array.isArray(this.validationErrors) && this.validationErrors.length > 0) {
      return this.validationErrors.map(detail => detail.message);
    }
    
    if (Array.isArray(this.details)) {
      return this.details.map(detail => detail.message);
    }
    
    return [this.message];
  }
  
  /**
   * Get errors for a specific field
   */
  public getFieldErrors(fieldName: string): ValidationErrorDetail[] {
    if (Array.isArray(this.validationErrors)) {
      return this.validationErrors.filter(detail => detail.path === fieldName);
    }
    
    if (Array.isArray(this.details)) {
      return this.details.filter(detail => detail.field === fieldName || detail.path === fieldName);
    }
    
    return [];
  }
  
  /**
   * Check if an error is a ValidationError
   */
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
}

/**
 * Check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export default ValidationError;
