
/**
 * Validation Utilities
 * 
 * Re-exports validation utilities for easy access
 */

import ValidationError, { isValidationError } from './ValidationError';
import * as runtimeValidation from './runtimeValidation';

export {
  ValidationError,
  isValidationError,
  runtimeValidation
};

// Re-export common validation functions for convenient access
export const {
  validateRequired,
  validateString,
  validateNumber,
  validateBoolean,
  validateObject,
  validateArray,
  validateDate,
  validateOneOf,
  isOneOf,
  validatePattern,
  validateRange,
  validateMinLength,
  validateMaxLength,
  validateEmail
} = runtimeValidation;

export default {
  ValidationError,
  isValidationError,
  ...runtimeValidation
};
