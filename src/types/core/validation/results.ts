
/**
 * Validation system result types
 */
import { ValidationErrorCode, ErrorSeverity } from './types';

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
