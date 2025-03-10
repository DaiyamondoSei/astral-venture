
/**
 * Custom ValidationError class for consistent error handling
 */
export class ValidationError extends Error {
  public field: string | string[];
  public expectedType?: string;
  public rule?: string;
  public metadata?: Record<string, unknown>;
  public details?: string;
  public statusCode: number;
  public originalError?: Error;
  public code: string;

  constructor(
    message: string,
    options?: {
      field?: string | string[];
      expectedType?: string;
      rule?: string;
      metadata?: Record<string, unknown>;
      details?: string;
      statusCode?: number;
      originalError?: Error;
      code?: string;
    }
  ) {
    super(message);
    this.name = 'ValidationError';
    this.field = options?.field || '';
    this.expectedType = options?.expectedType;
    this.rule = options?.rule || '';
    this.metadata = options?.metadata;
    this.details = options?.details;
    this.statusCode = options?.statusCode || 400;
    this.originalError = options?.originalError;
    this.code = options?.code || 'VALIDATION_ERROR';
  }

  /**
   * Creates a validation error for a required field
   */
  static requiredError(field: string): ValidationError {
    return new ValidationError(`${field} is required`, {
      field,
      rule: 'required',
      code: 'REQUIRED_FIELD'
    });
  }

  /**
   * Creates a validation error for a type mismatch
   */
  static typeError(field: string, expectedType: string): ValidationError {
    return new ValidationError(
      `${field} must be of type ${expectedType}`,
      {
        field,
        expectedType,
        rule: 'type',
        code: 'TYPE_MISMATCH'
      }
    );
  }

  /**
   * Creates a validation error for a format validation failure
   */
  static formatError(field: string, format: string): ValidationError {
    return new ValidationError(
      `${field} must be a valid ${format} format`,
      {
        field,
        rule: 'format',
        code: 'FORMAT_INVALID'
      }
    );
  }

  /**
   * Creates a validation error from an API error
   */
  static fromApiError(error: unknown): ValidationError {
    if (error instanceof ValidationError) {
      return error;
    }
    
    const message = error instanceof Error ? error.message : String(error);
    return new ValidationError(message, {
      code: 'API_VALIDATION_ERROR',
      originalError: error instanceof Error ? error : undefined
    });
  }

  /**
   * Converts the error to a user-friendly message
   */
  toUserMessage(): string {
    return this.message;
  }
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}
