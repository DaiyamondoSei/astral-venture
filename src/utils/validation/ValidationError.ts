
/**
 * Enhanced validation error class with structured error details
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
 * Specialized error class for validation errors with improved structure and context
 */
export class ValidationError extends Error {
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
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Create an error for a required field that's missing
   */
  static requiredError(field: string): ValidationError {
    return new ValidationError(`${field} is required`, {
      field,
      rule: 'required',
      code: 'REQUIRED_FIELD'
    });
  }

  /**
   * Create an error for an incorrect type
   */
  static typeError(value: unknown, expectedType: string, field: string): ValidationError {
    return new ValidationError(
      `${field} must be a ${expectedType}, got ${typeof value}`,
      {
        field,
        expectedType,
        rule: 'type',
        details: `Received value: ${JSON.stringify(value)}`,
        code: 'INVALID_TYPE'
      }
    );
  }

  /**
   * Create an error for a value outside of allowed range
   */
  static rangeError(field: string, min?: number, max?: number, actual?: number): ValidationError {
    let message = `${field} is out of range`;
    let details = '';
    
    if (min !== undefined && max !== undefined) {
      message = `${field} must be between ${min} and ${max}`;
      details = `Allowed range: ${min}-${max}`;
    } else if (min !== undefined) {
      message = `${field} must be at least ${min}`;
      details = `Minimum allowed value: ${min}`;
    } else if (max !== undefined) {
      message = `${field} must be at most ${max}`;
      details = `Maximum allowed value: ${max}`;
    }
    
    if (actual !== undefined) {
      details += `, Actual value: ${actual}`;
    }
    
    return new ValidationError(message, {
      field,
      rule: 'range',
      details,
      code: 'OUT_OF_RANGE'
    });
  }

  /**
   * Create an error for an incorrect format
   */
  static formatError(field: string, format: string, value: string): ValidationError {
    return new ValidationError(
      `${field} has invalid format, expected ${format}`,
      {
        field,
        rule: 'format',
        details: `Invalid ${format} format: ${value}`,
        code: `INVALID_${format.toUpperCase()}_FORMAT`
      }
    );
  }

  /**
   * Create an error for a failed constraint
   */
  static constraintError(field: string, constraint: string, message: string): ValidationError {
    return new ValidationError(
      message,
      {
        field,
        rule: constraint,
        code: `CONSTRAINT_VIOLATION`
      }
    );
  }

  /**
   * Wrap an error from another source
   */
  static wrapError(error: unknown, field: string): ValidationError {
    const message = error instanceof Error ? error.message : String(error);
    
    return new ValidationError(
      `Error validating ${field}: ${message}`,
      {
        field,
        originalError: error,
        code: 'VALIDATION_ERROR'
      }
    );
  }
}

export default ValidationError;
