
import { ValidationError } from './ValidationError';

/**
 * Validates that a value is a string
 * @param value The value to validate
 * @param fieldName Name of the field being validated (for error messages)
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw ValidationError.typeError(value, 'string', fieldName);
  }
  return value;
}

/**
 * Validates that a value is a number
 * @param value The value to validate
 * @param fieldName Name of the field being validated (for error messages)
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw ValidationError.typeError(value, 'number', fieldName);
  }
  return value;
}

/**
 * Validates that a value is a boolean
 * @param value The value to validate
 * @param fieldName Name of the field being validated (for error messages)
 * @returns The validated boolean
 * @throws ValidationError if validation fails
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw ValidationError.typeError(value, 'boolean', fieldName);
  }
  return value;
}

/**
 * Validates that a value is an object
 * @param value The value to validate
 * @param fieldName Name of the field being validated (for error messages)
 * @returns The validated object
 * @throws ValidationError if validation fails
 */
export function validateObject(value: unknown, fieldName: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw ValidationError.typeError(value, 'object', fieldName);
  }
  return value as Record<string, unknown>;
}

/**
 * Validates that a value is an array
 * @param value The value to validate
 * @param fieldName Name of the field being validated (for error messages)
 * @returns The validated array
 * @throws ValidationError if validation fails
 */
export function validateArray<T = unknown>(value: unknown, fieldName: string): T[] {
  if (!Array.isArray(value)) {
    throw ValidationError.typeError(value, 'array', fieldName);
  }
  return value as T[];
}

/**
 * Validates that a value exists (not undefined or null)
 * @param value The value to validate
 * @param fieldName Name of the field being validated (for error messages)
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateExists<T>(value: T | null | undefined, fieldName: string): T {
  if (value === undefined || value === null) {
    throw ValidationError.requiredError(fieldName);
  }
  return value;
}

/**
 * Validates that a value is one of the allowed values
 * @param value The value to validate
 * @param allowedValues Array of allowed values
 * @param fieldName Name of the field being validated (for error messages)
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateOneOf<T>(value: unknown, allowedValues: T[], fieldName: string): T {
  if (!allowedValues.includes(value as T)) {
    throw ValidationError.constraintError(
      fieldName,
      'one-of',
      `Expected one of: ${allowedValues.join(', ')}, but got: ${String(value)}`
    );
  }
  return value as T;
}

/**
 * Validates that a string is not empty
 * @param value The string to validate
 * @param fieldName Name of the field being validated (for error messages)
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateNonEmptyString(value: unknown, fieldName: string): string {
  const stringValue = validateString(value, fieldName);
  if (stringValue.trim() === '') {
    throw ValidationError.constraintError(fieldName, 'non-empty-string', 'String cannot be empty');
  }
  return stringValue;
}

/**
 * Validates an email address format
 * @param value The email to validate
 * @param fieldName Name of the field being validated (for error messages)
 * @returns The validated email
 * @throws ValidationError if validation fails
 */
export function validateEmail(value: unknown, fieldName: string): string {
  const email = validateString(value, fieldName);
  // Simple email validation regex - production systems might need more sophisticated validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw ValidationError.constraintError(fieldName, 'email-format', 'Invalid email format');
  }
  return email;
}

/**
 * Validates a UUID format
 * @param value The UUID to validate
 * @param fieldName Name of the field being validated (for error messages)
 * @returns The validated UUID
 * @throws ValidationError if validation fails
 */
export function validateUUID(value: unknown, fieldName: string): string {
  const uuid = validateString(value, fieldName);
  // UUID v4 regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    throw ValidationError.constraintError(fieldName, 'uuid-format', 'Invalid UUID format');
  }
  return uuid;
}

/**
 * Safely attempts to parse JSON
 * @param value The string to parse
 * @param fieldName Name of the field being validated (for error messages)
 * @returns The parsed JSON object
 * @throws ValidationError if parsing fails
 */
export function validateJSON<T = unknown>(value: string, fieldName: string): T {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw ValidationError.constraintError(
      fieldName, 
      'json-format',
      error instanceof Error ? error.message : 'Invalid JSON'
    );
  }
}

/**
 * Validates that a value has required properties
 * @param value The object to validate
 * @param requiredProps Array of required property names
 * @param objectName Name of the object being validated (for error messages)
 * @returns The validated object
 * @throws ValidationError if validation fails
 */
export function validateRequiredProps<T extends Record<string, unknown>>(
  value: T,
  requiredProps: string[],
  objectName: string
): T {
  const missingProps = requiredProps.filter(prop => !(prop in value) || value[prop] === undefined || value[prop] === null);
  
  if (missingProps.length > 0) {
    throw ValidationError.constraintError(
      objectName,
      'required-properties',
      `Missing required properties: ${missingProps.join(', ')}`
    );
  }
  
  return value;
}
