
/**
 * Centralized validation system exports
 */

// Core validation error class
export { 
  ValidationError,
  isValidationError,
  type ValidationErrorOptions 
} from './ValidationError';

// Runtime validation utilities
export {
  validateString,
  validateNumber,
  validateBoolean,
  validateObject,
  validateArray,
  validateEmail,
  validateUrl,
  validateDate,
  validateEnum,
  validateRegex
} from './runtimeValidator';

// For forms and complex validation
export { 
  useRuntimeValidation,
  type ValidationResult,
  type ValidationOptions
} from '../../hooks/useRuntimeValidation';
