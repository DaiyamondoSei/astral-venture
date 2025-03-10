
/**
 * This file provides compatibility for older imports
 * and redirects to the new validation system
 */

import { 
  ValidationError,
  validateDefined,
  validateString,
  validateNumber,
  validateOneOf,
  validateArray,
  validateObject,
  composeValidators
} from './runtimeValidation';

// Export all validation primitives
export {
  ValidationError,
  validateDefined,
  validateString,
  validateNumber,
  validateOneOf,
  validateArray,
  validateObject,
  composeValidators
};

// Export a default object for convenience
export default {
  validateDefined,
  validateString,
  validateNumber,
  validateOneOf,
  validateArray,
  validateObject,
  composeValidators
};
