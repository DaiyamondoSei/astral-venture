
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

  /**
   * Create a new validation error
   * 
   * @param message Error message
   * @param details Additional error details
   */
  constructor(
    message: string, 
    details?: {
      field: string;
      expectedType?: string;
      rule?: string;
      metadata?: Record<string, unknown>;
      details?: string;
    }
  ) {
    super(message);
    this.name = 'ValidationError';
    this.field = details?.field || 'unknown';
    this.expectedType = details?.expectedType;
    this.rule = details?.rule;
    this.metadata = details?.metadata;
    this.details = details?.details;
    
    // This is needed for instanceof to work in ES5
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Convert validation error to string
   */
  toString(): string {
    return `ValidationError: ${this.message} (field: ${this.field}, expected: ${this.expectedType || 'valid value'})`;
  }
}

/**
 * Type guard to check if an error is a ValidationError
 * 
 * @param error Error to check
 * @returns Whether the error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export default ValidationError;
