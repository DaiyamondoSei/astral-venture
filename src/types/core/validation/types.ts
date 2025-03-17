
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
  field?: string; // For backward compatibility
}

// Validation error options used for creating errors
export interface ValidationErrorOptions {
  severity?: ErrorSeverity;
  details?: Record<string, unknown>;
  path?: string;
  originalError?: Error;
  code?: ValidationErrorCode;
}

// Validation result interface
export interface ValidationResult<T> {
  valid: boolean;
  value?: T;
  errors?: ValidationErrorDetail[];
}

/**
 * This interface can be used when generic type isn't needed
 * to avoid TS1149 errors with barrel files.
 */
export interface ValidationResultBase {
  valid: boolean;
  value?: any;
  errors?: ValidationErrorDetail[];
}

// Type for validation severity
export type ValidationSeverity = ErrorSeverity;
