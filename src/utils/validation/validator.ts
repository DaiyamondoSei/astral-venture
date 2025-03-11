
import { Result, success, failure } from '../result/Result';

export interface ValidationErrorDetail {
  message: string;
  field?: string;
  code?: string;
  path?: string[];
}

export class ValidationError extends Error {
  public readonly details: ValidationErrorDetail[];
  
  constructor(message: string, details: ValidationErrorDetail[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    
    // Required for proper inheritance in TypeScript
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  /**
   * Get all error messages as a string array
   */
  public getMessages(): string[] {
    if (this.details.length === 0) {
      return [this.message];
    }
    
    return this.details.map(detail => detail.message);
  }
  
  /**
   * Get errors for a specific field
   */
  public getFieldErrors(fieldName: string): ValidationErrorDetail[] {
    return this.details.filter(detail => detail.field === fieldName);
  }
  
  /**
   * Check if there are errors for a specific field
   */
  public hasFieldErrors(fieldName: string): boolean {
    return this.getFieldErrors(fieldName).length > 0;
  }
  
  /**
   * Format error messages for a specific field
   */
  public getFieldErrorMessages(fieldName: string): string[] {
    return this.getFieldErrors(fieldName).map(detail => detail.message);
  }
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Basic validation function that returns a Result
 */
export function validate<T>(
  value: T,
  validator: (value: T) => ValidationErrorDetail[] | null
): Result<T, ValidationError> {
  const errors = validator(value);
  
  if (errors && errors.length > 0) {
    return failure(new ValidationError('Validation failed', errors));
  }
  
  return success(value);
}

/**
 * Required field validator
 */
export function required(fieldName: string, value: unknown): ValidationErrorDetail | null {
  if (value === undefined || value === null || value === '') {
    return {
      message: `${fieldName} is required`,
      field: fieldName,
      code: 'required'
    };
  }
  
  return null;
}

/**
 * String length validator
 */
export function minLength(fieldName: string, min: number, value?: string): ValidationErrorDetail | null {
  if (!value) return null;
  
  if (value.length < min) {
    return {
      message: `${fieldName} must be at least ${min} characters`,
      field: fieldName,
      code: 'min_length'
    };
  }
  
  return null;
}

/**
 * Maximum string length validator
 */
export function maxLength(fieldName: string, max: number, value?: string): ValidationErrorDetail | null {
  if (!value) return null;
  
  if (value.length > max) {
    return {
      message: `${fieldName} must be at most ${max} characters`,
      field: fieldName,
      code: 'max_length'
    };
  }
  
  return null;
}

/**
 * Email format validator
 */
export function isEmail(fieldName: string, value?: string): ValidationErrorDetail | null {
  if (!value) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return {
      message: `${fieldName} must be a valid email address`,
      field: fieldName,
      code: 'invalid_email'
    };
  }
  
  return null;
}

/**
 * Combine multiple validators
 */
export function combineValidators(validators: (ValidationErrorDetail | null)[]): ValidationErrorDetail[] {
  return validators.filter((error): error is ValidationErrorDetail => error !== null);
}
