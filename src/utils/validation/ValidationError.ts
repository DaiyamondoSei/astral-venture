
/**
 * Validation Error class
 * 
 * A specialized error type for validation failures with additional context
 */

export interface ValidationErrorOptions {
  message: string;
  field?: string;
  expectedType?: string;
  value?: any;
  rule?: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  originalError?: Error;
}

/**
 * ValidationError represents a runtime validation failure.
 * It provides context about what value failed validation and why.
 */
export class ValidationError extends Error {
  /**
   * The field or parameter that failed validation
   */
  public readonly field?: string;

  /**
   * The expected type or format
   */
  public readonly expectedType?: string;

  /**
   * The actual value that failed validation
   */
  public readonly value?: any;

  /**
   * The validation rule that failed
   */
  public readonly rule?: string;

  /**
   * Error code for programmatic handling
   */
  public readonly code: string;

  /**
   * HTTP status code (for API related validation)
   */
  public readonly statusCode: number;

  /**
   * Additional context or details
   */
  public readonly details?: Record<string, unknown>;

  /**
   * Original error if this wraps another error
   */
  public readonly originalError?: Error;

  /**
   * Create a new ValidationError
   */
  constructor(options: ValidationErrorOptions) {
    // Create a descriptive message if one isn't provided
    const message = options.message || 
      `Validation failed${options.field ? ` for field '${options.field}'` : ''}${
        options.rule ? ` (rule: ${options.rule})` : ''
      }`;
      
    super(message);
    
    this.name = 'ValidationError';
    this.field = options.field;
    this.expectedType = options.expectedType;
    this.value = options.value;
    this.rule = options.rule;
    this.code = options.code || 'VALIDATION_ERROR';
    this.statusCode = options.statusCode || 400;
    this.details = options.details;
    this.originalError = options.originalError;
    
    // Maintain proper stack trace in Node.js (V8 engine)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Create a ValidationError from a type error
   */
  public static fromTypeError(
    error: TypeError, 
    field?: string,
    value?: any
  ): ValidationError {
    return new ValidationError({
      message: error.message,
      field,
      value,
      rule: 'type',
      code: 'TYPE_ERROR',
      originalError: error
    });
  }

  /**
   * Create a ValidationError for API response
   */
  public static fromApiError(
    error: any,
    endpoint: string
  ): ValidationError {
    return new ValidationError({
      message: `API validation failed for ${endpoint}: ${error.message || 'Unknown error'}`,
      field: error.field || endpoint,
      code: error.code || 'API_VALIDATION_ERROR',
      statusCode: error.status || 400,
      details: error.details || { endpoint }
    });
  }

  /**
   * Convert to a plain object for serialization
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      field: this.field,
      expectedType: this.expectedType,
      rule: this.rule,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details
    };
  }

  /**
   * Create a user-friendly error message
   */
  public getUserMessage(): string {
    if (this.field) {
      // Field-specific message
      if (this.rule === 'required') {
        return `${this.field} is required`;
      }
      
      if (this.rule === 'type') {
        return `${this.field} has an invalid format`;
      }
      
      if (this.rule === 'minLength') {
        return `${this.field} is too short`;
      }
      
      if (this.rule === 'maxLength') {
        return `${this.field} is too long`;
      }
      
      return `Invalid value for ${this.field}`;
    }
    
    // Generic message
    return 'Validation failed. Please check your input and try again.';
  }
}

export default ValidationError;
