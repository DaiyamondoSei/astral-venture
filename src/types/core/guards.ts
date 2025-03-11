
/**
 * Type Guards
 * 
 * This module provides type guard functions for runtime type checking.
 * Type guards are functions that determine if a value is of a specific type.
 * 
 * @category Core
 * @version 1.0.0
 */

/**
 * Checks if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Checks if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Checks if value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks if value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Checks if value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Checks if value is undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

/**
 * Checks if value is null
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Checks if value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || typeof value === 'undefined';
}

/**
 * Checks if value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && typeof value !== 'undefined';
}

/**
 * Checks if value is a date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Checks if value is a valid ISO date string
 */
export function isISODateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/.test(value);
}

/**
 * Checks if an object has a specific property
 */
export function hasProperty<K extends string>(
  obj: unknown, 
  property: K
): obj is { [P in K]: unknown } {
  return isObject(obj) && property in obj;
}

/**
 * Checks if an object has a specific property of a given type
 */
export function hasPropertyOfType<K extends string, T>(
  obj: unknown, 
  property: K, 
  guard: (value: unknown) => value is T
): obj is { [P in K]: T } {
  return hasProperty(obj, property) && guard((obj as any)[property]);
}

/**
 * Creates a type guard for checking if a value is a string enum
 */
export function createStringEnumGuard<T extends string>(
  enumObject: Record<string, T>
): (value: unknown) => value is T {
  const validValues = Object.values(enumObject);
  return (value: unknown): value is T => 
    typeof value === 'string' && validValues.includes(value as T);
}

/**
 * Creates a type guard for checking if a value is a numeric enum
 */
export function createNumericEnumGuard<T extends number>(
  enumObject: Record<string, T>
): (value: unknown) => value is T {
  const validValues = Object.values(enumObject).filter(v => typeof v === 'number');
  return (value: unknown): value is T => 
    typeof value === 'number' && validValues.includes(value as T);
}

/**
 * Checks if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Checks if a value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Checks if a value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Checks if a value is an integer
 */
export function isInteger(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && Number.isInteger(value);
}

/**
 * Checks if a value is a positive integer
 */
export function isPositiveInteger(value: unknown): value is number {
  return isInteger(value) && value > 0;
}

/**
 * Checks if a value is a plain object (not null, array, or other built-in types)
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Checks if a value is an array of a specific type
 */
export function isArrayOf<T>(
  value: unknown, 
  itemGuard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(itemGuard);
}

/**
 * Checks if a value is a valid UUID string
 */
export function isUUIDString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Checks if a value is a valid email string
 */
export function isEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  // Simple email regex - for production, consider a more robust solution
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Checks if an object matches a TypeScript interface using a validation function
 */
export function validates<T>(
  value: unknown, 
  validator: (obj: unknown) => boolean
): value is T {
  return validator(value);
}

/**
 * Type assertion function - throws if condition is not met
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Type assertion function for a specific type
 */
export function assertType<T>(
  value: unknown, 
  guard: (v: unknown) => v is T, 
  message: string
): asserts value is T {
  if (!guard(value)) {
    throw new TypeError(`Type assertion failed: ${message}`);
  }
}
