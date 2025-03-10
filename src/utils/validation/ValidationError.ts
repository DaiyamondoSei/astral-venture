
/**
 * Validation Error Class
 * 
 * A specialized error type for validation failures with detailed error information.
 */

export interface ValidationErrorDetail {
  path: string;
  message: string;
  value?: any;
  type?: string;
}

export class ValidationError extends Error {
  public readonly details: ValidationErrorDetail[];
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly isOperational: boolean = true;

  constructor(
    message: string,
    details: ValidationErrorDetail[] = [],
    code: string = 'VALIDATION_ERROR', 
    httpStatus: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.code = code;
    this.httpStatus = httpStatus;

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
    return this.details.some(detail => detail.path === field);
  }

  /**
   * Get error message for a specific field
   */
  public getFieldError(field: string): string | undefined {
    const error = this.details.find(detail => detail.path === field);
    return error?.message;
  }

  /**
   * Factory method to create ValidationError from API response
   */
  public static fromApiError(
    apiError: any, 
    defaultMessage = 'Validation failed'
  ): ValidationError {
    // Handle different API error formats
    if (apiError?.errors && Array.isArray(apiError.errors)) {
      return new ValidationError(
        apiError.message || defaultMessage,
        apiError.errors.map((err: any) => ({
          path: err.field || err.path || 'unknown',
          message: err.message || String(err),
          value: err.value,
          type: err.type
        }))
      );
    }
    
    return new ValidationError(
      apiError?.message || defaultMessage,
      []
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
