
/**
 * Validation Error Class
 * 
 * A specialized error type for validation failures with detailed error information.
 * This class extends the standard Error class with validation-specific properties.
 */

import { ValidationErrorDetail, ValidationErrorCode, ValidationSeverity } from '../../types/core';

/**
 * ValidationError represents a validation failure with detailed context
 */
export class ValidationError extends Error {
  /** Detailed information about the validation error(s) */
  public readonly details: ValidationErrorDetail[];
  
  /** Error code for programmatic handling */
  public readonly code: string;
  
  /** HTTP status code for API responses */
  public readonly httpStatus: number;
  
  /** Flag indicating this is an expected operational error */
  public readonly isOperational: boolean = true;
  
  // Legacy fields for backward compatibility
  public readonly field?: string;
  public readonly expectedType?: string;
  public readonly rule?: string;
  public readonly statusCode?: number;
  public readonly originalError?: unknown;

  /**
   * Create a new ValidationError
   * 
   * @param message - Human-readable error message
   * @param details - Array of validation error details
   * @param code - Error code for programmatic handling
   * @param httpStatus - HTTP status code for API responses
   */
  constructor(
    message: string,
    details: ValidationErrorDetail[] = [],
    code: string = ValidationErrorCode.UNKNOWN_ERROR, 
    httpStatus: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
    
    // Normalize details to ensure all required fields exist
    this.details = details.map(detail => {
      const normalizedDetail: ValidationErrorDetail = {
        // Ensure path exists (use field as fallback)
        path: detail.path || 'unknown',
        // Ensure message exists
        message: detail.message || 'Validation failed',
        // Copy all other properties
        ...detail,
        // Ensure severity is set
        severity: detail.severity || ValidationSeverity.ERROR
      };
      return normalizedDetail;
    });
    
    this.code = code;
    this.httpStatus = httpStatus;
    this.statusCode = httpStatus;

    // Extract field, expectedType, and rule from first detail if available
    if (this.details && this.details.length > 0) {
      this.field = this.details[0].path;
      this.expectedType = this.details[0].type;
      this.rule = this.details[0].rule;
    }

    // This is needed to make instanceof work correctly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Create a user-friendly message from the validation details
   */
  public getFormattedMessage(): string {
    if (!this.details || this.details.length === 0) {
      return this.message;
    }

    return this.details
      .map(detail => `${detail.path}: ${detail.message}`)
      .join('\n');
  }

  /**
   * Get validation details formatted for UI display
   */
  public getUIDetails(): Record<string, string> {
    if (!this.details || this.details.length === 0) {
      return {};
    }

    return this.details.reduce((acc, detail) => {
      acc[detail.path] = detail.message;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Check if there are validation errors for a specific field
   */
  public hasErrorForField(field: string): boolean {
    return this.details.some(detail => 
      detail.path === field
    );
  }

  /**
   * Get error message for a specific field
   */
  public getFieldError(field: string): string | undefined {
    const error = this.details.find(detail => 
      detail.path === field
    );
    return error?.message;
  }

  /**
   * Factory method to create ValidationError from API response
   * 
   * @param apiError - Error object from API response
   * @param defaultMessage - Default message if not found in apiError
   * @param statusCode - HTTP status code
   */
  public static fromApiError(
    apiError: any, 
    defaultMessage = 'Validation failed',
    statusCode = 400
  ): ValidationError {
    // Handle different API error formats
    if (apiError?.errors && Array.isArray(apiError.errors)) {
      return new ValidationError(
        apiError.message || defaultMessage,
        apiError.errors.map((err: any) => ({
          path: err.path || 'unknown',
          message: err.message || String(err),
          value: err.value,
          type: err.type,
          code: err.code,
          rule: err.rule,
          severity: err.severity || ValidationSeverity.ERROR
        })),
        apiError.code || ValidationErrorCode.UNKNOWN_ERROR,
        statusCode
      );
    }
    
    return new ValidationError(
      apiError?.message || defaultMessage,
      [],
      apiError?.code || ValidationErrorCode.UNKNOWN_ERROR,
      statusCode
    );
  }

  /**
   * Type guard to check if an error is a ValidationError
   */
  public static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
  
  // Factory methods for common validation error types
  
  /**
   * Create an error for a required field
   */
  static requiredError(field: string, message?: string): ValidationError {
    return new ValidationError(
      message || `${field} is required`,
      [{ 
        path: field, 
        message: message || `${field} is required`, 
        rule: 'required',
        code: ValidationErrorCode.REQUIRED
      }]
    );
  }

  /**
   * Create an error for a type mismatch
   */
  static typeError(field: string, expectedType: string, message?: string): ValidationError {
    return new ValidationError(
      message || `${field} must be a ${expectedType}`,
      [{ 
        path: field, 
        message: message || `${field} must be a ${expectedType}`, 
        type: expectedType,
        rule: 'type',
        code: ValidationErrorCode.TYPE_ERROR
      }]
    );
  }

  /**
   * Create an error for a value out of range
   */
  static rangeError(field: string, min?: number, max?: number, message?: string): ValidationError {
    let defaultMessage = `${field} is out of range`;
    if (min !== undefined && max !== undefined) {
      defaultMessage = `${field} must be between ${min} and ${max}`;
    } else if (min !== undefined) {
      defaultMessage = `${field} must be at least ${min}`;
    } else if (max !== undefined) {
      defaultMessage = `${field} must be at most ${max}`;
    }

    return new ValidationError(
      message || defaultMessage,
      [{ 
        path: field, 
        message: message || defaultMessage, 
        rule: 'range',
        code: ValidationErrorCode.RANGE_ERROR
      }]
    );
  }

  /**
   * Create an error for an invalid format
   */
  static formatError(field: string, format: string, message?: string): ValidationError {
    return new ValidationError(
      message || `${field} has invalid format`,
      [{ 
        path: field, 
        message: message || `${field} has invalid format (expected: ${format})`, 
        rule: 'format',
        code: ValidationErrorCode.FORMAT_ERROR
      }]
    );
  }
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export default ValidationError;
