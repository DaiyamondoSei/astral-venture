
/**
 * Core Validation Type System
 * 
 * This module provides the foundation for our validation system with
 * properly defined types, interfaces, and utilities for consistent validation
 * across the application.
 */

/**
 * Validation error severity levels
 * Used to categorize errors by importance
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Validation error codes
 * Standardized error codes for validation failures
 */
export enum ValidationErrorCode {
  REQUIRED = 'REQUIRED',
  TYPE_ERROR = 'TYPE_ERROR',
  FORMAT_ERROR = 'FORMAT_ERROR',
  RANGE_ERROR = 'RANGE_ERROR',
  PATTERN_ERROR = 'PATTERN_ERROR',
  CONSTRAINT_ERROR = 'CONSTRAINT_ERROR',
  CUSTOM_ERROR = 'CUSTOM_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Validation error detail interface
 * Provides structured information about validation failures
 */
export interface ValidationErrorDetail {
  // Core fields - always required
  path: string;        // Path to the field with the error
  message: string;     // User-friendly error message
  
  // Additional context - optional
  code?: string;       // Error code for programmatic handling
  rule?: string;       // Validation rule that failed
  value?: unknown;     // Value that failed validation
  type?: string;       // Expected type
  severity?: ValidationSeverity; // Error severity level
  
  // Legacy compatibility
  field?: string;      // Alias for path (backwards compatibility)
}

/**
 * Result of a validation operation
 */
export interface ValidationResult<T = unknown> {
  valid: boolean;                     // Whether validation passed
  error?: ValidationErrorDetail;      // Error details if validation failed
  errors?: ValidationErrorDetail[];   // Multiple errors if applicable
  validatedData?: T;                  // The validated data if successful
  metadata?: ValidationMetadata;      // Additional metadata about validation process
}

/**
 * Metadata about the validation process
 */
export interface ValidationMetadata {
  executionTimeMs?: number;        // Time taken to execute validation
  rulesExecuted?: number;          // Number of validation rules executed
  transformationsApplied?: number; // Number of data transformations applied
  cacheHit?: boolean;              // Whether validation result was from cache
}

/**
 * Validator function type
 * A function that validates a value and returns a ValidationResult
 */
export type Validator<T = unknown> = (value: unknown, context?: ValidationContext) => ValidationResult<T>;

/**
 * Validation schema type
 * A record of field names to validator functions
 */
export type ValidationSchema<T = Record<string, unknown>> = {
  [K in keyof T]?: Validator<T[K]>;
};

/**
 * Validation context for providing additional information to validators
 */
export interface ValidationContext {
  fieldPath?: string;                      // Current field path for nested validation
  parentValue?: unknown;                   // Parent object being validated
  options?: ValidationOptions;             // Validation options
  root?: unknown;                          // Root object being validated
  siblingValues?: Record<string, unknown>; // Values of sibling fields
  metadata?: Record<string, unknown>;      // Additional context-specific metadata
}

/**
 * Options for validation operations
 */
export interface ValidationOptions {
  abortEarly?: boolean;                 // Stop on first error
  stripUnknown?: boolean;               // Remove unknown properties
  allowUnknown?: boolean;               // Allow unknown properties
  context?: Record<string, unknown>;    // Additional context
  rootPath?: string;                    // Root path for error messages
  sanitize?: boolean;                   // Whether to sanitize data before validation
  transform?: boolean;                  // Whether to transform data during validation
  cache?: boolean;                      // Whether to cache validation results
  recursive?: boolean;                  // Whether to validate nested objects
  customMessages?: Record<string, string>; // Custom error messages
}

/**
 * Type guard for ValidationErrorDetail
 */
export function isValidationErrorDetail(obj: unknown): obj is ValidationErrorDetail {
  return typeof obj === 'object' && 
    obj !== null && 
    'path' in obj && 
    'message' in obj;
}

/**
 * Type guard for ValidationResult
 */
export function isValidationResult(obj: unknown): obj is ValidationResult {
  return typeof obj === 'object' && 
    obj !== null && 
    'valid' in obj && 
    typeof obj.valid === 'boolean';
}

/**
 * Type guard for ValidationSchema
 */
export function isValidationSchema(obj: unknown): obj is ValidationSchema {
  return typeof obj === 'object' && 
    obj !== null && 
    Object.values(obj).every(validator => typeof validator === 'function');
}

/**
 * Convert a validation error to a user-friendly format
 * Maps field paths to error messages for easy form display
 */
export function formatValidationErrors(result: ValidationResult): Record<string, string> {
  if (result.valid) {
    return {};
  }

  const formatted: Record<string, string> = {};
  
  if (result.error) {
    formatted[result.error.path] = result.error.message;
  }
  
  if (result.errors) {
    result.errors.forEach(error => {
      formatted[error.path] = error.message;
    });
  }
  
  return formatted;
}

/**
 * Compose multiple validators into a single validator
 * Each validator will be executed in sequence
 */
export function composeValidators<T>(...validators: Validator[]): Validator<T> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    for (const validator of validators) {
      const result = validator(value, context);
      if (!result.valid) {
        return result as ValidationResult<T>;
      }
    }
    return { valid: true, validatedData: value as T };
  };
}

/**
 * Create a custom validator with specific error details
 */
export function createCustomValidator<T>(
  validationFn: (value: unknown, context?: ValidationContext) => boolean,
  errorDetails: Omit<ValidationErrorDetail, 'path'> & { path?: string }
): Validator<T> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    if (validationFn(value, context)) {
      return { valid: true, validatedData: value as T };
    }
    
    return {
      valid: false,
      error: {
        path: errorDetails.path || context?.fieldPath || '',
        ...errorDetails
      }
    };
  };
}

// Export all types and utilities
export default {
  isValidationErrorDetail,
  isValidationResult,
  isValidationSchema,
  formatValidationErrors,
  composeValidators,
  createCustomValidator
};
