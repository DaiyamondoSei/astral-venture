
/**
 * Validation Utilities
 * 
 * This module provides common validation utilities and helper functions
 * for data validation throughout the application.
 */

import { 
  ValidationResult, 
  ValidationErrorDetail, 
  ValidationSeverity,
  ValidationErrorCode 
} from '../../types/core';
import { ValidationError } from './ValidationError';
import { 
  isString, 
  isNumber, 
  isObject, 
  isArray, 
  isBoolean,
  isNullOrUndefined,
  isDefined
} from '../../types/core/guards';

/**
 * Creates a schema validator function
 */
export function createSchemaValidator<T>(
  validatorFn: (value: unknown) => ValidationResult<T>
): (value: unknown) => ValidationResult<T> {
  return validatorFn;
}

/**
 * Validates that a value is a string
 */
export function validateString(
  value: unknown, 
  fieldName: string = 'field'
): ValidationResult<string> {
  if (isNullOrUndefined(value)) {
    return {
      valid: false,
      error: {
        path: fieldName,
        message: `${fieldName} is required`,
        code: ValidationErrorCode.REQUIRED
      }
    };
  }

  if (!isString(value)) {
    return {
      valid: false,
      error: {
        path: fieldName,
        message: `${fieldName} must be a string`,
        code: ValidationErrorCode.TYPE_ERROR,
        type: 'string',
        value
      }
    };
  }

  return {
    valid: true,
    validatedData: value
  };
}

/**
 * Validates that a value is a number
 */
export function validateNumber(
  value: unknown, 
  fieldName: string = 'field'
): ValidationResult<number> {
  if (isNullOrUndefined(value)) {
    return {
      valid: false,
      error: {
        path: fieldName,
        message: `${fieldName} is required`,
        code: ValidationErrorCode.REQUIRED
      }
    };
  }

  if (!isNumber(value)) {
    return {
      valid: false,
      error: {
        path: fieldName,
        message: `${fieldName} must be a number`,
        code: ValidationErrorCode.TYPE_ERROR,
        type: 'number',
        value
      }
    };
  }

  return {
    valid: true,
    validatedData: value
  };
}

/**
 * Validates that a value is a boolean
 */
export function validateBoolean(
  value: unknown, 
  fieldName: string = 'field'
): ValidationResult<boolean> {
  if (isNullOrUndefined(value)) {
    return {
      valid: false,
      error: {
        path: fieldName,
        message: `${fieldName} is required`,
        code: ValidationErrorCode.REQUIRED
      }
    };
  }

  if (!isBoolean(value)) {
    return {
      valid: false,
      error: {
        path: fieldName,
        message: `${fieldName} must be a boolean`,
        code: ValidationErrorCode.TYPE_ERROR,
        type: 'boolean',
        value
      }
    };
  }

  return {
    valid: true,
    validatedData: value
  };
}

/**
 * Validates that a value is an object
 */
export function validateObject(
  value: unknown, 
  fieldName: string = 'field'
): ValidationResult<Record<string, unknown>> {
  if (isNullOrUndefined(value)) {
    return {
      valid: false,
      error: {
        path: fieldName,
        message: `${fieldName} is required`,
        code: ValidationErrorCode.REQUIRED
      }
    };
  }

  if (!isObject(value)) {
    return {
      valid: false,
      error: {
        path: fieldName,
        message: `${fieldName} must be an object`,
        code: ValidationErrorCode.TYPE_ERROR,
        type: 'object',
        value
      }
    };
  }

  return {
    valid: true,
    validatedData: value
  };
}

/**
 * Validates that a value is an array
 */
export function validateArray(
  value: unknown, 
  fieldName: string = 'field'
): ValidationResult<unknown[]> {
  if (isNullOrUndefined(value)) {
    return {
      valid: false,
      error: {
        path: fieldName,
        message: `${fieldName} is required`,
        code: ValidationErrorCode.REQUIRED
      }
    };
  }

  if (!isArray(value)) {
    return {
      valid: false,
      error: {
        path: fieldName,
        message: `${fieldName} must be an array`,
        code: ValidationErrorCode.TYPE_ERROR,
        type: 'array',
        value
      }
    };
  }

  return {
    valid: true,
    validatedData: value
  };
}

/**
 * Validates data against a schema
 */
export function validateData<T>(
  data: unknown, 
  schema: Record<string, (value: unknown) => ValidationResult<any>>
): ValidationResult<T> {
  // First, validate that data is an object
  const objectResult = validateObject(data);
  if (!objectResult.valid) {
    return objectResult as ValidationResult<T>;
  }

  const validatedData = objectResult.validatedData as Record<string, unknown>;
  const validatedResult: Record<string, unknown> = {};
  const errors: ValidationErrorDetail[] = [];

  // Validate each field according to the schema
  for (const [key, validator] of Object.entries(schema)) {
    if (key in validatedData) {
      const result = validator(validatedData[key]);
      if (result.valid && isDefined(result.validatedData)) {
        validatedResult[key] = result.validatedData;
      } else if (!result.valid) {
        // Add field errors
        if (result.error) {
          errors.push({
            ...result.error,
            path: result.error.path || key
          });
        }
        if (result.errors) {
          errors.push(...result.errors.map(err => ({
            ...err,
            path: err.path || key
          })));
        }
      }
    } else {
      // Field is missing
      errors.push({
        path: key,
        message: `${key} is required`,
        code: ValidationErrorCode.REQUIRED
      });
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  return {
    valid: true,
    validatedData: validatedResult as T
  };
}

/**
 * Creates a validator for ensuring a value is one of the allowed values
 */
export function createEnumValidator<T extends string | number>(
  allowedValues: readonly T[],
  fieldName: string = 'field'
): (value: unknown) => ValidationResult<T> {
  return (value: unknown): ValidationResult<T> => {
    if (isNullOrUndefined(value)) {
      return {
        valid: false,
        error: {
          path: fieldName,
          message: `${fieldName} is required`,
          code: ValidationErrorCode.REQUIRED
        }
      };
    }

    if (!allowedValues.includes(value as T)) {
      return {
        valid: false,
        error: {
          path: fieldName,
          message: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
          code: ValidationErrorCode.CONSTRAINT_ERROR,
          value
        }
      };
    }

    return {
      valid: true,
      validatedData: value as T
    };
  };
}

/**
 * Throw a validation error if condition is false
 */
export function validateCondition(
  condition: boolean,
  message: string,
  fieldName: string = 'field',
  code: ValidationErrorCode = ValidationErrorCode.CONSTRAINT_ERROR
): void {
  if (!condition) {
    throw new ValidationError(
      message,
      [{
        path: fieldName,
        message,
        code
      }]
    );
  }
}

/**
 * Validate and transform data
 */
export function validateAndTransform<T, R>(
  data: T,
  validator: (data: T) => ValidationResult<R>
): R {
  const result = validator(data);
  if (!result.valid || result.validatedData === undefined) {
    throw new ValidationError(
      'Validation failed',
      result.errors || (result.error ? [result.error] : [])
    );
  }
  return result.validatedData;
}

// Export all the types and guards
export { 
  isString, 
  isNumber, 
  isObject, 
  isArray, 
  isBoolean,
  isNullOrUndefined,
  isDefined
};
