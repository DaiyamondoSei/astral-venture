
/**
 * Simplified Validation Types
 */

// Validation error severity
export type ValidationSeverity = 'error' | 'warning' | 'info';

// Validation error code
export type ValidationErrorCode = string;

// Validation result interface
export interface ValidationResult<T = any> {
  isValid: boolean;
  value?: T;
  errors?: string[];
}

// Validator interface
export interface Validator<T = any> {
  (value: unknown): ValidationResult<T>;
}

// Validation options
export interface ValidationOptions {
  abortEarly?: boolean;
  strict?: boolean;
}
