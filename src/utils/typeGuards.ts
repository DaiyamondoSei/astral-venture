
/**
 * Enhanced type guards for runtime type checking
 */

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a number and not NaN
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Type guard to check if a value is a valid array with items
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard to check if a value is a valid Date object
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if a value is a valid object (not null, not array)
 */
export function isValidObject<T extends object>(value: unknown): value is T {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if all values in an array match a predicate
 */
export function arrayOfType<T>(
  value: unknown, 
  predicate: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(predicate);
}

/**
 * Type guard for a record with specific value types
 */
export function isRecordOfType<T>(
  value: unknown, 
  predicate: (item: unknown) => item is T
): value is Record<string, T> {
  if (!isValidObject(value)) return false;
  
  return Object.values(value).every(item => predicate(item));
}

/**
 * Type guard to check if a value has all required properties of type T
 */
export function hasRequiredProperties<T extends object>(
  value: unknown, 
  requiredProps: (keyof T)[]
): value is T {
  if (!isValidObject(value)) return false;
  
  return requiredProps.every(prop => 
    Object.prototype.hasOwnProperty.call(value, prop)
  );
}

/**
 * Type guard to enforce a union type
 */
export function isOneOf<T extends string>(
  value: unknown, 
  allowedValues: readonly T[]
): value is T {
  return typeof value === 'string' && allowedValues.includes(value as T);
}
