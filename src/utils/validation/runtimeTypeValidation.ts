
/**
 * Type validation utilities that provide TypeScript-aware runtime validation
 */

import {
  validateDefined,
  validateString,
  validateNumber,
  validateBoolean,
  validateObject,
  validateArray,
  validateOneOf,
  validateRange,
  validatePattern,
  composeValidators,
  ValidationError
} from './runtimeValidation';

/**
 * Generic type guard function interface
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Create a type guard for a specific validator
 * 
 * @param validator - The validator function to create a type guard for
 * @returns A TypeScript type guard function
 */
export function createTypeGuard<T>(
  validator: (value: unknown, name: string) => T
): TypeGuard<T> {
  return (value: unknown): value is T => {
    try {
      validator(value, 'value');
      return true;
    } catch (error) {
      return false;
    }
  };
}

/**
 * Type guard for string values
 */
export const isString = createTypeGuard(validateString);

/**
 * Type guard for number values
 */
export const isNumber = createTypeGuard(validateNumber);

/**
 * Type guard for boolean values
 */
export const isBoolean = createTypeGuard(validateBoolean);

/**
 * Type guard for object values
 */
export const isObject = createTypeGuard(validateObject);

/**
 * Type guard for array values
 */
export const isArray = createTypeGuard(validateArray);

/**
 * Create a type guard for values that must be one of a specific set
 * 
 * @param allowedValues - The set of allowed values
 * @returns A TypeScript type guard function
 */
export function createEnumTypeGuard<T extends readonly unknown[]>(
  allowedValues: T
): TypeGuard<T[number]> {
  return (value: unknown): value is T[number] => {
    try {
      validateOneOf(value, allowedValues, 'value');
      return true;
    } catch (error) {
      return false;
    }
  };
}

/**
 * Create a type guard for numbers within a specific range
 * 
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns A TypeScript type guard function
 */
export function createRangeTypeGuard(
  min: number,
  max: number
): TypeGuard<number> {
  return (value: unknown): value is number => {
    try {
      validateRange(value, min, max, 'value');
      return true;
    } catch (error) {
      return false;
    }
  };
}

/**
 * Create a type guard for strings matching a specific pattern
 * 
 * @param pattern - The regex pattern to match
 * @returns A TypeScript type guard function
 */
export function createPatternTypeGuard(
  pattern: RegExp
): TypeGuard<string> {
  return (value: unknown): value is string => {
    try {
      validatePattern(value, pattern, 'value');
      return true;
    } catch (error) {
      return false;
    }
  };
}

/**
 * Safe type assertion function that validates at runtime
 * 
 * @param value - The value to validate
 * @param typeGuard - The type guard function to use
 * @param name - The name of the value for error messages
 * @returns The validated value with the correct type
 * @throws ValidationError if validation fails
 */
export function assertType<T>(
  value: unknown,
  typeGuard: TypeGuard<T>,
  name = 'value'
): T {
  if (typeGuard(value)) {
    return value;
  }
  
  throw new ValidationError(`${name} is not of the expected type`, {
    code: 'TYPE_VALIDATION_FAILED',
    details: { value }
  });
}

export default {
  createTypeGuard,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  createEnumTypeGuard,
  createRangeTypeGuard,
  createPatternTypeGuard,
  assertType,
  ValidationError
};
