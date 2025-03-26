
/**
 * Validation System
 * 
 * Central exports for the validation framework
 */

// Export core types and constants
export * from '@/types/core/validation/types';
export * from '@/types/core/validation/constants';

// Export ValidationError and related utilities
export { ValidationError, isValidationError } from './ValidationError';

// Export validation result creation helpers
export function createValidResult<T>(value: T): ValidationResult<T> {
  return {
    isValid: true,
    value,
    errors: [],
    validatedData: value
  };
}

export function createInvalidResult<T>(errors: string[] | ValidationErrorDetail[]): ValidationResult<T> {
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

export function validateBoolean(value: unknown, fieldName: string): ValidationResult<boolean> {
  if (typeof value !== 'boolean') {
    return createInvalidResult([`${fieldName} must be a boolean`]);
  }
  return createValidResult(value);
}

export function validateEmail(value: unknown, fieldName: string): ValidationResult<string> {
  // First validate it's a string
  const stringResult = validateString(value, fieldName);
  if (!stringResult.isValid) {
    return stringResult;
  }
  
  // Then validate the email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value as string)) {
    return createInvalidResult([`${fieldName} must be a valid email address`]);
  }
  
  return createValidResult(value as string);
}

export function validateUrl(value: unknown, fieldName: string): ValidationResult<string> {
  // First validate it's a string
  const stringResult = validateString(value, fieldName);
  if (!stringResult.isValid) {
    return stringResult;
  }
  
  try {
    new URL(value as string);
    return createValidResult(value as string);
  } catch {
    return createInvalidResult([`${fieldName} must be a valid URL`]);
  }
}

// Combine validators
export function combineValidators<T>(...validators: Validator<T>[]): Validator<T> {
  return (value: unknown): ValidationResult<T> => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        return result;
      }
    }
    return createValidResult(value as T);
  };
}

// Type guards
export function createTypeGuard<T>(validator: Validator<T>): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    const result = validator(value);
    return result.isValid;
  };
}
