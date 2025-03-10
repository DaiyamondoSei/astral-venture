
/**
 * Custom error type for validation failures
 */
export class ValidationError extends Error {
  public expectedType?: string;
  public rule?: string;
  public statusCode: number;
  public details?: Record<string, unknown>;
  public field?: string;
  
  constructor(message: string, options?: { 
    expectedType?: string;
    rule?: string;
    statusCode?: number;
    details?: Record<string, unknown>;
    field?: string;
  }) {
    super(message);
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
    
    this.name = 'ValidationError';
    this.expectedType = options?.expectedType;
    this.rule = options?.rule;
    this.statusCode = options?.statusCode || 400;
    this.details = options?.details;
    this.field = options?.field;
  }
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export default ValidationError;
