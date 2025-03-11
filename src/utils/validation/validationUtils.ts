
/**
 * Validation Utilities
 * 
 * Type-safe validation utilities for runtime type checking.
 */

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errorCode?: string;
  errorMessage?: string;
  errors?: ValidationErrorDetail[];
}

// Validation error detail
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code: string;
}

// Type guard function type
export type TypeGuardFunction<T> = (value: unknown) => value is T;

/**
 * Creates a validation result
 */
export function createValidationResult(
  valid: boolean,
  errorCode?: string,
  errorMessage?: string,
  errors?: ValidationErrorDetail[]
): ValidationResult {
  return {
    valid,
    errorCode,
    errorMessage,
    errors
  };
}

/**
 * Required field validator
 */
export function required(field: string): (value: unknown) => ValidationResult {
  return (value: unknown) => {
    if (value === undefined || value === null) {
      return {
        valid: false,
        errorCode: 'REQUIRED',
        errorMessage: `${field} is required`,
        errors: [{
          path: field,
          message: 'This field is required',
          code: 'REQUIRED'
        }]
      };
    }
    return { valid: true };
  };
}

/**
 * Creates a type guard validator
 */
export function createTypeGuard<T>(
  guard: TypeGuardFunction<T>,
  errorCode: string,
  errorMessage: string
): (value: unknown) => ValidationResult {
  return (value: unknown) => {
    if (!guard(value)) {
      return {
        valid: false,
        errorCode,
        errorMessage,
        errors: [{
          path: '',
          message: errorMessage,
          code: errorCode
        }]
      };
    }
    return { valid: true };
  };
}

/**
 * Combines multiple validators
 */
export function combineValidators(
  validators: Array<(value: unknown) => ValidationResult>
): (value: unknown) => ValidationResult {
  return (value: unknown) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  };
}

/**
 * Runtime type validation for strings
 */
export function validateString(value: unknown, fieldName = 'value'): string {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string, got ${typeof value}`);
  }
  return value;
}

/**
 * Runtime type validation for numbers
 */
export function validateNumber(value: unknown, fieldName = 'value'): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${fieldName} must be a number, got ${typeof value}`);
  }
  return value;
}

/**
 * Runtime type validation for booleans
 */
export function validateBoolean(value: unknown, fieldName = 'value'): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName} must be a boolean, got ${typeof value}`);
  }
  return value;
}

/**
 * Runtime type validation for objects
 */
export function validateObject(value: unknown, fieldName = 'value'): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`${fieldName} must be an object, got ${value === null ? 'null' : typeof value}`);
  }
  return value as Record<string, unknown>;
}

/**
 * Runtime type validation for arrays
 */
export function validateArray(value: unknown, fieldName = 'value'): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array, got ${typeof value}`);
  }
  return value;
}

/**
 * Runtime type validation for optional values
 */
export function validateOptional<T>(
  value: unknown, 
  validator: (v: unknown) => T, 
  fieldName = 'value'
): T | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return validator(value);
}
