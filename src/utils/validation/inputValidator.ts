
/**
 * Input Validation Utilities
 * 
 * A collection of type-safe validation utilities for form inputs
 */

import { Result, success, failure } from '../result/Result';

// Type for validation error details
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
  params?: Record<string, any>;
}

// Enhanced validation error with contextual information
export class ValidationError extends Error {
  public details: ValidationErrorDetail[];
  
  constructor(message: string, details: ValidationErrorDetail[]) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
  
  public static fromDetail(field: string, message: string, code?: string): ValidationError {
    return new ValidationError(message, [{ field, message, code }]);
  }
  
  public static combine(errors: ValidationError[]): ValidationError {
    const allDetails = errors.flatMap(e => e.details);
    const message = allDetails.map(d => d.message).join('; ');
    return new ValidationError(message, allDetails);
  }
}

// Type for validation rule
export type ValidationRule<T> = (value: T, field: string) => Result<T, ValidationError>;

/**
 * Creates a validation pipeline that runs multiple validation rules
 */
export function createValidator<T>(...rules: ValidationRule<T>[]) {
  return (value: T, field: string): Result<T, ValidationError> => {
    const errors: ValidationError[] = [];
    
    for (const rule of rules) {
      const result = rule(value, field);
      if (result.type === 'failure') {
        errors.push(result.error);
        // Break on first error for efficiency
        break;
      }
    }
    
    if (errors.length > 0) {
      return failure(ValidationError.combine(errors));
    }
    
    return success(value);
  };
}

/**
 * Common validation rules
 */

// Required field validator
export function required<T>(errorMessage = 'This field is required'): ValidationRule<T> {
  return (value: T, field: string) => {
    if (value === null || value === undefined || value === '') {
      return failure(ValidationError.fromDetail(field, errorMessage, 'required'));
    }
    return success(value);
  };
}

// String length validator
export function length(min: number, max: number, errorMessage?: string): ValidationRule<string> {
  return (value: string, field: string) => {
    if (!value) return success(value);
    
    const message = errorMessage || `Must be between ${min} and ${max} characters`;
    
    if (value.length < min || value.length > max) {
      return failure(ValidationError.fromDetail(
        field, 
        message, 
        'length',
        { min, max, actual: value.length }
      ));
    }
    
    return success(value);
  };
}

// Email format validator
export function email(errorMessage = 'Invalid email format'): ValidationRule<string> {
  return (value: string, field: string) => {
    if (!value) return success(value);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return failure(ValidationError.fromDetail(field, errorMessage, 'email'));
    }
    
    return success(value);
  };
}

// Numeric value validator
export function numeric(errorMessage = 'Must be a number'): ValidationRule<string> {
  return (value: string, field: string) => {
    if (!value) return success(value);
    
    if (isNaN(Number(value))) {
      return failure(ValidationError.fromDetail(field, errorMessage, 'numeric'));
    }
    
    return success(value);
  };
}

// Value range validator
export function range(min: number, max: number, errorMessage?: string): ValidationRule<number> {
  return (value: number, field: string) => {
    const message = errorMessage || `Must be between ${min} and ${max}`;
    
    if (value < min || value > max) {
      return failure(ValidationError.fromDetail(
        field, 
        message, 
        'range',
        { min, max, actual: value }
      ));
    }
    
    return success(value);
  };
}

// Pattern validator
export function pattern(regex: RegExp, errorMessage = 'Invalid format'): ValidationRule<string> {
  return (value: string, field: string) => {
    if (!value) return success(value);
    
    if (!regex.test(value)) {
      return failure(ValidationError.fromDetail(field, errorMessage, 'pattern'));
    }
    
    return success(value);
  };
}

// Custom validator
export function custom<T>(
  validateFn: (value: T) => boolean, 
  errorMessage = 'Invalid value'
): ValidationRule<T> {
  return (value: T, field: string) => {
    if (!validateFn(value)) {
      return failure(ValidationError.fromDetail(field, errorMessage, 'custom'));
    }
    
    return success(value);
  };
}

/**
 * Validate a complete form with multiple field validators
 */
export function validateForm<T extends Record<string, any>>(
  form: T,
  validators: Partial<Record<keyof T, ValidationRule<any>>>
): Result<T, ValidationError> {
  const errors: ValidationError[] = [];
  
  for (const [field, validator] of Object.entries(validators)) {
    if (!validator) continue;
    
    const value = form[field];
    const result = validator(value, field);
    
    if (result.type === 'failure') {
      errors.push(result.error);
    }
  }
  
  if (errors.length > 0) {
    return failure(ValidationError.combine(errors));
  }
  
  return success(form);
}

// Error extraction helpers
export function getFieldError(
  validationError: ValidationError | null,
  fieldName: string
): string | null {
  if (!validationError) return null;
  
  const fieldError = validationError.details.find(detail => detail.field === fieldName);
  return fieldError ? fieldError.message : null;
}

export function hasFieldError(
  validationError: ValidationError | null,
  fieldName: string
): boolean {
  return getFieldError(validationError, fieldName) !== null;
}

export function getAllErrors(
  validationError: ValidationError | null
): Record<string, string> {
  if (!validationError) return {};
  
  return validationError.details.reduce((acc, detail) => {
    acc[detail.field] = detail.message;
    return acc;
  }, {} as Record<string, string>);
}
