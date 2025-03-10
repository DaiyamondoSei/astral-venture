
/**
 * Type validation utilities to ensure runtime type safety
 */

/**
 * Validates that a value is defined (not undefined or null)
 * @param value The value to check
 * @param name Name of the value for error messages
 * @returns The same value if it's defined
 * @throws Error if the value is undefined or null
 */
export function validateDefined<T>(value: T | undefined | null, name: string): T {
  if (value === undefined || value === null) {
    throw new Error(`${name} is required but was not provided`);
  }
  return value;
}

/**
 * Validates that a value is a non-empty string
 * @param value The value to check
 * @param name Name of the value for error messages
 * @returns The same value if it's a non-empty string
 * @throws Error if the value is not a non-empty string
 */
export function validateString(value: unknown, name: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${name} must be a string, got ${typeof value}`);
  }
  if (value.trim() === '') {
    throw new Error(`${name} cannot be an empty string`);
  }
  return value;
}

/**
 * Validates that a value is a number
 * @param value The value to check
 * @param name Name of the value for error messages
 * @returns The same value if it's a number
 * @throws Error if the value is not a number
 */
export function validateNumber(value: unknown, name: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${name} must be a number, got ${typeof value}`);
  }
  return value;
}

/**
 * Validates that a value is a boolean
 * @param value The value to check
 * @param name Name of the value for error messages
 * @returns The same value if it's a boolean
 * @throws Error if the value is not a boolean
 */
export function validateBoolean(value: unknown, name: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${name} must be a boolean, got ${typeof value}`);
  }
  return value;
}

/**
 * Validates that a value is an array
 * @param value The value to check
 * @param name Name of the value for error messages
 * @returns The same value if it's an array
 * @throws Error if the value is not an array
 */
export function validateArray<T>(value: unknown, name: string): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`${name} must be an array, got ${typeof value}`);
  }
  return value as T[];
}

/**
 * Validates that a value matches one of the allowed values
 * @param value The value to check
 * @param allowedValues Array of allowed values
 * @param name Name of the value for error messages
 * @returns The same value if it's allowed
 * @throws Error if the value is not in the allowed values
 */
export function validateOneOf<T>(value: T, allowedValues: T[], name: string): T {
  if (!allowedValues.includes(value)) {
    throw new Error(`${name} must be one of: ${allowedValues.join(', ')}, got: ${value}`);
  }
  return value;
}

/**
 * Validates that a value matches a regex pattern
 * @param value The value to check
 * @param pattern The regex pattern to match
 * @param name Name of the value for error messages
 * @returns The same value if it matches the pattern
 * @throws Error if the value doesn't match the pattern
 */
export function validatePattern(value: string, pattern: RegExp, name: string): string {
  if (!pattern.test(value)) {
    throw new Error(`${name} does not match the required pattern`);
  }
  return value;
}

/**
 * Type guard to check if a value is a valid object (non-null and an object)
 * @param value The value to check
 * @returns True if the value is a valid object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value has a specific property
 * @param value The value to check
 * @param prop The property to check for
 * @returns True if the value has the property
 */
export function hasProperty<K extends string>(
  value: unknown,
  prop: K
): value is { [P in K]: unknown } {
  return isObject(value) && prop in value;
}

/**
 * Type guard to check if a value is a valid function
 * @param value The value to check
 * @returns True if the value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}
