
/**
 * Runtime validation utilities for robust error checking
 */

// Define a custom validation error type with enhanced information
export class ValidationError extends Error {
  public code?: string;
  public details?: unknown;
  public statusCode: number;
  
  constructor(
    message: string, 
    options?: { 
      code?: string; 
      details?: unknown; 
      statusCode?: number 
    }
  ) {
    super(message);
    this.name = 'ValidationError';
    this.code = options?.code;
    this.details = options?.details;
    this.statusCode = options?.statusCode || 400;
    
    // Capture stack trace, excluding the constructor call from the stack
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Validates that a value is defined (not undefined or null)
 * 
 * @param value - The value to validate
 * @param name - The name of the value (for error messages)
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateDefined<T>(
  value: T | null | undefined,
  name: string
): T {
  if (value === undefined || value === null) {
    throw new ValidationError(`${name} is required but was ${value === null ? 'null' : 'undefined'}`, {
      code: 'VALIDATION_REQUIRED',
      details: { param: name, value }
    });
  }
  return value;
}

/**
 * Validates that a value is a string
 * 
 * @param value - The value to validate
 * @param name - The name of the value (for error messages)
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateString(
  value: unknown,
  name: string
): string {
  validateDefined(value, name);
  
  if (typeof value !== 'string') {
    throw new ValidationError(`${name} must be a string but was ${typeof value}`, {
      code: 'VALIDATION_TYPE',
      details: { param: name, expectedType: 'string', actualType: typeof value, value }
    });
  }
  
  return value;
}

/**
 * Validates that a value is a number
 * 
 * @param value - The value to validate
 * @param name - The name of the value (for error messages)
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateNumber(
  value: unknown,
  name: string
): number {
  validateDefined(value, name);
  
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError(`${name} must be a number but was ${typeof value}`, {
      code: 'VALIDATION_TYPE',
      details: { param: name, expectedType: 'number', actualType: typeof value, value }
    });
  }
  
  return value;
}

/**
 * Validates that a value is a boolean
 * 
 * @param value - The value to validate
 * @param name - The name of the value (for error messages)
 * @returns The validated boolean
 * @throws ValidationError if validation fails
 */
export function validateBoolean(
  value: unknown,
  name: string
): boolean {
  validateDefined(value, name);
  
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${name} must be a boolean but was ${typeof value}`, {
      code: 'VALIDATION_TYPE',
      details: { param: name, expectedType: 'boolean', actualType: typeof value, value }
    });
  }
  
  return value;
}

/**
 * Validates that a value is an object
 * 
 * @param value - The value to validate
 * @param name - The name of the value (for error messages)
 * @returns The validated object
 * @throws ValidationError if validation fails
 */
export function validateObject(
  value: unknown,
  name: string
): Record<string, unknown> {
  validateDefined(value, name);
  
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${name} must be an object but was ${Array.isArray(value) ? 'array' : typeof value}`, {
      code: 'VALIDATION_TYPE',
      details: { param: name, expectedType: 'object', actualType: typeof value, value }
    });
  }
  
  return value as Record<string, unknown>;
}

/**
 * Validates that a value is an array
 * 
 * @param value - The value to validate
 * @param name - The name of the value (for error messages)
 * @returns The validated array
 * @throws ValidationError if validation fails
 */
export function validateArray(
  value: unknown,
  name: string
): unknown[] {
  validateDefined(value, name);
  
  if (!Array.isArray(value)) {
    throw new ValidationError(`${name} must be an array but was ${typeof value}`, {
      code: 'VALIDATION_TYPE',
      details: { param: name, expectedType: 'array', actualType: typeof value, value }
    });
  }
  
  return value;
}

/**
 * Validates that a value is one of a set of allowed values
 * 
 * @param value - The value to validate
 * @param allowedValues - The set of allowed values
 * @param name - The name of the value (for error messages)
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateOneOf<T>(
  value: unknown,
  allowedValues: readonly T[],
  name: string
): T {
  validateDefined(value, name);
  
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(`${name} must be one of ${allowedValues.join(', ')} but was ${String(value)}`, {
      code: 'VALIDATION_ENUM',
      details: { param: name, allowedValues, actualValue: value }
    });
  }
  
  return value as T;
}

/**
 * Validates that a value falls within a numeric range
 * 
 * @param value - The value to validate
 * @param min - The minimum allowed value (inclusive)
 * @param max - The maximum allowed value (inclusive)
 * @param name - The name of the value (for error messages)
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateRange(
  value: unknown,
  min: number,
  max: number,
  name: string
): number {
  const num = validateNumber(value, name);
  
  if (num < min || num > max) {
    throw new ValidationError(`${name} must be between ${min} and ${max} but was ${num}`, {
      code: 'VALIDATION_RANGE',
      details: { param: name, min, max, actualValue: num }
    });
  }
  
  return num;
}

/**
 * Validates that a string matches a regex pattern
 * 
 * @param value - The value to validate
 * @param pattern - The regex pattern to match
 * @param name - The name of the value (for error messages)
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validatePattern(
  value: unknown,
  pattern: RegExp,
  name: string
): string {
  const str = validateString(value, name);
  
  if (!pattern.test(str)) {
    throw new ValidationError(`${name} must match pattern ${pattern} but was "${str}"`, {
      code: 'VALIDATION_PATTERN',
      details: { param: name, pattern: pattern.toString(), actualValue: str }
    });
  }
  
  return str;
}

/**
 * Composes multiple validators into a single validator
 * 
 * @param validators - Array of validator functions to apply
 * @returns A composed validator function
 */
export function composeValidators<T>(
  validators: Array<(value: unknown) => unknown>
): (value: unknown) => T {
  return (value: unknown): T => {
    return validators.reduce((result, validator) => validator(result), value) as T;
  };
}

/**
 * Validates an email address
 * 
 * @param value - The value to validate
 * @param name - The name of the value (for error messages)
 * @returns The validated email address
 * @throws ValidationError if validation fails
 */
export function validateEmail(
  value: unknown,
  name = 'email'
): string {
  const email = validateString(value, name);
  
  // Simple email validation pattern, could be more complex in a real app
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(email)) {
    throw new ValidationError(`${name} must be a valid email address but was "${email}"`, {
      code: 'VALIDATION_EMAIL',
      details: { param: name, actualValue: email }
    });
  }
  
  return email;
}

/**
 * Validates a URL
 * 
 * @param value - The value to validate
 * @param name - The name of the value (for error messages)
 * @returns The validated URL
 * @throws ValidationError if validation fails
 */
export function validateUrl(
  value: unknown,
  name = 'url'
): string {
  const url = validateString(value, name);
  
  try {
    new URL(url);
    return url;
  } catch (error) {
    throw new ValidationError(`${name} must be a valid URL but was "${url}"`, {
      code: 'VALIDATION_URL',
      details: { param: name, actualValue: url }
    });
  }
}
