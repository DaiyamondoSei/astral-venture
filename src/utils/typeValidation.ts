
/**
 * Type validation and transformation utilities
 */

import { z } from 'zod';
import { isNil, isString, isNumber, isArray, isObject, isBoolean } from 'lodash';
import { validateBoolean, validateNumber, validateString, validateArray, validateObject } from './validation/runtimeValidation';

/**
 * Ensures a value is of a specific type or returns a default
 * 
 * @param value - Value to validate
 * @param defaultValue - Default value to use if validation fails
 * @param validator - Validation function to apply
 * @returns Validated value or default
 */
export function withDefault<T>(
  value: unknown,
  defaultValue: T,
  validator: (val: unknown, name?: string) => T
): T {
  try {
    if (isNil(value)) {
      return defaultValue;
    }
    return validator(value, 'value');
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Ensures a string value or returns default
 * 
 * @param value - Value to validate
 * @param defaultValue - Default value to use if validation fails
 * @returns Validated string or default
 */
export function stringWithDefault(value: unknown, defaultValue = ''): string {
  return withDefault(value, defaultValue, validateString);
}

/**
 * Ensures a number value or returns default
 * 
 * @param value - Value to validate
 * @param defaultValue - Default value to use if validation fails
 * @returns Validated number or default
 */
export function numberWithDefault(value: unknown, defaultValue = 0): number {
  return withDefault(value, defaultValue, validateNumber);
}

/**
 * Ensures a boolean value or returns default
 * 
 * @param value - Value to validate
 * @param defaultValue - Default value to use if validation fails
 * @returns Validated boolean or default
 */
export function booleanWithDefault(value: unknown, defaultValue = false): boolean {
  return withDefault(value, defaultValue, validateBoolean);
}

/**
 * Ensures an array value or returns default
 * 
 * @param value - Value to validate
 * @param defaultValue - Default value to use if validation fails
 * @returns Validated array or default
 */
export function arrayWithDefault<T>(value: unknown, defaultValue: T[] = []): T[] {
  return withDefault(value, defaultValue, validateArray as (val: unknown, name?: string) => T[]);
}

/**
 * Ensures an object value or returns default
 * 
 * @param value - Value to validate
 * @param defaultValue - Default value to use if validation fails
 * @returns Validated object or default
 */
export function objectWithDefault<T extends object>(
  value: unknown, 
  defaultValue: T = {} as T
): T {
  return withDefault(value, defaultValue, validateObject as (val: unknown, name?: string) => T);
}

/**
 * Type-safe accessor for nested object properties
 * 
 * @param obj - Object to access property from
 * @param path - Property path (dot notation)
 * @param defaultValue - Default value if property doesn't exist
 * @returns Property value or default
 */
export function getPropertySafe<T>(
  obj: unknown,
  path: string,
  defaultValue: T
): T {
  if (!isObject(obj) || !path) {
    return defaultValue;
  }

  const properties = path.split('.');
  let current: any = obj;

  for (const prop of properties) {
    if (!isObject(current) || current[prop] === undefined) {
      return defaultValue;
    }
    current = current[prop];
  }

  return current as T;
}

/**
 * Creates a Zod schema for validating configuration objects
 * 
 * @param schema - Schema definition object
 * @returns Zod schema
 */
export function createConfigSchema<T extends Record<string, unknown>>(
  schema: Record<keyof T, z.ZodType<any>>
): z.ZodObject<any> {
  return z.object(schema);
}

// Re-export validation utilities for convenience
export {
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject
};
