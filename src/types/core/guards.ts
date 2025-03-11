
/**
 * Core Type Guards
 * 
 * This module provides type guard functions to perform runtime type checking.
 * These guards validate data structures at runtime and provide TypeScript
 * with type narrowing capabilities.
 */

import { 
  Optional, 
  UUID, 
  Email, 
  URI, 
  ISO8601Date, 
  UserID, 
  SessionID 
} from './base';

// -------------------------------------------------------------------------
// Basic type guards
// -------------------------------------------------------------------------

/**
 * Checks if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: Optional<T>): value is T {
  return value !== null && value !== undefined;
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
 * Checks if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Checks if a value is an object (not null and not an array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks if a value is an array
 */
export function isArray<T = unknown>(value: unknown): value is Array<T> {
  return Array.isArray(value);
}

/**
 * Checks if a value is a Date object
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Checks if a value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

// -------------------------------------------------------------------------
// Format-specific type guards
// -------------------------------------------------------------------------

/**
 * Checks if a string is a valid UUID
 */
export function isUUID(value: unknown): value is UUID {
  if (!isString(value)) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Checks if a string is a valid email address
 */
export function isEmail(value: unknown): value is Email {
  if (!isString(value)) return false;
  // Basic email validation, could be enhanced for production
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Checks if a string is a valid URI
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
 * Checks if a string is a valid ISO 8601 date
 */
export function isISO8601Date(value: unknown): value is ISO8601Date {
  if (!isString(value)) return false;
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/.test(value);
}

// -------------------------------------------------------------------------
// Brand type guards
// -------------------------------------------------------------------------

/**
 * Checks if a value is a valid UserID
 */
export function isUserID(value: unknown): value is UserID {
  return isString(value) && value.length > 0;
}

/**
 * Checks if a value is a valid SessionID
 */
export function isSessionID(value: unknown): value is SessionID {
  return isString(value) && value.length > 0;
}

// -------------------------------------------------------------------------
// Optimized Type Guard Factory
// -------------------------------------------------------------------------

/**
 * Creates an optimized type guard with quick-fail checks first
 */
export function createOptimizedGuard<T>(
  check: (value: unknown) => value is T,
  errorMessage = 'Invalid value'
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    // Fast-path checks first
    if (value === null || value === undefined) {
      return false;
    }
    
    // Then run full check
    return check(value);
  };
}

// -------------------------------------------------------------------------
// Object validation
// -------------------------------------------------------------------------

/**
 * Check if object has a specific property
 */
export function hasProperty<K extends string>(obj: unknown, prop: K): obj is { [P in K]: unknown } {
  return isObject(obj) && prop in obj;
}

/**
 * Create a type guard for an object with specified properties
 */
export function createObjectGuard<T>(
  propertyChecks: Record<keyof T, (val: unknown) => boolean>
): (obj: unknown) => obj is T {
  return (obj: unknown): obj is T => {
    if (!isObject(obj)) return false;
    
    for (const [key, validator] of Object.entries(propertyChecks)) {
      if (!hasProperty(obj, key) || !validator(obj[key])) {
        return false;
      }
    }
    
    return true;
  };
}
