
/**
 * Validation Result Types
 * 
 * This module defines the core validation result types used throughout
 * the application for consistent error handling and data validation.
 * 
 * @category Validation
 * @version 1.0.0
 */

import { Timestamp } from '../base/primitives';

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
  timestamp: Timestamp;            // When validation was performed
  executionTimeMs?: number;        // Time taken to execute validation
  rulesExecuted?: number;          // Number of validation rules executed
  transformationsApplied?: number; // Number of data transformations applied
  cacheHit?: boolean;              // Whether validation result was from cache
  validator?: string;              // Identifier for the validator
  version?: string;                // Validator version
}

/**
 * Create a successful validation result
 */
export function createValidSuccess<T>(data: T, metadata?: Partial<ValidationMetadata>): ValidationResult<T> {
  return {
    valid: true,
    validatedData: data,
    metadata: {
      timestamp: Date.now() as Timestamp,
      ...metadata
    }
  };
}

/**
 * Create a failed validation result
 */
export function createValidError<T = unknown>(
  error: ValidationErrorDetail | string,
  metadata?: Partial<ValidationMetadata>
): ValidationResult<T> {
  const errorDetail = typeof error === 'string' 
    ? { path: '', message: error, code: ValidationErrorCode.UNKNOWN_ERROR }
    : error;
    
  return {
    valid: false,
    error: errorDetail,
    metadata: {
      timestamp: Date.now() as Timestamp,
      ...metadata
    }
  };
}

/**
 * Create a validation result with multiple errors
 */
export function createValidErrors<T = unknown>(
  errors: ValidationErrorDetail[],
  metadata?: Partial<ValidationMetadata>
): ValidationResult<T> {
  return {
    valid: false,
    errors,
    metadata: {
      timestamp: Date.now() as Timestamp,
      ...metadata
    }
  };
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
