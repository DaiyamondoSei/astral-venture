
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
    details: {
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
    this.field = details.field;
    this.expectedType = details.expectedType;
    this.rule = details.rule;
    this.metadata = details.metadata;
    this.details = details.details;
    this.statusCode = details.statusCode;
    this.originalError = details.originalError;
    
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

  /**
   * Create a type error for when a value doesn't match the expected type
   */
  static typeError(value: unknown, expectedType: string, field: string): ValidationError {
    return new ValidationError(
      `Expected ${field} to be of type ${expectedType}, but received ${typeof value}`,
      {
        field,
        expectedType,
        rule: 'type-check'
      }
    );
  }

  /**
   * Create a constraint error for when a value doesn't meet specific constraints
   */
  static constraintError(field: string, constraint: string, details?: string): ValidationError {
    return new ValidationError(
      `${field} failed constraint: ${constraint}${details ? ` (${details})` : ''}`,
      {
        field,
        rule: constraint,
        details
      }
    );
  }

  /**
   * Create a required field error
   */
  static requiredError(field: string): ValidationError {
    return new ValidationError(
      `${field} is required but was not provided`,
      {
        field,
        rule: 'required'
      }
    );
  }

  /**
   * Create a schema validation error for object validation failures
   */
  static schemaError(field: string, errors: Record<string, string>): ValidationError {
    return new ValidationError(
      `${field} failed schema validation`,
      {
        field,
        rule: 'schema',
        details: JSON.stringify(errors),
        metadata: { validationErrors: errors }
      }
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
