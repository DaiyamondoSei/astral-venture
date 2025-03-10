
/**
 * Custom error class for validation failures
 * Provides detailed information about validation failures
 */
export class ValidationError extends Error {
  public readonly path: string;
  public readonly value: unknown;
  public readonly context?: Record<string, unknown>;
  public readonly code: string;

  /**
   * Create a new ValidationError
   * 
   * @param message - Error message
   * @param path - Path to the invalid property (e.g., 'user.email')
   * @param value - The invalid value
   * @param code - Error code for categorization
   * @param context - Additional context for the error
   */
  constructor(
    message: string,
    path: string,
    value: unknown,
    code: string = 'VALIDATION_ERROR',
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ValidationError';
    this.path = path;
    this.value = value;
    this.code = code;
    this.context = context;
    
    // Ensures proper instanceof checks work in ES6
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Creates a formatted string representation of the error
   */
  public toString(): string {
    return `ValidationError: ${this.message} (at ${this.path}, received: ${JSON.stringify(this.value)})`;
  }

  /**
   * Converts the error to a plain object for serialization
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      path: this.path,
      value: this.value,
      code: this.code,
      context: this.context,
    };
  }
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export default ValidationError;
