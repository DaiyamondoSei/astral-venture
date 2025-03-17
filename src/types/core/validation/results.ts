
/**
 * Validation Result Types
 * 
 * This module provides types for validation results.
 */

import { ValidationErrorDetail, ValidationResult } from './types';

/**
 * Extended validation result with metadata
 */
export interface DetailedValidationResult<T = unknown> extends ValidationResult<T> {
  metadata: {
    timestamp: number;
    validatedWith: string;
    executionTimeMs?: number;
  };
}

/**
 * Validation options
 */
export interface ValidationOptions {
  abortEarly?: boolean;
  context?: Record<string, unknown>;
  strict?: boolean;
  stripUnknown?: boolean;
}

/**
 * Validation error creation options
 */
export interface ValidationErrorOptions {
  code?: string;
  path?: string;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Creates a validation success result
 */
export function validationSuccess<T>(value: T): ValidationResult<T> {
  return {
    isValid: true,
    errors: [],
    value,
    validatedData: value
  };
}

/**
 * Creates a validation failure result
 */
export function validationFailure<T>(errors: ValidationErrorDetail[]): ValidationResult<T> {
  return {
    isValid: false,
    errors,
    value: undefined,
    validatedData: undefined
  };
}

/**
 * Creates a validation error detail
 */
export function createValidationErrorDetail(
  code: string,
  message: string,
  path: string,
  severity: 'error' | 'warning' | 'info' = 'error',
  metadata?: Record<string, unknown>
): ValidationErrorDetail {
  return {
    code: code as any,
    message,
    path,
    severity,
    metadata
  };
}
