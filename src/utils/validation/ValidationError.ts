
/**
 * ValidationError class
 * 
 * A standardized error class for validation errors that provides
 * consistent error reporting across the application.
 */
import { ValidationErrorCodes, ErrorSeverities } from '@/types/core/validation/constants';
import type { ValidationErrorDetail, ValidationErrorCode, ErrorSeverity } from '@/types/core/validation/types';

export interface ValidationErrorOptions {
  field?: string;
  rule?: ValidationErrorCode;
  expectedType?: string;
  details?: Record<string, unknown>;
  severity?: ErrorSeverity;
  statusCode?: number;
}

/**
 * ValidationError represents an error that occurs during data validation
 */
export class ValidationError extends Error {
  /** The field that caused the validation error */
  field: string;
  
  /** The validation rule that failed */
  rule: ValidationErrorCode;
  
  /** Expected type for the field (when applicable) */
  expectedType?: string;
  
  /** Additional error details */
  details: Record<string, unknown>;
  
  /** Error severity level */
  severity: ErrorSeverity;
  
  /** HTTP status code (for API validation errors) */
  statusCode: number;

  constructor(message: string, options: ValidationErrorOptions = {}) {
    super(message);
    this.name = 'ValidationError';
    this.field = options.field || '';
    this.rule = options.rule || ValidationErrorCodes.UNKNOWN_ERROR;
    this.expectedType = options.expectedType;
    this.details = options.details || {};
    this.severity = options.severity || ErrorSeverities.ERROR;
    this.statusCode = options.statusCode || 400;
  }

  /**
   * Get a formatted message with field information
   */
  getFormattedMessage(): string {
    if (this.field) {
      return `${this.message} (Field: ${this.field})`;
    }
    return this.message;
  }

  /**
   * Get details suitable for UI display
   */
  getUIDetails(): Record<string, unknown> {
    return {
      field: this.field,
      message: this.message,
      rule: this.rule,
      ...(this.expectedType ? { expectedType: this.expectedType } : {}),
      ...this.details
    };
  }

  /**
   * Convert to ValidationErrorDetail for consistent error format
   */
  toValidationErrorDetail(path: string = this.field): ValidationErrorDetail {
    return {
      path,
      message: this.message,
      code: this.rule,
      severity: this.severity,
      field: this.field
    };
  }

  /**
   * Create ValidationError from API error
   */
  static fromApiError(error: unknown, field: string = ''): ValidationError {
    if (error instanceof ValidationError) {
      return error;
    }
    
    const message = error instanceof Error 
      ? error.message 
      : String(error);
    
    return new ValidationError(message, { 
      field,
      rule: ValidationErrorCodes.UNKNOWN_ERROR,
      severity: ErrorSeverities.ERROR
    });
  }

  /**
   * Type guard to check if an error is a ValidationError
   */
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Helper to create a validation error with the REQUIRED code
 */
export function createRequiredError(field: string, message?: string): ValidationError {
  return new ValidationError(
    message || `The field '${field}' is required`, 
    { field, rule: ValidationErrorCodes.REQUIRED }
  );
}

/**
 * Helper to create a validation error with the TYPE_ERROR code
 */
export function createTypeError(field: string, expectedType: string, message?: string): ValidationError {
  return new ValidationError(
    message || `The field '${field}' must be of type '${expectedType}'`,
    { field, rule: ValidationErrorCodes.TYPE_ERROR, expectedType }
  );
}
