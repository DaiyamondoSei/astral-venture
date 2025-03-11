
/**
 * Validation Result Types
 * 
 * Types and interfaces for validation results and errors.
 */

// Validation error with detailed information
export interface ValidationError {
  code: string;
  message: string;
  path: (string | number)[];
  expected?: any;
  received?: any;
  minimum?: number;
  maximum?: number;
}

// Result of a validation operation
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

// Create a success validation result
export function validationSuccess(): ValidationResult {
  return { valid: true };
}

// Create a failure validation result
export function validationFailure(errors: ValidationError[]): ValidationResult {
  return {
    valid: false,
    errors
  };
}

// Create a validation error
export function createValidationError(
  code: string,
  message: string,
  path: (string | number)[],
  additionalInfo?: Partial<Omit<ValidationError, 'code' | 'message' | 'path'>>
): ValidationError {
  return {
    code,
    message,
    path,
    ...additionalInfo
  };
}
