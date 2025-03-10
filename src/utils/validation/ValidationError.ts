
/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  /** Field that failed validation */
  field: string;
  /** Type that was expected */
  expectedType?: string;
  /** Validation rule that failed */
  rule?: string;
  /** Additional metadata about the validation error */
  metadata?: Record<string, unknown>;
  /** Error details for displaying to the user */
  details?: string;
  /** HTTP status code for API responses */
  statusCode?: number;
  /** Original error if this is wrapping another error */
  originalError?: unknown;

  /**
   * Create a new validation error
   */
  constructor(
    message: string, 
    details?: {
      field: string;
      expectedType?: string;
      rule?: string;
      metadata?: Record<string, unknown>;
      details?: string;
      statusCode?: number;
      originalError?: unknown;
    }
  ) {
    super(message);
    this.name = 'ValidationError';
    this.field = details?.field || 'unknown';
    this.expectedType = details?.expectedType;
    this.rule = details?.rule;
    this.metadata = details?.metadata;
    this.details = details?.details;
    this.statusCode = details?.statusCode;
    this.originalError = details?.originalError;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  toString(): string {
    return `ValidationError: ${this.message} (field: ${this.field}, expected: ${this.expectedType || 'valid value'})`;
  }
  
  /**
   * Create a validation error for an API response
   */
  static fromApiError(message: string, statusCode: number, details?: any): ValidationError {
    return new ValidationError(message, {
      field: 'response',
      statusCode,
      details: details ? JSON.stringify(details) : undefined,
      metadata: { details }
    });
  }
  
  /**
   * Create a validation error for a specific validation rule
   */
  static fromRule(message: string, field: string, rule: string): ValidationError {
    return new ValidationError(message, {
      field,
      rule
    });
  }
  
  /**
   * Create a validation error that wraps an original error
   */
  static fromError(message: string, originalError: unknown, field: string = 'unknown'): ValidationError {
    return new ValidationError(message, {
      field,
      originalError,
      details: originalError instanceof Error ? originalError.message : String(originalError)
    });
  }
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export default ValidationError;
