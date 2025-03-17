
/**
 * Validation system result types
 */
import { ValidationErrorCode, ErrorSeverity, ValidationResult, ValidationErrorDetail } from './types';
import { ValidationErrorCodes, ErrorSeverities } from './constants';

// Validation metadata for enhanced error details
export interface ValidationMetadata {
  executionTimeMs?: number;
  validatorName?: string;
  path?: string;
}

// Helper function to create a successful validation result
export function createSuccessResult<T>(value: T, metadata?: ValidationMetadata): ValidationResult<T> {
  return {
    isValid: true,
    errors: [],
    value,
    validatedData: value // For backward compatibility
  };
}

// Helper function to create a failed validation result
export function createErrorResult<T>(
  errors: ValidationErrorDetail[], 
  metadata?: ValidationMetadata
): ValidationResult<T> {
  return {
    isValid: false,
    errors,
    metadata
  };
}

// Create a validation error with standardized format
export class ValidationError extends Error {
  public field: string;
  public details: ValidationErrorDetail[];
  public expectedType?: string;
  public code: ValidationErrorCode;

  constructor(
    message: string,
    field: string = '',
    code: ValidationErrorCode = ValidationErrorCodes.VALIDATION_FAILED,
    severity: ErrorSeverity = ErrorSeverities.ERROR,
    expectedType?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
    this.expectedType = expectedType;
    this.details = [{
      path: field,
      message: message,
      code: code,
      severity: severity
    }];
  }

  // Static helper methods
  static requiredError(field: string, message?: string): ValidationError {
    return new ValidationError(
      message || `Field '${field}' is required`,
      field,
      ValidationErrorCodes.REQUIRED
    );
  }

  static typeError(field: string, expectedType: string, message?: string): ValidationError {
    return new ValidationError(
      message || `Field '${field}' must be a ${expectedType}`,
      field,
      ValidationErrorCodes.TYPE_ERROR,
      ErrorSeverities.ERROR,
      expectedType
    );
  }

  static formatError(field: string, format: string, message?: string): ValidationError {
    return new ValidationError(
      message || `Field '${field}' must match format: ${format}`,
      field,
      ValidationErrorCodes.FORMAT_ERROR
    );
  }
}

// Type guards for validation result types
export function isValidationErrorDetail(obj: unknown): obj is ValidationErrorDetail {
  if (!obj || typeof obj !== 'object') return false;
  
  const detail = obj as Partial<ValidationErrorDetail>;
  return (
    typeof detail.path === 'string' &&
    typeof detail.message === 'string' &&
    typeof detail.code === 'string' &&
    typeof detail.severity === 'string'
  );
}

export function isValidationResult<T>(obj: unknown): obj is ValidationResult<T> {
  if (!obj || typeof obj !== 'object') return false;
  
  const result = obj as Partial<ValidationResult<T>>;
  return (
    typeof result.isValid === 'boolean' &&
    Array.isArray(result.errors)
  );
}

// Additional helper functions for creating validation results
export function createValidSuccess<T>(value: T): ValidationResult<T> {
  return createSuccessResult(value);
}

export function createValidError<T>(message: string, path: string = ''): ValidationResult<T> {
  return createErrorResult<T>([{
    path,
    message,
    code: ValidationErrorCodes.VALIDATION_FAILED,
    severity: ErrorSeverities.ERROR
  }]);
}

export function createValidErrors<T>(errors: ValidationErrorDetail[]): ValidationResult<T> {
  return createErrorResult<T>(errors);
}
