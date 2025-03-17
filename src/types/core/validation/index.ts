
/**
 * Validation Types and Constants Index
 * 
 * This file serves as the central export point for all validation-related
 * types and their corresponding runtime constants.
 * 
 * @version 1.0.0
 */

// Export all types
export * from './types';

// Export all runtime constants
export * from './constants';

// Export additional utility types
export * from './results';

// Type guards for validation types
export const isValidationErrorDetail = (value: unknown): value is ValidationErrorDetail => {
  if (!value || typeof value !== 'object') return false;
  
  const detail = value as Partial<ValidationErrorDetail>;
  return (
    typeof detail.path === 'string' &&
    typeof detail.message === 'string' &&
    typeof detail.code === 'string' &&
    typeof detail.severity === 'string'
  );
};

export const isValidationResult = <T = unknown>(value: unknown): value is ValidationResult<T> => {
  if (!value || typeof value !== 'object') return false;
  
  const result = value as Partial<ValidationResult<T>>;
  return (
    typeof result.isValid === 'boolean' &&
    Array.isArray(result.errors)
  );
};

// Helper functions for creating validation results
export function createValidSuccess<T>(value: T): ValidationResult<T> {
  return {
    isValid: true,
    errors: [],
    value,
    validatedData: value
  };
}

export function createValidError<T>(code: ValidationErrorCode, message: string, path: string): ValidationResult<T> {
  return {
    isValid: false,
    errors: [{
      code,
      message,
      path,
      severity: 'error'
    }],
    value: undefined,
    validatedData: undefined
  };
}

export function createValidErrors<T>(errors: ValidationErrorDetail[]): ValidationResult<T> {
  return {
    isValid: false,
    errors,
    value: undefined,
    validatedData: undefined
  };
}

// Exported validation error class
export class ValidationError extends Error {
  code: ValidationErrorCode;
  path: string;
  severity: ErrorSeverity;
  metadata?: Record<string, unknown>;
  
  constructor(message: string, code: ValidationErrorCode, path: string, severity: ErrorSeverity = 'error') {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.path = path;
    this.severity = severity;
  }
  
  static fromErrorDetail(detail: ValidationErrorDetail): ValidationError {
    const error = new ValidationError(
      detail.message,
      detail.code,
      detail.path,
      detail.severity
    );
    
    if (detail.metadata) {
      error.metadata = detail.metadata;
    }
    
    return error;
  }
}
