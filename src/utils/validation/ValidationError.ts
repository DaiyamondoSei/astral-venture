
/**
 * Validation Error Class
 * 
 * A specialized error type for validation failures with detailed error information.
 */

import { ValidationErrorDetail } from './types';

export class ValidationError extends Error {
  public readonly details: ValidationErrorDetail[];
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly isOperational: boolean = true;
  
  // Legacy fields for backward compatibility
  public readonly field?: string;
  public readonly expectedType?: string;
  public readonly rule?: string;
  public readonly statusCode?: number;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    details: ValidationErrorDetail[] = [],
    code: string = 'VALIDATION_ERROR', 
    httpStatus: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
    
    // Normalize details to ensure all required fields exist
    this.details = details.map(detail => {
      const normalizedDetail: ValidationErrorDetail = {
        // Ensure path exists (use field as fallback)
        path: detail.path || detail.field || 'unknown',
        // Ensure message exists
        message: detail.message || 'Validation failed',
        // Copy all other properties
        ...detail,
        // Ensure field exists for backward compatibility
        field: detail.field || detail.path
      };
      return normalizedDetail;
    });
    
    this.code = code;
    this.httpStatus = httpStatus;
    this.statusCode = httpStatus;

    // Extract field, expectedType, and rule from first detail if available
    if (this.details && this.details.length > 0) {
      this.field = this.details[0].field || this.details[0].path;
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
      detail.path === field || detail.field === field
    );
  }

  /**
   * Get error message for a specific field
   */
  public getFieldError(field: string): string | undefined {
    const error = this.details.find(detail => 
      detail.path === field || detail.field === field
    );
    return error?.message;
  }

  /**
   * Factory method to create ValidationError from API response
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
          path: err.field || err.path || 'unknown',
          field: err.field || err.path || 'unknown',
          message: err.message || String(err),
          value: err.value,
          type: err.type,
          code: err.code,
          rule: err.rule,
          statusCode: statusCode
        })),
        apiError.code || 'VALIDATION_ERROR',
        statusCode
      );
    }
    
    return new ValidationError(
      apiError?.message || defaultMessage,
      [],
      apiError?.code || 'VALIDATION_ERROR',
      statusCode
    );
  }

  /**
   * Type guard to check if an error is a ValidationError
   */
  public static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }

  /**
   * Factory methods for common validation error types
   */
  static requiredError(field: string, message?: string): ValidationError {
    return new ValidationError(
      message || `${field} is required`,
      [{ 
        path: field, 
        field, 
        message: message || `${field} is required`, 
        rule: 'required',
        code: 'FIELD_REQUIRED'
      }]
    );
  }

  static typeError(field: string, expectedType: string, message?: string): ValidationError {
    return new ValidationError(
      message || `${field} must be a ${expectedType}`,
      [{ 
        path: field, 
        field, 
        message: message || `${field} must be a ${expectedType}`, 
        type: expectedType,
        rule: 'type',
        code: 'TYPE_ERROR'
      }]
    );
  }

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
        field, 
        message: message || defaultMessage, 
        rule: 'range',
        code: 'RANGE_ERROR'
      }]
    );
  }

  static formatError(field: string, format: string, message?: string): ValidationError {
    return new ValidationError(
      message || `${field} has invalid format`,
      [{ 
        path: field, 
        field, 
        message: message || `${field} has invalid format (expected: ${format})`, 
        rule: 'format',
        code: 'FORMAT_ERROR'
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
