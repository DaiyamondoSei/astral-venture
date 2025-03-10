
import { ValidationError } from './ValidationError';

/**
 * Validates that a value is defined and not null
 * 
 * @param value Value to validate
 * @param name Field name for error message
 * @returns The validated value
 * @throws ValidationError if value is undefined or null
 */
export function validateDefined<T>(value: T | null | undefined, name = 'value'): T {
  if (value === undefined || value === null) {
    throw ValidationError.createRequiredError(name);
  }
  return value;
}

/**
 * Validates that a value is a string
 * 
 * @param value Value to validate
 * @param name Field name for error message
 * @returns The validated string
 * @throws ValidationError if value is not a string
 */
export function validateString(value: unknown, name = 'value'): string {
  validateDefined(value, name);
  
  if (typeof value !== 'string') {
    throw ValidationError.createTypeError(name, 'string', value);
  }
  
  return value;
}

/**
 * Validates that a value is a number
 * 
 * @param value Value to validate
 * @param name Field name for error message
 * @returns The validated number
 * @throws ValidationError if value is not a number or is NaN
 */
export function validateNumber(value: unknown, name = 'value'): number {
  validateDefined(value, name);
  
  if (typeof value !== 'number' || isNaN(value)) {
    throw ValidationError.createTypeError(name, 'number', value);
  }
  
  return value;
}

/**
 * Validates that a value is a boolean
 * 
 * @param value Value to validate
 * @param name Field name for error message
 * @returns The validated boolean
 * @throws ValidationError if value is not a boolean
 */
export function validateBoolean(value: unknown, name = 'value'): boolean {
  validateDefined(value, name);
  
  if (typeof value !== 'boolean') {
    throw ValidationError.createTypeError(name, 'boolean', value);
  }
  
  return value;
}

/**
 * Validates that a value is an array
 * 
 * @param value Value to validate
 * @param name Field name for error message
 * @returns The validated array
 * @throws ValidationError if value is not an array
 */
export function validateArray<T>(value: unknown, name = 'value'): T[] {
  validateDefined(value, name);
  
  if (!Array.isArray(value)) {
    throw ValidationError.createTypeError(name, 'array', value);
  }
  
  return value as T[];
}

/**
 * Validates that a value is an object
 * 
 * @param value Value to validate
 * @param name Field name for error message
 * @returns The validated object
 * @throws ValidationError if value is not an object or is null/array
 */
export function validateObject<T extends object>(value: unknown, name = 'value'): T {
  validateDefined(value, name);
  
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw ValidationError.createTypeError(name, 'object', value);
  }
  
  return value as T;
}

/**
 * Validates that a value is one of the allowed values
 * 
 * @param value Value to validate
 * @param allowedValues Array of allowed values
 * @param name Field name for error message
 * @returns The validated value
 * @throws ValidationError if value is not in allowedValues
 */
export function validateOneOf<T>(value: unknown, allowedValues: T[], name = 'value'): T {
  validateDefined(value, name);
  
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${name} must be one of: ${allowedValues.join(', ')}`,
      name,
      value,
      {
        rule: 'oneOf',
        details: { allowedValues }
      }
    );
  }
  
  return value as T;
}

/**
 * Validates that a string matches a format pattern
 * 
 * @param value String to validate
 * @param pattern Regex pattern to match
 * @param formatName Name of the format for error message
 * @param name Field name for error message
 * @returns The validated string
 * @throws ValidationError if string doesn't match pattern
 */
export function validateFormat(
  value: unknown, 
  pattern: RegExp, 
  formatName: string,
  name = 'value'
): string {
  const stringValue = validateString(value, name);
  
  if (!pattern.test(stringValue)) {
    throw ValidationError.createFormatError(name, formatName, value);
  }
  
  return stringValue;
}

/**
 * Validates that a number is within a range
 * 
 * @param value Number to validate
 * @param min Minimum allowed value (inclusive)
 * @param max Maximum allowed value (inclusive)
 * @param name Field name for error message
 * @returns The validated number
 * @throws ValidationError if number is outside range
 */
export function validateRange(
  value: unknown, 
  min: number, 
  max: number,
  name = 'value'
): number {
  const numberValue = validateNumber(value, name);
  
  if (numberValue < min || numberValue > max) {
    throw ValidationError.createRangeError(name, min, max, value);
  }
  
  return numberValue;
}

/**
 * Validates an email address format
 * 
 * @param value Email to validate
 * @param name Field name for error message
 * @returns The validated email string
 * @throws ValidationError if not a valid email format
 */
export function validateEmail(value: unknown, name = 'email'): string {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return validateFormat(value, emailRegex, 'email', name);
}

/**
 * Validates a URL format
 * 
 * @param value URL to validate
 * @param name Field name for error message
 * @returns The validated URL string
 * @throws ValidationError if not a valid URL format
 */
export function validateUrl(value: unknown, name = 'url'): string {
  const urlRegex = /^https?:\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
  return validateFormat(value, urlRegex, 'URL', name);
}

/**
 * Validates a date string format
 * 
 * @param value Date string to validate
 * @param name Field name for error message
 * @returns The validated date string
 * @throws ValidationError if not a valid date format
 */
export function validateDateString(value: unknown, name = 'date'): string {
  const stringValue = validateString(value, name);
  const date = new Date(stringValue);
  
  if (isNaN(date.getTime())) {
    throw ValidationError.createFormatError(name, 'date', value);
  }
  
  return stringValue;
}

export default {
  validateDefined,
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateOneOf,
  validateFormat,
  validateRange,
  validateEmail,
  validateUrl,
  validateDateString
};
