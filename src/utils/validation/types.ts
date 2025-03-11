
/**
 * Core Validation Type System
 * 
 * This module provides the foundation for our validation system with
 * properly defined types, interfaces, and utilities for consistent validation
 * across the application.
 */

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
}

/**
 * Validator function type
 * A function that validates a value and returns a ValidationResult
 */
export type Validator<T = unknown> = (value: unknown) => ValidationResult<T>;

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
  fieldPath?: string;       // Current field path for nested validation
  parentValue?: unknown;    // Parent object being validated
  options?: ValidationOptions;  // Validation options
}

/**
 * Options for validation operations
 */
export interface ValidationOptions {
  abortEarly?: boolean;     // Stop on first error
  stripUnknown?: boolean;   // Remove unknown properties
  allowUnknown?: boolean;   // Allow unknown properties
  context?: Record<string, unknown>;  // Additional context
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
