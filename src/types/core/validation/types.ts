
/**
 * Validation Types
 * 
 * This module provides type definitions for the validation system.
 */

// Validation error severity
export type ValidationSeverity = 'error' | 'warning' | 'info';

// Validation error code
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
  | 'UNKNOWN_ERROR'
  | 'VALIDATION_FAILED'
  | 'SCHEMA_ERROR'
  | 'NOT_INTEGER'
  | 'MIN_ITEMS'
  | 'MAX_ITEMS'
  | 'MIN_DATE'
  | 'MAX_DATE'
  | 'INVALID_ENUM'
  | 'INVALID_FORMAT';

// Field type for validation
export type ValidationFieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'date'
  | 'email'
  | 'url'
  | 'uuid'
  | 'integer'
  | 'float'
  | 'enum';

// Validation error detail
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code: ValidationErrorCode;
  severity: ValidationSeverity;
}

// Validation result interface
export interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
  errors?: ValidationErrorDetail[];
}

// Validator interface
export interface Validator<T> {
  (value: unknown): ValidationResult<T>;
}

// Validation options
export interface ValidationOptions {
  abortEarly?: boolean;
  strict?: boolean;
  stripUnknown?: boolean;
}

// Validation schema interface
export interface ValidationSchema<T> {
  validate(value: unknown, options?: ValidationOptions): ValidationResult<T>;
}
