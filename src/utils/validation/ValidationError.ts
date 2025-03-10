
/**
 * Custom error class for validation errors with improved type safety
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
  /** Error code for categorization */
  code?: string;

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
      code?: string;
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
    this.code = details.code;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  toString(): string {
    return `ValidationError: ${this.message} (field: ${this.field}, expected: ${this.expectedType || 'valid value'})`;
  }
  
  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    return this.details || this.message;
  }
  
  /**
   * Convert to a plain object for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      field: this.field,
      expectedType: this.expectedType,
      rule: this.rule,
      details: this.details,
      code: this.code,
      statusCode: this.statusCode
    };
  }
  
  /**
   * Create a validation error for an API response
   */
  static fromApiError(
    message: string, 
    statusCode: number, 
    details?: any,
    field: string = 'response'
  ): ValidationError {
    return new ValidationError(message, {
      field,
      statusCode,
      details: details ? JSON.stringify(details) : undefined,
      metadata: { details },
      code: 'API_ERROR'
    });
  }
  
  /**
   * Create a validation error for a specific validation rule
   */
  static fromRule(
    message: string, 
    field: string, 
    rule: string,
    code?: string
  ): ValidationError {
    return new ValidationError(message, {
      field,
      rule,
      code: code || `RULE_${rule.toUpperCase()}`
    });
  }
  
  /**
   * Create a validation error that wraps an original error
   */
  static fromError(
    message: string, 
    originalError: unknown, 
    field: string = 'unknown',
    code?: string
  ): ValidationError {
    return new ValidationError(message, {
      field,
      originalError,
      details: originalError instanceof Error ? originalError.message : String(originalError),
      code: code || 'WRAPPED_ERROR'
    });
  }

  /**
   * Create a type error for when a value doesn't match the expected type
   */
  static typeError(
    value: unknown, 
    expectedType: string, 
    field: string
  ): ValidationError {
    return new ValidationError(
      `Expected ${field} to be of type ${expectedType}, but received ${typeof value}`,
      {
        field,
        expectedType,
        rule: 'type-check',
        code: 'TYPE_ERROR'
      }
    );
  }

  /**
   * Create a constraint error for when a value doesn't meet specific constraints
   */
  static constraintError(
    field: string, 
    constraint: string, 
    details?: string
  ): ValidationError {
    return new ValidationError(
      `${field} failed constraint: ${constraint}${details ? ` (${details})` : ''}`,
      {
        field,
        rule: constraint,
        details,
        code: `CONSTRAINT_${constraint.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`
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
        rule: 'required',
        code: 'REQUIRED_FIELD'
      }
    );
  }

  /**
   * Create a schema validation error for object validation failures
   */
  static schemaError(
    field: string, 
    errors: Record<string, string>
  ): ValidationError {
    return new ValidationError(
      `${field} failed schema validation`,
      {
        field,
        rule: 'schema',
        details: JSON.stringify(errors),
        metadata: { validationErrors: errors },
        code: 'SCHEMA_ERROR'
      }
    );
  }
  
  /**
   * Create a format validation error
   */
  static formatError(
    field: string,
    format: string,
    providedValue?: string
  ): ValidationError {
    const detailPart = providedValue ? ` (provided: ${providedValue})` : '';
    return new ValidationError(
      `${field} must be in ${format} format${detailPart}`,
      {
        field,
        rule: 'format',
        details: `Must be in ${format} format`,
        code: `FORMAT_${format.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`
      }
    );
  }
  
  /**
   * Create a range validation error
   */
  static rangeError(
    field: string,
    min?: number,
    max?: number,
    actual?: number
  ): ValidationError {
    let rangeDescription = '';
    let code = 'RANGE';
    
    if (min !== undefined && max !== undefined) {
      rangeDescription = `between ${min} and ${max}`;
      code = 'RANGE_MIN_MAX';
    } else if (min !== undefined) {
      rangeDescription = `at least ${min}`;
      code = 'RANGE_MIN';
    } else if (max !== undefined) {
      rangeDescription = `at most ${max}`;
      code = 'RANGE_MAX';
    }
    
    const actualPart = actual !== undefined ? ` (provided: ${actual})` : '';
    
    return new ValidationError(
      `${field} must be ${rangeDescription}${actualPart}`,
      {
        field,
        rule: 'range',
        details: `Must be ${rangeDescription}`,
        code
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
