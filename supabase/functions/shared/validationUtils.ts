
/**
 * Shared validation utilities for Edge Functions
 * 
 * Provides consistent validation patterns for all edge functions.
 */

/**
 * Type definitions for validation errors
 */
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code?: string;
  rule?: string;
  value?: unknown;
}

export class ValidationError extends Error {
  public readonly details: ValidationErrorDetail[];
  public readonly code: string;
  public readonly statusCode: number;
  
  constructor(
    message: string,
    details: ValidationErrorDetail[] = [],
    code: string = 'VALIDATION_ERROR',
    statusCode: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.code = code;
    this.statusCode = statusCode;
    
    // Required for proper instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
}

/**
 * Validates required parameters in a request
 */
export function validateRequiredParams(
  data: Record<string, unknown>,
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(param => 
    data[param] === undefined || data[param] === null || data[param] === ''
  );
  
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

/**
 * Validates that a value is a string
 */
export function validateString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be a string`,
        value
      }]
    );
  }
  return value;
}

/**
 * Validates that a value is a number
 */
export function validateNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(
      `${fieldName} must be a valid number`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be a valid number`,
        value
      }]
    );
  }
  return value;
}

/**
 * Validates that a value is a boolean
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(
      `${fieldName} must be a boolean`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be a boolean`,
        value
      }]
    );
  }
  return value;
}

/**
 * Validates that a value is an array
 */
export function validateArray(value: unknown, fieldName: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(
      `${fieldName} must be an array`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be an array`,
        value
      }]
    );
  }
  return value;
}

/**
 * Validates that a value is an object
 */
export function validateObject(value: unknown, fieldName: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(
      `${fieldName} must be an object`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be an object`,
        value
      }]
    );
  }
  return value as Record<string, unknown>;
}

/**
 * Validates that a value is one of the allowed values
 */
export function validateEnum<T extends string>(
  value: unknown, 
  allowedValues: readonly T[], 
  fieldName: string
): T {
  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
        value
      }]
    );
  }
  return value as T;
}

/**
 * Safe validation wrapper that returns a result object instead of throwing
 */
export function safeValidate<T>(
  validator: (value: unknown) => T,
  value: unknown
): { success: boolean; value?: T; error?: ValidationErrorDetail } {
  try {
    const validatedValue = validator(value);
    return { success: true, value: validatedValue };
  } catch (error) {
    if (ValidationError.isValidationError(error)) {
      return { 
        success: false, 
        error: error.details[0] 
      };
    }
    return { 
      success: false, 
      error: { 
        path: '',
        message: error instanceof Error ? error.message : String(error)
      }
    };
  }
}
