
import { ValidationError } from './ValidationError';

/**
 * Type validation utilities
 * Provides type checking and validation functions
 */

type TypeValidator<T> = (value: unknown) => value is T;
type TypeGuard<T> = (value: unknown) => T;

/**
 * Check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Check if a value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Check if a value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Check if a value is undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * Check if a value is null
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Check if a value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if a value is a date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if a value is a valid ISO date string
 */
export function isISODateString(value: unknown): value is string {
  if (!isString(value)) return false;
  
  // ISO date format: YYYY-MM-DDTHH:mm:ss.sssZ
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z?)?$/;
  
  return isoDatePattern.test(value) && !isNaN(Date.parse(value));
}

/**
 * Check if a value is a valid email address
 */
export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  
  // Basic email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailPattern.test(value);
}

/**
 * Check if a value is a valid URL
 */
export function isURL(value: unknown): value is string {
  if (!isString(value)) return false;
  
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a value is a valid UUID
 */
export function isUUID(value: unknown): value is string {
  if (!isString(value)) return false;
  
  // UUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  return uuidPattern.test(value);
}

/**
 * Ensure a value is of a specific type, throwing if not
 */
export function ensureType<T>(
  value: unknown,
  validator: TypeValidator<T>,
  fieldName: string
): T {
  if (validator(value)) {
    return value;
  }
  
  throw ValidationError.typeError(
    value,
    validator.name.replace(/^is/, ''), // Convert isString to String
    fieldName
  );
}

/**
 * Ensure a value is defined, throwing if not
 */
export function ensureDefined<T>(
  value: T | undefined | null,
  fieldName: string
): T {
  if (value === undefined || value === null) {
    throw ValidationError.requiredError(fieldName);
  }
  
  return value;
}

/**
 * Create a guard function for a specific type
 */
export function createTypeGuard<T>(
  validator: TypeValidator<T>,
  typeName: string
): TypeGuard<T> {
  return (value: unknown): T => {
    if (validator(value)) {
      return value;
    }
    
    throw ValidationError.typeError(
      value,
      typeName,
      'value'
    );
  };
}

// Export common type guards
export const guardString = createTypeGuard(isString, 'string');
export const guardNumber = createTypeGuard(isNumber, 'number');
export const guardBoolean = createTypeGuard(isBoolean, 'boolean');
export const guardObject = createTypeGuard(isObject, 'object');
export const guardArray = createTypeGuard(isArray, 'array');
export const guardDate = createTypeGuard(isDate, 'Date');
