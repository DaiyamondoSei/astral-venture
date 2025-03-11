
import { ValidationResult, ValidationError, ValidatorFn } from './types';

/**
 * Combines multiple validators into a single validator
 */
export function combineValidators<T>(validators: ValidatorFn<T>[]): ValidatorFn<T> {
  return (value: unknown): ValidationResult => {
    const errors: ValidationError[] = [];
    
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid && result.errors) {
        errors.push(...result.errors);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  };
}

/**
 * Creates a type guard validator
 */
export function createTypeGuard<T>(
  guard: (value: unknown) => value is T,
  errorCode: string,
  errorMessage: string
): ValidatorFn<T> {
  return (value: unknown): ValidationResult => {
    if (guard(value)) {
      return { valid: true };
    }
    
    return {
      valid: false,
      errors: [{
        code: errorCode,
        message: errorMessage,
      }]
    };
  };
}

/**
 * Validates that a value is defined
 */
export function required(fieldName: string): ValidatorFn<unknown> {
  return (value: unknown): ValidationResult => {
    if (value === undefined || value === null) {
      return {
        valid: false,
        errors: [{
          code: 'REQUIRED',
          message: `${fieldName} is required`,
          path: fieldName
        }]
      };
    }
    return { valid: true };
  };
}
