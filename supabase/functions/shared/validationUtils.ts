
/**
 * Shared validation utilities for Edge Functions
 * 
 * Provides consistent validation patterns for all edge functions.
 */

/**
 * Type definitions for validation errors
 */
export enum ValidationErrorCode {
  REQUIRED = 'REQUIRED',
  TYPE_ERROR = 'TYPE_ERROR',
  FORMAT_ERROR = 'FORMAT_ERROR',
  RANGE_ERROR = 'RANGE_ERROR',
  PATTERN_ERROR = 'PATTERN_ERROR',
  CONSTRAINT_ERROR = 'CONSTRAINT_ERROR',
  CUSTOM_ERROR = 'CUSTOM_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * ValidationErrorDetail interface
 */
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code?: string;
  rule?: string;
  value?: unknown;
  type?: string;
  field?: string;  // For backward compatibility
}

export class ValidationError extends Error {
  public readonly details: ValidationErrorDetail[];
  public readonly code: string;
  public readonly statusCode: number;
  
  constructor(
    message: string,
    details: ValidationErrorDetail[] = [],
    code: string = ValidationErrorCode.UNKNOWN_ERROR,
    statusCode: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.code = code;
    this.statusCode = statusCode;
    
    // Required for proper instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
  
  /**
   * Create formatted error for response
   */
  toResponseFormat(): { message: string; details: ValidationErrorDetail[]; code: string } {
    return {
      message: this.message,
      details: this.details,
      code: this.code
    };
  }
}

/**
 * Validates required parameters in a request
 */
export function validateRequiredParams(
  data: Record<string, unknown>,
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(param => 
    data[param] === undefined || data[param] === null || data[param] === ''
  );
  
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

/**
 * Validates that a value is a string
 */
export function validateString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be a string`,
        value,
        code: ValidationErrorCode.TYPE_ERROR
      }]
    );
  }
  return value;
}

/**
 * Validates that a value is a number
 */
export function validateNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(
      `${fieldName} must be a valid number`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be a valid number`,
        value,
        code: ValidationErrorCode.TYPE_ERROR
      }]
    );
  }
  return value;
}

/**
 * Validates that a value is a boolean
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(
      `${fieldName} must be a boolean`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be a boolean`,
        value,
        code: ValidationErrorCode.TYPE_ERROR
      }]
    );
  }
  return value;
}

/**
 * Validates that a value is an array
 */
export function validateArray(value: unknown, fieldName: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(
      `${fieldName} must be an array`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be an array`,
        value,
        code: ValidationErrorCode.TYPE_ERROR
      }]
    );
  }
  return value;
}

/**
 * Validates that a value is an object
 */
export function validateObject(value: unknown, fieldName: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(
      `${fieldName} must be an object`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be an object`,
        value,
        code: ValidationErrorCode.TYPE_ERROR
      }]
    );
  }
  return value as Record<string, unknown>;
}

/**
 * Validates that a value is one of the allowed values
 */
export function validateEnum<T extends string>(
  value: unknown, 
  allowedValues: readonly T[], 
  fieldName: string
): T {
  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      [{ 
        path: fieldName, 
        message: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
        value,
        code: ValidationErrorCode.FORMAT_ERROR
      }]
    );
  }
  return value as T;
}

/**
 * Validates that a string matches a pattern
 */
export function validatePattern(
  value: unknown,
  pattern: RegExp,
  fieldName: string,
  customMessage?: string
): string {
  const strValue = validateString(value, fieldName);
  
  if (!pattern.test(strValue)) {
    throw new ValidationError(
      customMessage || `${fieldName} has invalid format`,
      [{ 
        path: fieldName, 
        message: customMessage || `${fieldName} has invalid format`,
        value,
        code: ValidationErrorCode.PATTERN_ERROR
      }]
    );
  }
  
  return strValue;
}

/**
 * Safe validation wrapper that returns a result object instead of throwing
 */
export function safeValidate<T>(
  validator: (value: unknown) => T,
  value: unknown
): { success: boolean; value?: T; error?: ValidationErrorDetail } {
  try {
    const validatedValue = validator(value);
    return { success: true, value: validatedValue };
  } catch (error) {
    if (ValidationError.isValidationError(error)) {
      return { 
        success: false, 
        error: error.details[0] 
      };
    }
    return { 
      success: false, 
      error: { 
        path: '',
        message: error instanceof Error ? error.message : String(error),
        code: ValidationErrorCode.UNKNOWN_ERROR
      }
    };
  }
}

/**
 * Creates a standard error response for API endpoints
 */
export function createErrorResponse(
  error: unknown,
  status: number = 400,
  headers: Record<string, string> = {}
): Response {
  if (ValidationError.isValidationError(error)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.toResponseFormat(),
        timestamp: new Date().toISOString()
      }),
      {
        status: error.statusCode || status,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      }
    );
  }
  
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: ValidationErrorCode.UNKNOWN_ERROR
      },
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  );
}

/**
 * Creates a standard success response for API endpoints
 */
export function createSuccessResponse(
  data: unknown,
  headers: Record<string, string> = {},
  status: number = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  );
}

/**
 * Validates request payload against a schema
 */
export function validateRequest<T>(
  request: Request,
  requiredFields: string[] = []
): Promise<T> {
  return request.json()
    .then((data: unknown) => {
      // Check if data is an object
      if (typeof data !== 'object' || data === null) {
        throw new ValidationError(
          'Invalid request format', 
          [{ path: '', message: 'Request body must be a JSON object', code: ValidationErrorCode.TYPE_ERROR }]
        );
      }
      
      // Check required fields
      const { isValid, missingParams } = validateRequiredParams(data as Record<string, unknown>, requiredFields);
      
      if (!isValid) {
        throw new ValidationError(
          'Missing required parameters',
          missingParams.map(param => ({
            path: param,
            message: `${param} is required`,
            code: ValidationErrorCode.REQUIRED
          }))
        );
      }
      
      return data as T;
    })
    .catch(error => {
      if (ValidationError.isValidationError(error)) {
        throw error;
      }
      
      throw new ValidationError(
        'Failed to parse request body',
        [{ path: '', message: error instanceof Error ? error.message : String(error), code: ValidationErrorCode.TYPE_ERROR }]
      );
    });
}

export default {
  ValidationError,
  ValidationErrorCode,
  validateRequiredParams,
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateEnum,
  validatePattern,
  safeValidate,
  createErrorResponse,
  createSuccessResponse,
  validateRequest
};
