
/**
 * Validation Result Types
 * 
 * This module provides standardized types for representing validation results.
 */
import { ValidationErrorDetail } from './types';

/**
 * Result of a validation operation.
 * Contains information about whether validation succeeded, the validated value,
 * and any validation errors that occurred.
 */
export interface ValidationResult<T> {
  /** Whether validation succeeded */
  isValid: boolean;
  
  /** The validated value if validation succeeded */
  value?: T;
  
  /** Any validation errors that occurred */
  errors?: ValidationErrorDetail[];
}

/**
 * Create a successful validation result
 */
export function createSuccessResult<T>(value: T): ValidationResult<T> {
  return {
    isValid: true,
    value
  };
}

/**
 * Create a failed validation result
 */
export function createErrorResult<T>(errors: ValidationErrorDetail | ValidationErrorDetail[]): ValidationResult<T> {
  return {
    isValid: false,
    errors: Array.isArray(errors) ? errors : [errors]
  };
}

/**
 * Create a validation result based on a condition
 */
export function createConditionalResult<T>(
  condition: boolean, 
  value: T, 
  error: ValidationErrorDetail
): ValidationResult<T> {
  return condition
    ? createSuccessResult(value)
    : createErrorResult<T>(error);
}

export class ValidationError extends Error {
  path: string;
  code: string;
  details?: string;
  
  constructor(message: string, path: string, code: string, details?: string) {
    super(message);
    this.name = 'ValidationError';
    this.path = path;
    this.code = code;
    this.details = details;
    
    // Required for extending Error in TypeScript
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
