
/**
 * Runtime type validation utilities for safer data handling
 */

import { z } from 'zod';
import { isArray, isBoolean, isNumber, isObject, isString } from 'lodash';
import {
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateOneOf,
  validateDefined,
  isValidationError
} from './runtimeValidation';

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates that a value matches a specific pattern
 * 
 * @param value - The value to validate
 * @param pattern - Regular expression pattern to match
 * @param name - Name of the parameter (for error messages)
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validatePattern(
  value: unknown,
  pattern: RegExp,
  name = 'value'
): string {
  const strValue = validateString(value, name);
  
  if (!pattern.test(strValue)) {
    throw new ValidationError(
      `${name} must match pattern ${pattern}`
    );
  }
  
  return strValue;
}

/**
 * Validates that a number is within a specific range
 * 
 * @param value - The value to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @param name - Name of the parameter (for error messages)
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateRange(
  value: unknown,
  min: number,
  max: number,
  name = 'value'
): number {
  const numValue = validateNumber(value, name);
  
  if (numValue < min || numValue > max) {
    throw new ValidationError(
      `${name} must be between ${min} and ${max}`
    );
  }
  
  return numValue;
}

/**
 * Composes multiple validators into a single validator
 * 
 * @param validators - Array of validator functions
 * @returns A function that runs all validators in sequence
 */
export function composeValidators<T>(
  validators: Array<(value: unknown, name?: string) => unknown>
): (value: unknown, name?: string) => T {
  return (value: unknown, name = 'value'): T => {
    return validators.reduce(
      (result, validator) => validator(result, name),
      value
    ) as T;
  };
}

/**
 * Validates an array of items using a specific item validator
 * 
 * @param value - The array to validate
 * @param itemValidator - Validator for each item
 * @param name - Name of the parameter (for error messages)
 * @returns The validated array
 * @throws ValidationError if validation fails
 */
export function validateArrayItems<T>(
  value: unknown,
  itemValidator: (item: unknown, index: number) => T,
  name = 'array'
): T[] {
  const arrayValue = validateArray(value, name);
  
  return arrayValue.map((item, index) => {
    try {
      return itemValidator(item, index);
    } catch (error) {
      if (isValidationError(error)) {
        throw new ValidationError(
          `${name}[${index}]: ${error.message}`
        );
      }
      throw error;
    }
  });
}

/**
 * Export all utility functions
 */
export {
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateOneOf,
  validateDefined,
  isValidationError
};
