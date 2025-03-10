
/**
 * Validation Module Index
 * 
 * Central export point for all validation utilities.
 */

// Export ValidationError class and utilities
export { default as ValidationError, isValidationError } from './ValidationError';

// Runtime validation utilities
export { 
  validateString, 
  validateNumber, 
  validateBoolean,
  validateArray,
  validateObject,
  validateOneOf,
  validateEmail,
  validateUrl
} from './runtimeValidation';

// Validation middleware
export { default as createValidationMiddleware } from './validationMiddleware';

// Parameter validators
export { 
  validateRequiredParams,
  validateOptionalParams,
  validateObjectSchema
} from './paramValidator';

// API validators
export { default as createApiValidator } from './apiValidator';

// Schema validators
export { default as createSchemaValidator } from './schemaValidator';

// Performance validators
export {
  validateComponentMetric,
  validateWebVitalMetric,
  validateDeviceInfo
} from './performanceValidator';

// Type validators
export {
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isFunction,
  isUndefined,
  isNull,
  isEmpty
} from './typeValidation';
