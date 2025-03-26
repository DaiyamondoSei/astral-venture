
/**
 * Validation Types
 * 
 * Core type definitions for the validation system
 */

// Validation error severity
export type ValidationSeverity = 'error' | 'warning' | 'info';

// Validation error code
export type ValidationErrorCode = string;

// Validation error detail interface
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code?: ValidationErrorCode;
  severity?: ValidationSeverity;
  rule?: string;
}

// Validation result interface
export interface ValidationResult<T = any> {
  isValid: boolean;
  value?: T;
  errors?: string[] | ValidationErrorDetail[];
  validatedData?: T;
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

// Validation context
export interface ValidationContext {
  path?: string;
  parent?: unknown;
  root?: unknown;
}

// Validation schema interface
export interface ValidationSchema {
  validate: (value: unknown, options?: ValidationOptions) => ValidationResult<any>;
}

// Type guard for validation result
export function isValidationResult<T>(value: unknown): value is ValidationResult<T> {
  return value !== null && 
         typeof value === 'object' && 
         'isValid' in value;
}

// Type guard for validation error detail
export function isValidationErrorDetail(value: unknown): value is ValidationErrorDetail {
  return value !== null && 
         typeof value === 'object' && 
         'path' in value && 
         'message' in value;
}
