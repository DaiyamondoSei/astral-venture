
/**
 * Simplified Validation System
 */

// Export core types and constants
export * from '@/types/core/validation/types';
export * from '@/types/core/validation/constants';

// Export ValidationError and related utilities
export { ValidationError, isValidationError } from './ValidationError';

// Helper functions for creating validation results
export function createValidResult<T>(value: T): ValidationResult<T> {
  return {
    isValid: true,
    value,
    errors: []
  };
}

export function createInvalidResult<T>(errors: string[]): ValidationResult<T> {
  return {
    isValid: false,
    errors
  };
}

// Basic validator functions
export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return createInvalidResult([`${fieldName} is required`]);
  }
  return createValidResult(value);
}

export function validateString(value: unknown, fieldName: string): ValidationResult<string> {
  if (typeof value !== 'string') {
    return createInvalidResult([`${fieldName} must be a string`]);
  }
  return createValidResult(value);
}

export function validateNumber(value: unknown, fieldName: string): ValidationResult<number> {
  if (typeof value !== 'number' || isNaN(value)) {
    return createInvalidResult([`${fieldName} must be a number`]);
  }
  return createValidResult(value);
}
