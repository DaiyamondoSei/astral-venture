
/**
 * Simple Validation Error Implementation
 */
export class ValidationError extends Error {
  /** Field that failed validation */
  field: string;
  
  /** Validation rule that failed */
  rule?: string;
  
  constructor(message: string, field: string, rule?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.rule = rule;
    
    // Required for extending Error in TypeScript
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  /**
   * Check if an error is a ValidationError
   */
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
}

/**
 * Check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return ValidationError.isValidationError(error);
}

export default ValidationError;
