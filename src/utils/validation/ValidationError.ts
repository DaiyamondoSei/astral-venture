
/**
 * ValidationError Class
 * 
 * A specialized error class for validation errors with structured information
 * about the specific validation that failed.
 */

// Default error messages
const DEFAULT_ERROR_MESSAGES = {
  required: 'This field is required',
  type: 'Type validation failed',
  format: 'Invalid format',
  range: 'Value is out of range',
  pattern: 'Pattern validation failed',
  custom: 'Validation failed'
};

export interface ValidationErrorOptions {
  field?: string;
  code?: string;
  value?: unknown;
  rule?: string;
  expectedType?: string;
  details?: string | Record<string, unknown>;
  statusCode?: number;
  originalError?: unknown;
}

/**
 * Specialized error class for validation failures
 */
export class ValidationError extends Error {
  /** Field that failed validation */
  readonly field: string;
  
  /** Validation error code */
  readonly code: string;
  
  /** Value that failed validation */
  readonly value: unknown;
  
  /** Validation rule that failed */
  readonly rule?: string;
  
  /** Expected type for type validations */
  readonly expectedType?: string;
  
  /** Additional details about the validation failure */
  readonly details?: string | Record<string, unknown>;
  
  /** HTTP status code to use (typically 400) */
  readonly statusCode: number;
  
  /** Original error if this wraps another error */
  readonly originalError?: unknown;
  
  /**
   * Create a new validation error
   */
  constructor(message: string, options: ValidationErrorOptions = {}) {
    super(message);
    this.name = 'ValidationError';
    this.field = options.field || 'unknown';
    this.code = options.code || 'validation_error';
    this.value = options.value;
    this.rule = options.rule;
    this.expectedType = options.expectedType;
    this.details = options.details;
    this.statusCode = options.statusCode || 400;
    this.originalError = options.originalError;
    
    // This is needed to make instanceof work correctly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  /**
   * Factory method to create a required field error
   */
  static requiredError(field: string, message?: string): ValidationError {
    return new ValidationError(
      message || `${field} is required`,
      {
        field,
        code: 'required',
        rule: 'required'
      }
    );
  }
  
  /**
   * Factory method to create a type error
   */
  static typeError(
    field: string, 
    expectedType: string, 
    value: unknown, 
    message?: string
  ): ValidationError {
    return new ValidationError(
      message || `${field} must be a ${expectedType}`,
      {
        field,
        code: 'type_error',
        rule: 'type-check',
        expectedType,
        value
      }
    );
  }
  
  /**
   * Factory method to create a format error
   */
  static formatError(
    field: string,
    pattern: string,
    value: unknown,
    message?: string
  ): ValidationError {
    return new ValidationError(
      message || `${field} has an invalid format`,
      {
        field,
        code: 'format_error',
        rule: 'format',
        details: { pattern },
        value
      }
    );
  }
  
  /**
   * Factory method to create a range error
   */
  static rangeError(
    field: string,
    min?: number,
    max?: number,
    value?: unknown,
    message?: string
  ): ValidationError {
    const details: Record<string, unknown> = {};
    if (min !== undefined) details.min = min;
    if (max !== undefined) details.max = max;
    
    return new ValidationError(
      message || `${field} is out of range`,
      {
        field,
        code: 'range_error',
        rule: min !== undefined && max !== undefined 
          ? 'range' 
          : min !== undefined ? 'min' : 'max',
        details,
        value
      }
    );
  }
  
  /**
   * Factory method to create an API validation error
   */
  static fromApiError(
    error: unknown, 
    defaultMessage = 'API validation failed'
  ): ValidationError {
    // Handle case where the error is already a ValidationError
    if (isValidationError(error)) {
      return error;
    }
    
    // Try to extract information from other error types
    const message = error instanceof Error ? error.message : String(error);
    
    return new ValidationError(message || defaultMessage, {
      code: 'api_validation_error',
      originalError: error,
      statusCode: 400
    });
  }
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'ValidationError'
  );
}

export default ValidationError;
