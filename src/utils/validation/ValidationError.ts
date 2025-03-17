
/**
 * Validation Error Implementation
 * 
 * This module provides a custom error type for validation errors.
 */
import { ValidationErrorDetail } from '@/types/core/validation/types';
import { ValidationErrorCodes, ValidationSeverities } from '@/types/core/validation/constants';

export class ValidationError extends Error {
  /** Field that failed validation */
  field: string;
  
  /** Error code */
  code: string;
  
  /** Error details */
  details?: string;
  
  /** Validation rule that failed */
  rule?: string;
  
  /** Validation error details */
  validationErrors?: ValidationErrorDetail[];
  
  constructor(message: string, field: string, code: string, details?: string, rule?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
    this.details = details;
    this.rule = rule;
    
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
      primaryError.code,
      undefined,
      undefined
    );
    error.validationErrors = errors;
    return error;
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
