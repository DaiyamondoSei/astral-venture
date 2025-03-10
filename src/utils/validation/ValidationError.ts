
/**
 * Validation Error Class
 * 
 * A specialized error class for validation errors with rich metadata.
 */
import { AppError } from '../errorHandling/AppError';
import { ErrorCategory, ErrorSeverity } from '../errorHandling/types';

export interface ValidationErrorDetails {
  field?: string;
  arrayIndex?: number;
  expectedType?: string;
  actualType?: string;
  allowedValues?: unknown[];
  actualValue?: unknown;
  recordField?: string;
  extraFields?: string[];
  allErrors?: ValidationError[];
  originalError?: unknown;
  path?: string;
  [key: string]: unknown;
}

export class ValidationError extends Error {
  /**
   * Additional details about the validation failure
   */
  readonly details: ValidationErrorDetails;

  constructor(message: string, details: ValidationErrorDetails = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;

    // This is needed to make instanceof work correctly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Get a user-friendly message about this error
   */
  toUserMessage(): string {
    const { field } = this.details;
    if (field) {
      return `Invalid value for ${field}: ${this.message}`;
    }
    return this.message;
  }

  /**
   * Convert to an AppError for consistent error handling
   */
  toAppError(): AppError {
    return new AppError(
      this.message,
      {
        severity: ErrorSeverity.WARNING,
        category: ErrorCategory.VALIDATION,
        userMessage: this.toUserMessage(),
        context: this.details
      },
      this
    );
  }

  /**
   * Create a ValidationError from an API error response
   */
  static fromApiError(apiError: any): ValidationError {
    // Handle API error formats from different sources
    if (apiError.validation?.errors) {
      // Handle validation errors with a list of field errors
      const firstError = apiError.validation.errors[0];
      return new ValidationError(
        firstError.message || 'Validation failed',
        {
          field: firstError.field,
          allErrors: apiError.validation.errors.map((err: any) => 
            new ValidationError(err.message, { field: err.field })
          )
        }
      );
    }
    
    // Generic API error
    return new ValidationError(
      apiError.message || 'API validation failed',
      { 
        apiError: apiError 
      }
    );
  }

  /**
   * Determine if an unknown error is a ValidationError
   */
  static isValidationError(error: unknown): error is ValidationError {
    return (
      error instanceof ValidationError ||
      (error instanceof Error && error.name === 'ValidationError')
    );
  }

  /**
   * Create schema-specific validation error
   */
  static schemaError(message: string, path?: string): ValidationError {
    return new ValidationError(`Schema validation failed: ${message}`, { 
      path 
    });
  }
}

/**
 * Helper to check if an error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return ValidationError.isValidationError(error);
}
