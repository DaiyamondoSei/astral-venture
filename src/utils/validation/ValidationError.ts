
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
}

export class ValidationError extends Error {
  public readonly field?: string;
  public readonly code: string;
  public readonly constraints: Record<string, string>;
  public readonly details: Record<string, any>;
  public readonly path: string[];
  public readonly value: any;
  public readonly isValidationError: boolean = true;

  constructor(message: string, options: ValidationErrorOptions = {}) {
    super(message);
    this.name = 'ValidationError';
    this.field = options.field;
    this.code = options.code || 'invalid_value';
    this.constraints = options.constraints || {};
    this.details = options.details || {};
    this.path = options.path || [];
    this.value = options.value;
    
    // Ensures proper instanceof checks work in ES5 environments
    Object.setPrototypeOf(this, ValidationError.prototype);
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
  static fromApiError(error: any, defaultMessage = 'Validation failed'): ValidationError {
    // Handle API-specific error formats
    const message = error.message || error.error || defaultMessage;
    const code = error.code || 'api_validation_error';
    const details = error.details || error.errors || {};
    
    return new ValidationError(message, {
      code,
      details,
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
      name: this.name
    };
  }
}

// Type guard to check if an error is a ValidationError
export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError || 
         (error && typeof error === 'object' && error.isValidationError === true);
}
