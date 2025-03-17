
/**
 * Validation system result types
 */
import { ValidationErrorCode, ErrorSeverity } from './types';
import { ValidationErrorCodes, ErrorSeverities } from './constants';

// Validation metadata for enhanced error details
export interface ValidationMetadata {
  executionTimeMs?: number;
  validatorName?: string;
  path?: string;
}

// Validation error detail with required properties
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code: ValidationErrorCode;
  severity: ErrorSeverity;
  metadata?: Record<string, unknown>;
}

// Validation result for generic type T
export interface ValidationResult<T> {
  isValid: boolean;
  errors: ValidationErrorDetail[];
  value?: T;
  metadata?: ValidationMetadata;
}

// Helper function to create a successful validation result
export function createSuccessResult<T>(value: T, metadata?: ValidationMetadata): ValidationResult<T> {
  return {
    isValid: true,
    errors: [],
    value,
    metadata
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
    this.expectedType = expectedType;
    this.details = [{
      path: field,
      message: message,
      code: code,
      severity: severity
    }];
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
