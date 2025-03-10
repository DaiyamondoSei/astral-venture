
/**
 * Custom error class for validation errors
 * 
 * This provides a standardized way to handle validation errors
 * across the application with rich context.
 */

export interface ValidationErrorOptions {
  field?: string;
  code?: string;
  constraints?: Record<string, string>;
  details?: Record<string, any>;
  path?: string[];
  value?: any;
  rule?: string;
  expectedType?: string;
  originalError?: any;
  statusCode?: number;
}

export class ValidationError extends Error {
  public readonly field?: string;
  public readonly code: string;
  public readonly constraints: Record<string, string>;
  public readonly details: Record<string, any>;
  public readonly path: string[];
  public readonly value: any;
  public readonly isValidationError: boolean = true;
  public readonly rule?: string;
  public readonly expectedType?: string;
  public readonly originalError?: any;
  public readonly statusCode?: number;

  constructor(message: string, options: ValidationErrorOptions = {}) {
    super(message);
    this.name = 'ValidationError';
    this.field = options.field;
    this.code = options.code || 'invalid_value';
    this.constraints = options.constraints || {};
    this.details = options.details || {};
    this.path = options.path || [];
    this.value = options.value;
    this.rule = options.rule;
    this.expectedType = options.expectedType;
    this.originalError = options.originalError;
    this.statusCode = options.statusCode || 400;
    
    // Ensures proper instanceof checks work in ES5 environments
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Create a validation error for a required field
   */
  static requiredError(field: string): ValidationError {
    return new ValidationError(`${field} is required`, {
      field,
      code: 'required',
      rule: 'required'
    });
  }

  /**
   * Create a validation error for type mismatch
   */
  static typeError(field: string, expectedType: string, value: any): ValidationError {
    return new ValidationError(`${field} must be a ${expectedType}`, {
      field,
      code: 'type_error',
      rule: 'type-check',
      expectedType,
      value,
      originalError: value
    });
  }

  /**
   * Create a validation error for format issues
   */
  static formatError(field: string, format: string, value: any): ValidationError {
    return new ValidationError(`${field} must be a valid ${format}`, {
      field,
      code: 'format_error',
      rule: 'format',
      value
    });
  }

  /**
   * Create a validation error for range validation
   */
  static rangeError(field: string, min?: number, max?: number): ValidationError {
    let message = `${field} is out of allowed range`;
    if (min !== undefined && max !== undefined) {
      message = `${field} must be between ${min} and ${max}`;
    } else if (min !== undefined) {
      message = `${field} must be at least ${min}`;
    } else if (max !== undefined) {
      message = `${field} must be at most ${max}`;
    }
    
    return new ValidationError(message, {
      field,
      code: 'range_error',
      rule: 'range',
      constraints: {
        min: min?.toString() || '',
        max: max?.toString() || ''
      }
    });
  }

  /**
   * Create a validation error for schema validation failures
   */
  static schemaError(field: string, details: Record<string, any>): ValidationError {
    return new ValidationError(`${field} failed schema validation`, {
      field,
      code: 'schema_error',
      rule: 'schema',
      details
    });
  }

  /**
   * Create a validation error from a field-specific error
   */
  static fromFieldError(field: string, message: string, options: Omit<ValidationErrorOptions, 'field'> = {}): ValidationError {
    return new ValidationError(message, {
      ...options,
      field,
      path: [...(options.path || []), field]
    });
  }

  /**
   * Create a validation error from an API error response
   */
  static fromApiError(error: any, statusCode = 400, details?: any): ValidationError {
    // Handle API-specific error formats
    const message = error.message || error.error || 'Validation failed';
    const code = error.code || 'api_validation_error';
    const errorDetails = details || error.details || error.errors || {};
    
    return new ValidationError(message, {
      code,
      details: errorDetails,
      statusCode,
      constraints: Array.isArray(error.errors) 
        ? error.errors.reduce((acc: Record<string, string>, curr: any) => {
            if (curr.field && curr.message) {
              acc[curr.field] = curr.message;
            }
            return acc;
          }, {})
        : {}
    });
  }

  /**
   * Create a general error from any error
   */
  static fromError(error: any, defaultMessage = 'An error occurred'): ValidationError {
    if (error instanceof ValidationError) {
      return error;
    }
    
    const message = error.message || defaultMessage;
    
    return new ValidationError(message, {
      code: 'unknown_error',
      details: { error }
    });
  }

  /**
   * Standardized way to get the full error message
   * including field and constraint information
   */
  getFullMessage(): string {
    if (this.field) {
      return `${this.field}: ${this.message}`;
    }
    return this.message;
  }

  /**
   * Get an object representation of the error
   * Useful for structured logging or API responses
   */
  toJSON(): Record<string, any> {
    return {
      message: this.message,
      field: this.field,
      code: this.code,
      constraints: this.constraints,
      details: this.details,
      path: this.path,
      name: this.name,
      rule: this.rule,
      expectedType: this.expectedType,
      statusCode: this.statusCode
    };
  }
}

// Type guard to check if an error is a ValidationError
export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError || 
         (error && typeof error === 'object' && error.isValidationError === true);
}
