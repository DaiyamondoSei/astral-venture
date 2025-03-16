
/**
 * Validation system type definitions
 * Following the Type-Value Pattern for type safety
 */

// Error severity levels
export type ErrorSeverity = 'error' | 'warning' | 'info';

// Validation error codes
export type ValidationErrorCode = 
  | 'REQUIRED' 
  | 'TYPE_ERROR' 
  | 'FORMAT_ERROR'
  | 'MIN_LENGTH_ERROR'
  | 'MAX_LENGTH_ERROR'
  | 'MIN_VALUE_ERROR'
  | 'MAX_VALUE_ERROR'
  | 'PATTERN_ERROR'
  | 'CONSTRAINT_ERROR'
  | 'FIELD_REQUIRED'
  | 'UNKNOWN_ERROR';

// Validation error detail structure
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code: ValidationErrorCode;
  severity: ErrorSeverity;
}

// Validation result interface
export interface ValidationResult<T> {
  valid: boolean;
  value?: T;
  errors?: ValidationErrorDetail[];
}
