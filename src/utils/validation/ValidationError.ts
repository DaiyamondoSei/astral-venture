
/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  path?: string;
  value?: unknown;
  
  constructor(message: string, path?: string, value?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.path = path;
    this.value = value;
    
    // Ensures proper stack trace in modern JS engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Creates a validation error with formatted message
 * 
 * @param path - Path to the invalid field
 * @param message - Error message
 * @param value - Invalid value
 * @returns ValidationError instance
 */
export function createValidationError(
  path: string,
  message: string,
  value?: unknown
): ValidationError {
  const formattedMessage = path ? `${path}: ${message}` : message;
  return new ValidationError(formattedMessage, path, value);
}

/**
 * Type guard to check if an error is a ValidationError
 * 
 * @param error - Error to check
 * @returns True if error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}
