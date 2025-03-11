
/**
 * Validation Types System
 * 
 * This module defines the core validation type system used throughout
 * the application for consistent data validation.
 */

import { AsyncResult, Result } from '../core/base';

/**
 * Validation error severity levels
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Validation error codes
 */
export enum ValidationErrorCode {
  REQUIRED = 'REQUIRED',         // Missing required field
  TYPE_ERROR = 'TYPE_ERROR',     // Type mismatch
  FORMAT_ERROR = 'FORMAT_ERROR', // Invalid format (e.g., email, date)
  RANGE_ERROR = 'RANGE_ERROR',   // Value out of range
  PATTERN_ERROR = 'PATTERN_ERROR', // Doesn't match pattern/regex
  CONSTRAINT_ERROR = 'CONSTRAINT_ERROR', // Business rule violation
  CUSTOM_ERROR = 'CUSTOM_ERROR', // Custom validation error
  CONFIG_ERROR = 'CONFIG_ERROR', // Configuration error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR' // Fallback error code
}

/**
 * Validation error detail interface
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
  validatedData?: T;                  // The validated data if successful
  error?: ValidationErrorDetail;      // Error details if validation failed
  errors?: ValidationErrorDetail[];   // Multiple errors if applicable
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
 */
export type Validator<T = unknown> = (value: unknown, context?: ValidationContext) => ValidationResult<T>;

/**
 * Async validator function type
 */
export type AsyncValidator<T = unknown> = (value: unknown, context?: ValidationContext) => Promise<ValidationResult<T>>;

/**
 * Validation schema type
 */
export type ValidationSchema<T = Record<string, unknown>> = {
  [K in keyof T]?: Validator<T[K]> | AsyncValidator<T[K]>;
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
 * Type definition for validation rule
 */
export interface ValidationRule<T = unknown> {
  name: string;
  validate: (value: unknown, context?: ValidationContext) => boolean;
  message: string | ((value: unknown, context?: ValidationContext) => string);
  code?: ValidationErrorCode | string;
}

/**
 * Definition for a validation pipeline
 */
export interface ValidationPipeline<T = unknown> {
  // Phase 1: Pre-validation
  preValidate(data: unknown): ValidationResult;
  
  // Phase 2: Main validation
  validate(data: unknown): ValidationResult<T>;
  
  // Phase 3: Post-validation
  postValidate(data: T): ValidationResult<T>;
  
  // All phases combined
  validateAll(data: unknown): ValidationResult<T>;
}

/**
 * String validation options
 */
export interface StringValidationOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  trim?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
}

/**
 * Number validation options
 */
export interface NumberValidationOptions {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
  multipleOf?: number;
}

/**
 * Array validation options
 */
export interface ArrayValidationOptions<T = unknown> {
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  itemValidator?: Validator<T>;
}

/**
 * Type guard for ValidationErrorDetail
 */
export function isValidationErrorDetail(obj: unknown): obj is ValidationErrorDetail {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const detail = obj as Partial<ValidationErrorDetail>;
  return typeof detail.path === 'string' && typeof detail.message === 'string';
}

/**
 * Type guard for ValidationResult
 */
export function isValidationResult(obj: unknown): obj is ValidationResult {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const result = obj as Partial<ValidationResult>;
  return typeof result.valid === 'boolean';
}

/**
 * Format validation errors for user interface
 */
export function formatValidationErrors(result: ValidationResult): Record<string, string> {
  if (result.valid) {
    return {};
  }

  const formatted: Record<string, string> = {};
  
  if (result.error) {
    formatted[result.error.path] = result.error.message;
  }
  
  if (result.errors && result.errors.length > 0) {
    result.errors.forEach(error => {
      formatted[error.path] = error.message;
    });
  }
  
  return formatted;
}

/**
 * Compose multiple validators into a single validator
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

/**
 * Create an async custom validator
 */
export function createAsyncValidator<T>(
  validationFn: (value: unknown, context?: ValidationContext) => Promise<boolean>,
  errorDetails: Omit<ValidationErrorDetail, 'path'> & { path?: string }
): AsyncValidator<T> {
  return async (value: unknown, context?: ValidationContext): Promise<ValidationResult<T>> => {
    const isValid = await validationFn(value, context);
    
    if (isValid) {
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
