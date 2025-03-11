
/**
 * Core Validators
 * 
 * This module provides a set of reusable validation functions that can be
 * composed to create complex validation logic.
 */

import { 
  Validator, 
  ValidationContext, 
  ValidationResult,
  ValidationErrorCode,
  StringValidationOptions,
  NumberValidationOptions
} from '../../types/validation/types';

import { isString, isNumber, isBoolean, isArray, isObject, isEmail, isURI } from '../../types/core/guards';

// -------------------------------------------------------------------------
// Core validators
// -------------------------------------------------------------------------

/**
 * Validates that a value is not undefined or null
 */
export const required: Validator = (value, context): ValidationResult => {
  if (value === undefined || value === null) {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || '',
        message: 'This field is required',
        code: ValidationErrorCode.REQUIRED
      }
    };
  }
  
  return { valid: true, validatedData: value };
};

/**
 * Validates that a value is a string
 */
export const string: Validator<string> = (value, context): ValidationResult<string> => {
  if (!isString(value)) {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || '',
        message: 'Must be a string',
        code: ValidationErrorCode.TYPE_ERROR,
        type: 'string',
        value
      }
    };
  }
  
  return { valid: true, validatedData: value };
};

/**
 * Creates a string validator with specified options
 */
export function createStringValidator(
  options: StringValidationOptions = {}
): Validator<string> {
  return (value, context): ValidationResult<string> => {
    // First validate it's a string
    const stringResult = string(value, context);
    if (!stringResult.valid) {
      return stringResult;
    }
    
    let strValue = stringResult.validatedData!;
    
    // Apply transformations if needed
    if (options.trim) {
      strValue = strValue.trim();
    }
    
    if (options.lowercase) {
      strValue = strValue.toLowerCase();
    }
    
    if (options.uppercase) {
      strValue = strValue.toUpperCase();
    }
    
    // Validate constraints
    if (options.minLength !== undefined && strValue.length < options.minLength) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message: `Must be at least ${options.minLength} characters`,
          code: ValidationErrorCode.RANGE_ERROR,
          value: strValue
        }
      };
    }
    
    if (options.maxLength !== undefined && strValue.length > options.maxLength) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message: `Must be at most ${options.maxLength} characters`,
          code: ValidationErrorCode.RANGE_ERROR,
          value: strValue
        }
      };
    }
    
    if (options.pattern && !options.pattern.test(strValue)) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message: options.patternMessage || 'Invalid format',
          code: ValidationErrorCode.PATTERN_ERROR,
          value: strValue
        }
      };
    }
    
    return { valid: true, validatedData: strValue };
  };
}

/**
 * Validates that a value is a number
 */
export const number: Validator<number> = (value, context): ValidationResult<number> => {
  if (!isNumber(value)) {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || '',
        message: 'Must be a number',
        code: ValidationErrorCode.TYPE_ERROR,
        type: 'number',
        value
      }
    };
  }
  
  return { valid: true, validatedData: value };
};

/**
 * Creates a number validator with specified options
 */
export function createNumberValidator(
  options: NumberValidationOptions = {}
): Validator<number> {
  return (value, context): ValidationResult<number> => {
    // First validate it's a number
    const numberResult = number(value, context);
    if (!numberResult.valid) {
      return numberResult;
    }
    
    const numValue = numberResult.validatedData!;
    
    // Validate constraints
    if (options.min !== undefined && numValue < options.min) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message: `Must be at least ${options.min}`,
          code: ValidationErrorCode.RANGE_ERROR,
          value: numValue
        }
      };
    }
    
    if (options.max !== undefined && numValue > options.max) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message: `Must be at most ${options.max}`,
          code: ValidationErrorCode.RANGE_ERROR,
          value: numValue
        }
      };
    }
    
    if (options.integer && !Number.isInteger(numValue)) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message: 'Must be an integer',
          code: ValidationErrorCode.FORMAT_ERROR,
          value: numValue
        }
      };
    }
    
    if (options.positive && numValue <= 0) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message: 'Must be positive',
          code: ValidationErrorCode.RANGE_ERROR,
          value: numValue
        }
      };
    }
    
    if (options.negative && numValue >= 0) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message: 'Must be negative',
          code: ValidationErrorCode.RANGE_ERROR,
          value: numValue
        }
      };
    }
    
    if (options.multipleOf && numValue % options.multipleOf !== 0) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message: `Must be a multiple of ${options.multipleOf}`,
          code: ValidationErrorCode.CONSTRAINT_ERROR,
          value: numValue
        }
      };
    }
    
    return { valid: true, validatedData: numValue };
  };
}

/**
 * Validates that a value is a boolean
 */
export const boolean: Validator<boolean> = (value, context): ValidationResult<boolean> => {
  if (!isBoolean(value)) {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || '',
        message: 'Must be a boolean',
        code: ValidationErrorCode.TYPE_ERROR,
        type: 'boolean',
        value
      }
    };
  }
  
  return { valid: true, validatedData: value };
};

/**
 * Validates that a value is an array
 */
export const array: Validator<unknown[]> = (value, context): ValidationResult<unknown[]> => {
  if (!isArray(value)) {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || '',
        message: 'Must be an array',
        code: ValidationErrorCode.TYPE_ERROR,
        type: 'array',
        value
      }
    };
  }
  
  return { valid: true, validatedData: value };
};

/**
 * Validates that a value is an object
 */
export const object: Validator<Record<string, unknown>> = (value, context): ValidationResult<Record<string, unknown>> => {
  if (!isObject(value)) {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || '',
        message: 'Must be an object',
        code: ValidationErrorCode.TYPE_ERROR,
        type: 'object',
        value
      }
    };
  }
  
  return { valid: true, validatedData: value };
};

/**
 * Validates that a string is a valid email address
 */
export const email: Validator<string> = (value, context): ValidationResult<string> => {
  // First validate it's a string
  const stringResult = string(value, context);
  if (!stringResult.valid) {
    return stringResult;
  }
  
  if (!isEmail(value)) {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || '',
        message: 'Must be a valid email address',
        code: ValidationErrorCode.FORMAT_ERROR,
        value
      }
    };
  }
  
  return { valid: true, validatedData: value };
};

/**
 * Validates that a string is a valid URL
 */
export const url: Validator<string> = (value, context): ValidationResult<string> => {
  // First validate it's a string
  const stringResult = string(value, context);
  if (!stringResult.valid) {
    return stringResult;
  }
  
  if (!isURI(value)) {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || '',
        message: 'Must be a valid URL',
        code: ValidationErrorCode.FORMAT_ERROR,
        value
      }
    };
  }
  
  return { valid: true, validatedData: value };
};

/**
 * Validates that a value matches a pattern
 */
export function pattern(regex: RegExp, message = 'Invalid format'): Validator<string> {
  return (value, context): ValidationResult<string> => {
    // First validate it's a string
    const stringResult = string(value, context);
    if (!stringResult.valid) {
      return stringResult;
    }
    
    if (!regex.test(value)) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message,
          code: ValidationErrorCode.PATTERN_ERROR,
          value
        }
      };
    }
    
    return { valid: true, validatedData: value };
  };
}

/**
 * Validates that a value is in a set of allowed values
 */
export function oneOf<T>(allowedValues: readonly T[], message?: string): Validator<T> {
  return (value, context): ValidationResult<T> => {
    if (!allowedValues.includes(value as T)) {
      return {
        valid: false,
        error: {
          path: context?.fieldPath || '',
          message: message || `Must be one of: ${allowedValues.join(', ')}`,
          code: ValidationErrorCode.CONSTRAINT_ERROR,
          value
        }
      };
    }
    
    return { valid: true, validatedData: value as T };
  };
}

/**
 * Validates an object against a schema
 */
export function validateObject<T>(
  value: unknown,
  schema: Record<string, Validator>,
  options: { abortEarly?: boolean, allowUnknown?: boolean } = {}
): ValidationResult<T> {
  // First validate it's an object
  const objectResult = object(value);
  if (!objectResult.valid) {
    return objectResult;
  }
  
  const errors: ValidationResult['errors'] = [];
  const validated: Record<string, unknown> = {};
  
  // Validate each field in the schema
  for (const [key, validator] of Object.entries(schema)) {
    const fieldValue = (value as Record<string, unknown>)[key];
    const context: ValidationContext = {
      fieldPath: key,
      parentValue: value,
      siblingValues: value as Record<string, unknown>
    };
    
    const fieldResult = validator(fieldValue, context);
    
    if (fieldResult.valid) {
      validated[key] = fieldResult.validatedData;
    } else {
      if (options.abortEarly) {
        return fieldResult;
      }
      
      if (fieldResult.error) {
        errors.push(fieldResult.error);
      }
      
      if (fieldResult.errors) {
        errors.push(...fieldResult.errors);
      }
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, validatedData: validated as T };
}
