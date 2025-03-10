
/**
 * Type validation utilities to ensure runtime type safety
 * This module provides standardized validators for runtime type checking 
 * to complement TypeScript's compile-time checks.
 */

/**
 * Type of validation error with context information
 */
export interface ValidationError {
  message: string;
  path?: string;
  value?: unknown;
  expectedType?: string;
}

/**
 * Validates that a value is defined (not undefined or null)
 * @param value The value to check
 * @param name Name of the value for error messages
 * @param options Additional validation options
 * @returns The same value if it's defined
 * @throws ValidationError if the value is undefined or null
 */
export function validateDefined<T>(
  value: T | undefined | null, 
  name: string, 
  options: { errorPrefix?: string } = {}
): T {
  const { errorPrefix = '' } = options;
  
  if (value === undefined || value === null) {
    const message = `${errorPrefix}${name} is required but was not provided`;
    throw createValidationError(message, { path: name, expectedType: 'defined' });
  }
  return value;
}

/**
 * Validates that a value is a non-empty string
 * @param value The value to check
 * @param name Name of the value for error messages
 * @param options Additional validation options
 * @returns The same value if it's a non-empty string
 * @throws ValidationError if the value is not a non-empty string
 */
export function validateString(
  value: unknown, 
  name: string, 
  options: { allowEmpty?: boolean; errorPrefix?: string } = {}
): string {
  const { allowEmpty = false, errorPrefix = '' } = options;
  
  if (typeof value !== 'string') {
    const message = `${errorPrefix}${name} must be a string, got ${typeof value}`;
    throw createValidationError(message, { path: name, value, expectedType: 'string' });
  }
  
  if (!allowEmpty && value.trim() === '') {
    const message = `${errorPrefix}${name} cannot be an empty string`;
    throw createValidationError(message, { path: name, value, expectedType: 'non-empty string' });
  }
  
  return value;
}

/**
 * Validates that a value is a number
 * @param value The value to check
 * @param name Name of the value for error messages
 * @param options Additional validation options
 * @returns The same value if it's a number
 * @throws ValidationError if the value is not a number
 */
export function validateNumber(
  value: unknown, 
  name: string, 
  options: { min?: number; max?: number; integer?: boolean; errorPrefix?: string } = {}
): number {
  const { min, max, integer = false, errorPrefix = '' } = options;
  
  // Check if it's a number
  if (typeof value !== 'number' || Number.isNaN(value)) {
    const message = `${errorPrefix}${name} must be a number, got ${typeof value}`;
    throw createValidationError(message, { path: name, value, expectedType: 'number' });
  }
  
  // Check if it's an integer when required
  if (integer && !Number.isInteger(value)) {
    const message = `${errorPrefix}${name} must be an integer, got ${value}`;
    throw createValidationError(message, { path: name, value, expectedType: 'integer' });
  }
  
  // Check minimum value
  if (min !== undefined && value < min) {
    const message = `${errorPrefix}${name} must be at least ${min}, got ${value}`;
    throw createValidationError(message, { path: name, value, expectedType: `number >= ${min}` });
  }
  
  // Check maximum value
  if (max !== undefined && value > max) {
    const message = `${errorPrefix}${name} must be at most ${max}, got ${value}`;
    throw createValidationError(message, { path: name, value, expectedType: `number <= ${max}` });
  }
  
  return value;
}

/**
 * Validates that a value is a boolean
 * @param value The value to check
 * @param name Name of the value for error messages
 * @param options Additional validation options
 * @returns The same value if it's a boolean
 * @throws ValidationError if the value is not a boolean
 */
export function validateBoolean(
  value: unknown, 
  name: string,
  options: { errorPrefix?: string } = {}
): boolean {
  const { errorPrefix = '' } = options;
  
  if (typeof value !== 'boolean') {
    const message = `${errorPrefix}${name} must be a boolean, got ${typeof value}`;
    throw createValidationError(message, { path: name, value, expectedType: 'boolean' });
  }
  
  return value;
}

/**
 * Validates that a value is an array
 * @param value The value to check
 * @param name Name of the value for error messages
 * @param options Additional validation options
 * @returns The same value if it's an array
 * @throws ValidationError if the value is not an array
 */
export function validateArray<T>(
  value: unknown, 
  name: string, 
  options: { minLength?: number; maxLength?: number; itemValidator?: (item: unknown, index: number) => T; errorPrefix?: string } = {}
): T[] {
  const { minLength, maxLength, itemValidator, errorPrefix = '' } = options;
  
  if (!Array.isArray(value)) {
    const message = `${errorPrefix}${name} must be an array, got ${typeof value}`;
    throw createValidationError(message, { path: name, value, expectedType: 'array' });
  }
  
  // Check minimum length
  if (minLength !== undefined && value.length < minLength) {
    const message = `${errorPrefix}${name} must contain at least ${minLength} items, got ${value.length}`;
    throw createValidationError(message, { path: name, value, expectedType: `array(length >= ${minLength})` });
  }
  
  // Check maximum length
  if (maxLength !== undefined && value.length > maxLength) {
    const message = `${errorPrefix}${name} must contain at most ${maxLength} items, got ${value.length}`;
    throw createValidationError(message, { path: name, value, expectedType: `array(length <= ${maxLength})` });
  }
  
  // Validate each item if a validator is provided
  if (itemValidator) {
    try {
      return value.map((item, index) => itemValidator(item, index));
    } catch (error) {
      if (error.path) {
        error.path = `${name}[${error.index}].${error.path}`;
      } else {
        error.path = `${name}[${error.index}]`;
      }
      throw error;
    }
  }
  
  return value as T[];
}

/**
 * Validates that a value matches one of the allowed values
 * @param value The value to check
 * @param allowedValues Array of allowed values
 * @param name Name of the value for error messages
 * @param options Additional validation options
 * @returns The same value if it's allowed
 * @throws ValidationError if the value is not in the allowed values
 */
export function validateOneOf<T>(
  value: T, 
  allowedValues: T[], 
  name: string,
  options: { errorPrefix?: string } = {}
): T {
  const { errorPrefix = '' } = options;
  
  if (!allowedValues.includes(value)) {
    const message = `${errorPrefix}${name} must be one of: ${allowedValues.join(', ')}, got: ${String(value)}`;
    throw createValidationError(message, { 
      path: name, 
      value, 
      expectedType: `oneOf(${allowedValues.join('|')})` 
    });
  }
  
  return value;
}

/**
 * Validates that a value matches a regex pattern
 * @param value The value to check
 * @param pattern The regex pattern to match
 * @param name Name of the value for error messages
 * @param options Additional validation options
 * @returns The same value if it matches the pattern
 * @throws ValidationError if the value doesn't match the pattern
 */
export function validatePattern(
  value: string, 
  pattern: RegExp, 
  name: string,
  options: { errorMessage?: string; errorPrefix?: string } = {}
): string {
  const { errorMessage, errorPrefix = '' } = options;
  
  if (!pattern.test(value)) {
    const message = errorMessage || `${errorPrefix}${name} does not match the required pattern`;
    throw createValidationError(message, { path: name, value, expectedType: `pattern(${pattern})` });
  }
  
  return value;
}

/**
 * Validates an object against a schema
 * @param value The object to validate
 * @param schema Validation schema defining property validators
 * @param name Name of the object for error messages
 * @param options Additional validation options
 * @returns The validated object with proper types
 * @throws ValidationError if any property fails validation
 */
export function validateObject<T extends Record<string, unknown>>(
  value: unknown,
  schema: Record<keyof T, (v: unknown, n: string) => any>,
  name: string,
  options: { 
    allowExtraProperties?: boolean; 
    requiredProperties?: (keyof T)[]; 
    errorPrefix?: string 
  } = {}
): T {
  const { allowExtraProperties = false, requiredProperties = [], errorPrefix = '' } = options;
  
  // Check if it's an object
  if (!isObject(value)) {
    const message = `${errorPrefix}${name} must be an object, got ${typeof value}`;
    throw createValidationError(message, { path: name, value, expectedType: 'object' });
  }
  
  const result: Record<string, unknown> = {};
  const inputObj = value as Record<string, unknown>;
  
  // Check required properties
  for (const prop of requiredProperties) {
    if (!(prop in inputObj)) {
      const message = `${errorPrefix}${name} is missing required property: ${String(prop)}`;
      throw createValidationError(message, { path: `${name}.${String(prop)}`, expectedType: 'defined' });
    }
  }
  
  // Validate properties according to schema
  for (const [key, validator] of Object.entries(schema)) {
    if (key in inputObj) {
      try {
        result[key] = validator(inputObj[key], key);
      } catch (error) {
        if (error.path) {
          error.path = `${name}.${error.path}`;
        } else {
          error.path = `${name}.${key}`;
        }
        throw error;
      }
    }
  }
  
  // Check for extra properties if not allowed
  if (!allowExtraProperties) {
    const schemaKeys = Object.keys(schema);
    const extraKeys = Object.keys(inputObj).filter(key => !schemaKeys.includes(key));
    
    if (extraKeys.length > 0) {
      const message = `${errorPrefix}${name} contains unexpected properties: ${extraKeys.join(', ')}`;
      throw createValidationError(message, { 
        path: name, 
        value: extraKeys, 
        expectedType: `only(${schemaKeys.join(',')})` 
      });
    }
  }
  
  return result as T;
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

/**
 * Combine multiple validators into a single validator
 * @param validators Array of validator functions to apply
 * @returns A new validator function that applies all validators in sequence
 */
export function composeValidators<T>(...validators: ((value: unknown, name: string) => any)[]): (value: unknown, name: string) => T {
  return (value: unknown, name: string): T => {
    let result = value;
    for (const validator of validators) {
      result = validator(result, name);
    }
    return result as T;
  };
}

/**
 * Creates a validation pipeline that catches and normalizes errors
 * @param validator The validator function to wrap
 * @returns A function that returns [value, null] on success or [null, error] on failure
 */
export function createSafeValidator<T>(validator: (value: unknown, name: string) => T): 
  (value: unknown, name: string) => [T, null] | [null, ValidationError] {
  return (value: unknown, name: string) => {
    try {
      return [validator(value, name), null];
    } catch (error) {
      if (error.path) {
        return [null, error];
      }
      // Convert regular errors to ValidationError
      return [null, createValidationError(error.message || String(error), { path: name, value })];
    }
  };
}

/**
 * Create a properly structured validation error
 */
function createValidationError(
  message: string, 
  details: { path?: string; value?: unknown; expectedType?: string; index?: number } = {}
): ValidationError {
  const error = new Error(message) as ValidationError;
  error.message = message;
  error.path = details.path;
  error.value = details.value;
  error.expectedType = details.expectedType;
  return error;
}
