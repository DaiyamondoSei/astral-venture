
/**
 * Validation Results Types
 * 
 * This module provides types and utilities for validation results.
 * 
 * @category Validation
 * @version 1.0.0
 */

/**
 * Severity levels for validation errors
 */
export enum ValidationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Error codes for validation errors
 */
export enum ValidationErrorCode {
  REQUIRED = 'required',
  FORMAT = 'format',
  TYPE = 'type',
  RANGE = 'range',
  PATTERN = 'pattern',
  CUSTOM = 'custom',
  SYSTEM = 'system'
}

/**
 * Context for validation operations
 */
export interface ValidationContext {
  path?: string;
  parent?: unknown;
  root?: unknown;
  options?: Record<string, unknown>;
}

/**
 * Detailed information about a validation error
 */
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code: ValidationErrorCode;
  severity: ValidationSeverity;
  value?: unknown;
  type?: string;
  rule?: string;
  context?: ValidationContext;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult<T = unknown> {
  valid: boolean;
  validatedData?: T;
  errors?: ValidationErrorDetail[];
}

/**
 * Check if an object is a validation error detail
 */
export function isValidationErrorDetail(obj: unknown): obj is ValidationErrorDetail {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const detail = obj as Partial<ValidationErrorDetail>;
  return (
    typeof detail.path === 'string' &&
    typeof detail.message === 'string' &&
    typeof detail.code === 'string' &&
    typeof detail.severity === 'string'
  );
}

/**
 * Check if an object is a validation result
 */
export function isValidationResult<T = unknown>(obj: unknown): obj is ValidationResult<T> {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const result = obj as Partial<ValidationResult<T>>;
  return (
    typeof result.valid === 'boolean' &&
    (result.errors === undefined || 
      (Array.isArray(result.errors) && 
        result.errors.every(error => isValidationErrorDetail(error))))
  );
}

/**
 * Create a successful validation result
 */
export function createValidSuccess<T>(data: T): ValidationResult<T> {
  return {
    valid: true,
    validatedData: data
  };
}

/**
 * Create a validation error result with a single error
 */
export function createValidError<T = unknown>(
  message: string, 
  path: string = '',
  code: ValidationErrorCode = ValidationErrorCode.CUSTOM,
  severity: ValidationSeverity = ValidationSeverity.ERROR,
  value?: unknown
): ValidationResult<T> {
  return {
    valid: false,
    errors: [{
      path,
      message,
      code,
      severity,
      value
    }]
  };
}

/**
 * Create a validation error result with multiple errors
 */
export function createValidErrors<T = unknown>(
  errors: ValidationErrorDetail[]
): ValidationResult<T> {
  return {
    valid: false,
    errors
  };
}

/**
 * ValidationError class for throwing validation errors
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details: ValidationErrorDetail[],
    public readonly code: ValidationErrorCode = ValidationErrorCode.CUSTOM
  ) {
    super(message);
    this.name = 'ValidationError';
  }
  
  /**
   * Convert to ValidationResult
   */
  toValidationResult<T = unknown>(): ValidationResult<T> {
    return {
      valid: false,
      errors: this.details
    };
  }
  
  /**
   * Create ValidationError from ValidationResult
   */
  static fromValidationResult<T>(result: ValidationResult<T>): ValidationError {
    if (result.valid || !result.errors || result.errors.length === 0) {
      return new ValidationError(
        'Unknown validation error',
        [{
          path: '',
          message: 'Unknown validation error',
          code: ValidationErrorCode.SYSTEM,
          severity: ValidationSeverity.ERROR
        }]
      );
    }
    
    return new ValidationError(
      result.errors[0].message,
      result.errors,
      result.errors[0].code as ValidationErrorCode
    );
  }
}
