
/**
 * Comprehensive validation utilities for Edge Functions
 * 
 * This module provides validation utilities for edge function requests and data,
 * with structured error handling and detailed error messages.
 */

/**
 * Validation error class for edge functions
 */
export class ValidationError extends Error {
  /**
   * Error code for the client
   */
  code: string;
  
  /**
   * HTTP status code to return
   */
  statusCode: number;
  
  /**
   * Additional error details
   */
  details?: Record<string, unknown>;
  
  constructor(message: string, options: {
    code?: string;
    statusCode?: number;
    details?: Record<string, unknown>;
  } = {}) {
    super(message);
    this.name = 'ValidationError';
    this.code = options.code || 'VALIDATION_ERROR';
    this.statusCode = options.statusCode || 400;
    this.details = options.details;
  }
}

/**
 * Result type for validation operations
 */
export interface ValidationResult<T = undefined> {
  isValid: boolean;
  errorMessage?: string;
  error?: ValidationError;
  validatedData?: T;
}

/**
 * Validate reflections data
 * 
 * @param reflections - The reflections array to validate
 * @returns Validation result
 */
export function validateReflectionsData(reflections: any[]): ValidationResult {
  try {
    if (!Array.isArray(reflections)) {
      throw new ValidationError("Reflections must be an array", {
        code: "INVALID_TYPE",
        details: { expected: "array", received: typeof reflections }
      });
    }
    
    if (reflections.length === 0) {
      throw new ValidationError("Reflections array cannot be empty", {
        code: "EMPTY_ARRAY"
      });
    }
    
    // Check if reflections have the required fields
    const invalidReflections = reflections.filter(r => !r.content);
    if (invalidReflections.length > 0) {
      throw new ValidationError("All reflections must have content", {
        code: "MISSING_REQUIRED_FIELD",
        details: { 
          missingField: "content", 
          invalidIndices: invalidReflections.map((_, i) => i)
        }
      });
    }
    
    // Validate reflection structure more thoroughly
    reflections.forEach((reflection, index) => {
      if (typeof reflection !== 'object' || reflection === null) {
        throw new ValidationError(`Reflection at index ${index} must be an object`, {
          code: "INVALID_REFLECTION_TYPE",
          details: { index, type: typeof reflection }
        });
      }
      
      if (typeof reflection.content !== 'string') {
        throw new ValidationError(`Content at index ${index} must be a string`, {
          code: "INVALID_CONTENT_TYPE",
          details: { index, type: typeof reflection.content }
        });
      }
      
      if (reflection.content.trim().length === 0) {
        throw new ValidationError(`Content at index ${index} cannot be empty`, {
          code: "EMPTY_CONTENT",
          details: { index }
        });
      }
      
      if (reflection.date !== undefined) {
        try {
          new Date(reflection.date);
        } catch {
          throw new ValidationError(`Invalid date at index ${index}`, {
            code: "INVALID_DATE",
            details: { index, date: reflection.date }
          });
        }
      }
    });
    
    return { isValid: true, validatedData: reflections };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { 
        isValid: false, 
        errorMessage: error.message,
        error
      };
    }
    
    return { 
      isValid: false, 
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Validate user ID
 * 
 * @param requestUserId - User ID from the request
 * @param authenticatedUserId - User ID from authentication
 * @returns Validation result
 */
export function validateUserId(
  requestUserId: string,
  authenticatedUserId: string
): ValidationResult {
  try {
    if (!requestUserId) {
      throw new ValidationError("Missing user ID", {
        code: "MISSING_USER_ID"
      });
    }
    
    // Validate UUID format
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(requestUserId)) {
      throw new ValidationError("Invalid user ID format", {
        code: "INVALID_USER_ID_FORMAT",
        details: { userId: requestUserId }
      });
    }
    
    if (requestUserId !== authenticatedUserId) {
      throw new ValidationError("You can only generate insights for your own reflections", {
        code: "UNAUTHORIZED_ACCESS",
        statusCode: 403,
        details: { requestedId: requestUserId, authenticatedId: authenticatedUserId }
      });
    }
    
    return { isValid: true, validatedData: requestUserId };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { 
        isValid: false, 
        errorMessage: error.message,
        error
      };
    }
    
    return { 
      isValid: false, 
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Safe validation wrapper for any validation function
 * 
 * @param validator - Function that may throw ValidationError
 * @param value - Value to validate
 * @param errorMessage - Optional custom error message
 * @returns Validation result
 */
export function safeValidate<T, R>(
  validator: (value: T) => R,
  value: T,
  errorMessage?: string
): ValidationResult<R> {
  try {
    const validatedData = validator(value);
    return { isValid: true, validatedData };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { 
        isValid: false, 
        errorMessage: errorMessage || error.message,
        error
      };
    }
    
    return { 
      isValid: false, 
      errorMessage: errorMessage || (error instanceof Error ? error.message : String(error))
    };
  }
}

/**
 * Validates that a value is defined (not null or undefined)
 * 
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateDefined<T>(value: T | null | undefined, fieldName: string): T {
  if (value === undefined || value === null) {
    throw new ValidationError(`${fieldName} is required`, {
      code: "MISSING_REQUIRED_FIELD",
      details: { field: fieldName }
    });
  }
  return value;
}

/**
 * Validates that a value is a string
 * 
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, {
      code: "INVALID_TYPE",
      details: { field: fieldName, expected: "string", received: typeof value }
    });
  }
  return value;
}

/**
 * Validates that a value is a number
 * 
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`, {
      code: "INVALID_TYPE",
      details: { field: fieldName, expected: "number", received: typeof value }
    });
  }
  return value;
}

/**
 * Validates that a value is a boolean
 * 
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns The validated boolean
 * @throws ValidationError if validation fails
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`, {
      code: "INVALID_TYPE",
      details: { field: fieldName, expected: "boolean", received: typeof value }
    });
  }
  return value;
}

/**
 * Validates that a value is one of the allowed values
 * 
 * @param value - Value to validate
 * @param allowedValues - Array of allowed values
 * @param fieldName - Field name for error message
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateOneOf<T>(value: unknown, allowedValues: T[], fieldName: string): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of [${allowedValues.join(', ')}]`, {
        code: "INVALID_VALUE",
        details: { 
          field: fieldName, 
          allowedValues, 
          receivedValue: value 
        }
      }
    );
  }
  return value as T;
}

/**
 * Validates that a value matches a specific format using regex
 * 
 * @param value - Value to validate
 * @param pattern - Regular expression pattern
 * @param fieldName - Field name for error message
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateFormat(value: unknown, pattern: RegExp, fieldName: string): string {
  const strValue = validateString(value, fieldName);
  
  if (!pattern.test(strValue)) {
    throw new ValidationError(`${fieldName} has an invalid format`, {
      code: "INVALID_FORMAT",
      details: { field: fieldName, value: strValue }
    });
  }
  
  return strValue;
}

/**
 * Validates an ISO date string
 * 
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns The validated date string
 * @throws ValidationError if validation fails
 */
export function validateDateString(value: unknown, fieldName: string): string {
  const strValue = validateString(value, fieldName);
  
  try {
    const date = new Date(strValue);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return strValue;
  } catch {
    throw new ValidationError(`${fieldName} must be a valid date string`, {
      code: "INVALID_DATE",
      details: { field: fieldName, value: strValue }
    });
  }
}

/**
 * Creates a composed validator that runs multiple validations
 * 
 * @param validators - Array of validator functions to run
 * @returns A function that runs all validators in sequence
 */
export function composeValidators<T>(
  ...validators: Array<(value: unknown) => unknown>
): (value: unknown) => T {
  return (value: unknown) => {
    return validators.reduce(
      (result, validator) => validator(result),
      value
    ) as T;
  };
}

/**
 * Validation helper for partial updates
 * 
 * @param value - Object to validate
 * @param validators - Record of field validators
 * @returns Validated object
 * @throws ValidationError if validation fails
 */
export function validatePartialUpdate<T extends Record<string, unknown>>(
  value: unknown,
  validators: Partial<Record<keyof T, (val: unknown) => unknown>>
): Partial<T> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError('Expected an object for partial update', {
      code: "INVALID_TYPE",
      details: { expected: "object", received: typeof value }
    });
  }
  
  const result: Partial<T> = {};
  const errors: Record<string, string> = {};
  let hasErrors = false;
  
  for (const [key, fieldValue] of Object.entries(value)) {
    const validator = validators[key as keyof T];
    
    if (validator) {
      try {
        result[key as keyof T] = validator(fieldValue) as T[keyof T];
      } catch (error) {
        errors[key] = error instanceof Error ? error.message : String(error);
        hasErrors = true;
      }
    } else {
      // No validator for this field, include as-is
      result[key as keyof T] = fieldValue as T[keyof T];
    }
  }
  
  if (hasErrors) {
    throw new ValidationError('Invalid fields in update', {
      code: "INVALID_UPDATE_FIELDS",
      details: { errors }
    });
  }
  
  return result;
}
