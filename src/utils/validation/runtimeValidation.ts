
/**
 * Custom validation error class with improved type safety and error details
 */
export class ValidationError extends Error {
  code?: string;
  statusCode: number;
  details?: unknown;

  constructor(
    message: string,
    options?: {
      code?: string;
      statusCode?: number;
      details?: unknown;
    }
  ) {
    super(message);
    this.name = 'ValidationError';
    this.code = options?.code;
    this.statusCode = options?.statusCode || 400;
    this.details = options?.details;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Validates that a value is defined (not null or undefined)
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns The value if it's defined
 * @throws ValidationError if the value is null or undefined
 */
export function validateDefined<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throw new ValidationError(`${fieldName} is required`, {
      code: 'REQUIRED_FIELD',
      statusCode: 400,
      details: { field: fieldName }
    });
  }
  return value;
}

/**
 * Validates that a value is one of the allowed values
 * 
 * @param value - The value to validate
 * @param allowedValues - Array of allowed values
 * @param fieldName - The name of the field being validated
 * @returns The value if it's one of the allowed values
 * @throws ValidationError if the value is not one of the allowed values
 */
export function validateOneOf<T extends string | number>(
  value: T,
  allowedValues: T[],
  fieldName: string
): T {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      {
        code: 'INVALID_OPTION',
        statusCode: 400,
        details: { field: fieldName, allowedValues, receivedValue: value }
      }
    );
  }
  return value;
}

/**
 * Validates that a string is not empty
 * 
 * @param value - The string to validate
 * @param fieldName - The name of the field being validated
 * @returns The string if it's not empty
 * @throws ValidationError if the string is empty
 */
export function validateNonEmptyString(value: string | null | undefined, fieldName: string): string {
  const stringValue = validateDefined(value, fieldName);
  if (typeof stringValue !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, {
      code: 'INVALID_TYPE',
      statusCode: 400,
      details: { field: fieldName, expectedType: 'string', receivedType: typeof stringValue }
    });
  }
  
  if (stringValue.trim() === '') {
    throw new ValidationError(`${fieldName} cannot be empty`, {
      code: 'EMPTY_STRING',
      statusCode: 400,
      details: { field: fieldName }
    });
  }
  
  return stringValue;
}

/**
 * Validates that a value is a number
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns The value as a number
 * @throws ValidationError if the value is not a number
 */
export function validateNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`, {
      code: 'INVALID_NUMBER',
      statusCode: 400,
      details: { field: fieldName, receivedValue: value }
    });
  }
  return value;
}

/**
 * Validates that a value is an array
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns The value as an array
 * @throws ValidationError if the value is not an array
 */
export function validateArray<T>(value: unknown, fieldName: string): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, {
      code: 'INVALID_TYPE',
      statusCode: 400,
      details: { field: fieldName, expectedType: 'array', receivedType: typeof value }
    });
  }
  return value as T[];
}

/**
 * Validates that a value is an object
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @returns The value as an object
 * @throws ValidationError if the value is not an object
 */
export function validateObject<T extends Record<string, unknown>>(
  value: unknown,
  fieldName: string
): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`, {
      code: 'INVALID_TYPE',
      statusCode: 400,
      details: { field: fieldName, expectedType: 'object', receivedType: typeof value }
    });
  }
  return value as T;
}

/**
 * Validates that a value matches a regular expression
 * 
 * @param value - The string to validate
 * @param pattern - The regular expression pattern
 * @param fieldName - The name of the field being validated
 * @returns The string if it matches the pattern
 * @throws ValidationError if the string doesn't match the pattern
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  fieldName: string
): string {
  if (!pattern.test(value)) {
    throw new ValidationError(`${fieldName} has an invalid format`, {
      code: 'INVALID_FORMAT',
      statusCode: 400,
      details: { field: fieldName, pattern: pattern.toString() }
    });
  }
  return value;
}

/**
 * Validates that a number is within a range
 * 
 * @param value - The number to validate
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @param fieldName - The name of the field being validated
 * @returns The number if it's within the range
 * @throws ValidationError if the number is outside the range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): number {
  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}`,
      {
        code: 'OUT_OF_RANGE',
        statusCode: 400,
        details: { field: fieldName, min, max, value }
      }
    );
  }
  return value;
}

/**
 * Validates that a string has a minimum length
 * 
 * @param value - The string to validate
 * @param minLength - The minimum allowed length
 * @param fieldName - The name of the field being validated
 * @returns The string if it meets the minimum length
 * @throws ValidationError if the string is too short
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): string {
  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`,
      {
        code: 'TOO_SHORT',
        statusCode: 400,
        details: { field: fieldName, minLength, actualLength: value.length }
      }
    );
  }
  return value;
}

/**
 * Validates that a string doesn't exceed a maximum length
 * 
 * @param value - The string to validate
 * @param maxLength - The maximum allowed length
 * @param fieldName - The name of the field being validated
 * @returns The string if it doesn't exceed the maximum length
 * @throws ValidationError if the string is too long
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): string {
  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} cannot exceed ${maxLength} characters`,
      {
        code: 'TOO_LONG',
        statusCode: 400,
        details: { field: fieldName, maxLength, actualLength: value.length }
      }
    );
  }
  return value;
}

/**
 * Type guard to check if a value is a ValidationError
 * 
 * @param error - The error to check
 * @returns True if the error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Safe parsing of JSON data with validation
 * 
 * @param data - The JSON string to parse
 * @param fieldName - The name of the field being validated
 * @returns The parsed JSON data
 * @throws ValidationError if the data cannot be parsed
 */
export function safeParseJSON<T>(data: string, fieldName: string): T {
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    throw new ValidationError(`Invalid JSON in ${fieldName}`, {
      code: 'INVALID_JSON',
      statusCode: 400,
      details: { field: fieldName }
    });
  }
}

/**
 * Validates and casts a value to a specific type if possible
 * 
 * @param value - The value to validate and cast
 * @param expectedType - The expected type
 * @param fieldName - The name of the field being validated
 * @returns The value cast to the expected type
 * @throws ValidationError if the value cannot be cast to the expected type
 */
export function validateType<T>(
  value: unknown,
  expectedType: 'string' | 'number' | 'boolean' | 'object' | 'array',
  fieldName: string
): T {
  let isValid = false;
  
  switch (expectedType) {
    case 'string':
      isValid = typeof value === 'string';
      break;
    case 'number':
      isValid = typeof value === 'number' && !isNaN(value);
      break;
    case 'boolean':
      isValid = typeof value === 'boolean';
      break;
    case 'object':
      isValid = typeof value === 'object' && value !== null && !Array.isArray(value);
      break;
    case 'array':
      isValid = Array.isArray(value);
      break;
  }
  
  if (!isValid) {
    throw new ValidationError(
      `${fieldName} must be a ${expectedType}`,
      {
        code: 'INVALID_TYPE',
        statusCode: 400,
        details: { field: fieldName, expectedType, actualType: Array.isArray(value) ? 'array' : typeof value }
      }
    );
  }
  
  return value as unknown as T;
}
