
import ValidationError, { isValidationError } from './ValidationError';
import * as runtimeValidation from './runtimeValidation';
import * as schemaValidator from './schemaValidator';

/**
 * Re-export all validation utilities
 */
export {
  // Runtime validation
  runtimeValidation,
  
  // Schema validation
  schemaValidator,
  
  // Validation error handling
  ValidationError,
  isValidationError,
  
  // Common runtime validators
  runtimeValidation as validators
};

// Individual runtime validators
export const {
  validateDefined,
  validateString,
  validateNonEmptyString,
  validateNumber,
  validateBoolean,
  validateObject,
  validateArray,
  validateOneOf,
  validatePattern,
  validateRange,
  validateDate,
  validateUUID,
  validateEmail
} = runtimeValidation;

// Schema validators
export const {
  createSchemaValidator,
  validateSchema
} = schemaValidator;

export default {
  // Runtime validation
  ...runtimeValidation,
  
  // Schema validation
  ...schemaValidator,
  
  // Error handling
  ValidationError,
  isValidationError
};
