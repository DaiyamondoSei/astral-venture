
/**
 * Base validation error class with core functionality
 */
export interface ValidationErrorOptions {
  field: string;
  expectedType?: string;
  rule?: string;
  metadata?: Record<string, unknown>;
  details?: string;
  statusCode?: number;
  originalError?: unknown;
  code?: string;
}

/**
 * Base class for all validation errors
 */
export class BaseValidationError extends Error {
  /** Field where validation failed */
  public field: string;
  
  /** Type that was expected */
  public expectedType?: string;
  
  /** Validation rule that failed */
  public rule?: string;
  
  /** Additional metadata for the error */
  public metadata?: Record<string, unknown>;
  
  /** Detailed explanation of the error */
  public details?: string;
  
  /** HTTP status code for API responses */
  public statusCode: number;
  
  /** Original error if this wraps another error */
  public originalError?: unknown;
  
  /** Error code for categorization */
  public code?: string;

  constructor(message: string, options: ValidationErrorOptions) {
    super(message);
    this.name = 'ValidationError';
    this.field = options.field;
    this.expectedType = options.expectedType;
    this.rule = options.rule;
    this.metadata = options.metadata;
    this.details = options.details;
    this.statusCode = options.statusCode || 400; // Default to Bad Request
    this.originalError = options.originalError;
    this.code = options.code || 'VALIDATION_ERROR';
    
    // This is necessary for proper instanceof checks in TypeScript with extending Error
    Object.setPrototypeOf(this, BaseValidationError.prototype);
  }
}

export default BaseValidationError;
