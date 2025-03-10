
import { ValidationError } from './validation/ValidationError';
import { validateArray, validateBoolean, validateDefined, validateNumber, validateObject, validateOneOf, validateString } from './validation/runtimeValidation';

/**
 * Validates an email string
 * 
 * @param value - Value to validate as an email
 * @param path - Path for error reporting
 * @returns The validated email string
 * @throws ValidationError if the email format is invalid
 */
export function validateEmail(value: unknown, path: string): string {
  const email = validateString(value, path);
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(
      `Invalid email format at ${path}`,
      path,
      email,
      'INVALID_EMAIL'
    );
  }
  
  return email;
}

/**
 * Validates a URL string
 * 
 * @param value - Value to validate as a URL
 * @param path - Path for error reporting
 * @returns The validated URL string
 * @throws ValidationError if the URL format is invalid
 */
export function validateUrl(value: unknown, path: string): string {
  const url = validateString(value, path);
  
  try {
    new URL(url);
  } catch {
    throw new ValidationError(
      `Invalid URL format at ${path}`,
      path,
      url,
      'INVALID_URL'
    );
  }
  
  return url;
}

/**
 * Validates a date string or object
 * 
 * @param value - Value to validate as a date
 * @param path - Path for error reporting
 * @returns The validated Date object
 * @throws ValidationError if the date format is invalid
 */
export function validateDate(value: unknown, path: string): Date {
  let date: Date;
  
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
  } else {
    throw new ValidationError(
      `Expected Date, string, or number at ${path}, got ${typeof value}`,
      path,
      value,
      'TYPE_ERROR'
    );
  }
  
  if (isNaN(date.getTime())) {
    throw new ValidationError(
      `Invalid date at ${path}`,
      path,
      value,
      'INVALID_DATE'
    );
  }
  
  return date;
}

/**
 * Validates a UUID string
 * 
 * @param value - Value to validate as a UUID
 * @param path - Path for error reporting
 * @returns The validated UUID string
 * @throws ValidationError if the UUID format is invalid
 */
export function validateUuid(value: unknown, path: string): string {
  const uuid = validateString(value, path);
  
  // UUID v4 format regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    throw new ValidationError(
      `Invalid UUID format at ${path}`,
      path,
      uuid,
      'INVALID_UUID'
    );
  }
  
  return uuid;
}

/**
 * Type guard to check if a value is a non-empty string
 * 
 * @param value - Value to check
 * @returns True if the value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Type guard to check if a value is a valid number
 * 
 * @param value - Value to check
 * @returns True if the value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Type guard to check if a value is a non-empty array
 * 
 * @param value - Value to check
 * @returns True if the value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard to check if a value is a non-empty object
 * 
 * @param value - Value to check
 * @returns True if the value is a non-empty object
 */
export function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && 
         value !== null && 
         !Array.isArray(value) && 
         Object.keys(value).length > 0;
}

// Export the validators from runtimeValidation to provide a unified API
export {
  validateString,
  validateNumber,
  validateBoolean,
  validateObject,
  validateArray,
  validateOneOf,
  validateDefined,
  withDefault
};
