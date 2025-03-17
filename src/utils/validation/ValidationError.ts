
import { ValidationErrorDetail, ValidationErrorCode } from '@/types/core/validation/types';
import { ValidationErrorCodes, ErrorSeverities } from '@/types/core/validation/constants';

export interface ValidationErrorOptions {
  message?: string;
  code?: ValidationErrorCode;
  details?: ValidationErrorDetail[];
  path?: string;
  context?: Record<string, unknown>;
  statusCode?: number;
}

/**
 * ValidationError class for handling validation errors
 * Follows the structured error pattern with metadata
 */
export class ValidationError extends Error {
  public readonly details: ValidationErrorDetail[];
  public readonly code: ValidationErrorCode;
  public readonly path?: string;
  public readonly context?: Record<string, unknown>;
  public readonly statusCode?: number;
  public readonly field: string;
  public readonly expectedType?: string;

  constructor(options: ValidationErrorOptions = {}) {
    const message = options.message || 'Validation error occurred';
    super(message);
    
    this.name = 'ValidationError';
    this.code = options.code || ValidationErrorCodes.UNKNOWN_ERROR;
    this.details = options.details || [];
    this.path = options.path;
    this.field = options.path || '';
    this.context = options.context || {};
    this.statusCode = options.statusCode;
    
    // Support for Error cause in modern browsers
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Creates a ValidationError for a required field
   */
  static requiredError(path: string, message?: string): ValidationError {
    return new ValidationError({
      code: ValidationErrorCodes.REQUIRED,
      path,
      message: message || `'${path}' is required`,
      details: [{
        path,
        message: message || `'${path}' is required`,
        code: ValidationErrorCodes.REQUIRED,
        severity: ErrorSeverities.ERROR
      }]
    });
  }

  /**
   * Creates a ValidationError for a type error
   */
  static typeError(path: string, expectedType: string, message?: string): ValidationError {
    return new ValidationError({
      code: ValidationErrorCodes.TYPE_ERROR,
      path,
      message: message || `'${path}' must be a ${expectedType}`,
      details: [{
        path,
        message: message || `'${path}' must be a ${expectedType}`,
        code: ValidationErrorCodes.TYPE_ERROR,
        severity: ErrorSeverities.ERROR,
        metadata: { expectedType }
      }]
    });
  }

  /**
   * Creates a ValidationError for a format error
   */
  static formatError(path: string, format: string, message?: string): ValidationError {
    return new ValidationError({
      code: ValidationErrorCodes.FORMAT_ERROR,
      path,
      message: message || `'${path}' must be in the format: ${format}`,
      details: [{
        path,
        message: message || `'${path}' must be in the format: ${format}`,
        code: ValidationErrorCodes.FORMAT_ERROR,
        severity: ErrorSeverities.ERROR,
        metadata: { format }
      }]
    });
  }

  /**
   * Check if an error is a ValidationError
   */
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }

  /**
   * Get a human-readable formatted message
   */
  getFormattedMessage(): string {
    if (this.details.length === 0) {
      return this.message;
    }

    return this.details
      .map(detail => detail.message)
      .join('\n');
  }

  /**
   * Convert to a plain object for serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      path: this.path,
      context: this.context,
      statusCode: this.statusCode
    };
  }
}

// Export isValidationError function separately for easier imports
export const isValidationError = ValidationError.isValidationError;

export default ValidationError;
