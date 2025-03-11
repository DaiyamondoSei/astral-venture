
/**
 * Core Type Guards
 * 
 * This file defines type guard functions that provide runtime type checking
 * capabilities. These guards help ensure that values conform to expected types
 * and can be used to validate external data.
 */

import { Optional, UUID, Email, URI, AnyRecord } from './base';

/**
 * Checks if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: Optional<T>): value is T {
  return value !== null && value !== undefined;
}

/**
 * Checks if a value is null
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Checks if a value is undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * Checks if a value is an object (not null, not an array)
 */
export function isObject(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks if a value is a plain object (created with {} or new Object())
 */
export function isPlainObject(value: unknown): value is AnyRecord {
  if (!isObject(value)) return false;
  
  const prototype = Object.getPrototypeOf(value);
  return (
    prototype === null || 
    prototype === Object.prototype ||
    Object.getPrototypeOf(prototype) === null
  );
}

/**
 * Checks if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Checks if a value is a typed array
 */
export function isTypedArray<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(itemGuard);
}

/**
 * Checks if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Checks if a value is an integer
 */
export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

/**
 * Checks if a value is a finite number
 */
export function isFiniteNumber(value: unknown): value is number {
  return isNumber(value) && Number.isFinite(value);
}

/**
 * Checks if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Checks if a value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Checks if a value is a UUID
 */
export function isUUID(value: unknown): value is UUID {
  if (!isString(value)) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Checks if a value is an email address
 */
export function isEmail(value: unknown): value is Email {
  if (!isString(value)) return false;
  // Basic email validation - for more comprehensive validation use a library
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Checks if a value is a valid URI
 */
export function isURI(value: unknown): value is URI {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a value matches a regular expression pattern
 */
export function matchesPattern(value: unknown, pattern: RegExp): value is string {
  return isString(value) && pattern.test(value);
}

/**
 * Checks if a value is a valid ISO 8601 date string
 */
export function isISODateString(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    const date = new Date(value);
    return !isNaN(date.getTime()) && value.includes('T');
  } catch {
    return false;
  }
}

/**
 * Checks if a value is a valid date object
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Checks if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * Checks if a value is a non-empty array
 */
export function isNonEmptyArray(value: unknown): value is unknown[] {
  return isArray(value) && value.length > 0;
}

/**
 * Checks if a value is a valid enum value
 */
export function isEnumValue<T extends object>(
  value: unknown,
  enumObject: T
): value is T[keyof T] {
  return Object.values(enumObject).includes(value as T[keyof T]);
}

/**
 * Type guard creator that composes multiple type guards
 */
export function composeGuards<T>(
  ...guards: ((value: unknown) => boolean)[]
): (value: unknown) => value is T {
  return ((value: unknown): value is T => {
    return guards.every(guard => guard(value));
  });
}

/**
 * Creates an optimized type guard function
 */
export function createOptimizedGuard<T>(
  check: (value: unknown) => value is T,
  errorMessage: string = 'Type validation failed'
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    // Fast-path checks first
    if (value === null || value === undefined) {
      return false;
    }
    
    return check(value);
  };
}
