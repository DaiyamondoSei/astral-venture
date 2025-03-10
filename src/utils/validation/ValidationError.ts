
/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  /** Field that failed validation */
  field: string;
  
  /** Value that failed validation */
  value: unknown;
  
  /** Type expected by the validation */
  expectedType?: string;
  
  /** Validation rule that failed */
  rule?: string;
  
  /** HTTP status code (for API validation errors) */
  statusCode?: number;
  
  /** Additional details about the validation error */
  details?: Record<string, unknown>;

  /**
   * Create a new validation error
   * 
   * @param message Error message
   * @param field Field name that failed validation
   * @param value Value that failed validation
   * @param options Additional error options
   */
  constructor(
    message: string,
    field: string = 'unknown',
    value: unknown = undefined,
    options: {
      expectedType?: string;
      rule?: string;
      statusCode?: number;
      details?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    
    // Set error name for better debugging
    this.name = 'ValidationError';
    
    // Set error properties
    this.field = field;
    this.value = value;
    this.expectedType = options.expectedType;
    this.rule = options.rule;
    this.statusCode = options.statusCode;
    this.details = options.details;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Create a type error validation error
   * 
   * @param field Field name
   * @param expectedType Expected type
   * @param actualValue Actual value
   * @returns New ValidationError instance
   */
  static createTypeError(field: string, expectedType: string, actualValue: unknown): ValidationError {
    const actualType = typeof actualValue;
    return new ValidationError(
      `${field} must be of type ${expectedType}, but got ${actualType}`,
      field,
      actualValue,
      {
        expectedType,
        rule: 'type',
        details: { actualType }
      }
    );
  }

  /**
   * Create a required field validation error
   * 
   * @param field Field name
   * @returns New ValidationError instance
   */
  static createRequiredError(field: string): ValidationError {
    return new ValidationError(
      `${field} is required`,
      field,
      undefined,
      {
        rule: 'required'
      }
    );
  }

  /**
   * Create a format validation error
   * 
   * @param field Field name
   * @param format Expected format
   * @param value Invalid value
   * @returns New ValidationError instance
   */
  static createFormatError(field: string, format: string, value: unknown): ValidationError {
    return new ValidationError(
      `${field} must be in ${format} format`,
      field,
      value,
      {
        rule: 'format',
        details: { format }
      }
    );
  }

  /**
   * Create a range validation error
   * 
   * @param field Field name
   * @param min Minimum value
   * @param max Maximum value
   * @param value Invalid value
   * @returns New ValidationError instance
   */
  static createRangeError(field: string, min: number, max: number, value: unknown): ValidationError {
    return new ValidationError(
      `${field} must be between ${min} and ${max}`,
      field,
      value,
      {
        rule: 'range',
        details: { min, max }
      }
    );
  }

  /**
   * Get a string representation of the error
   * 
   * @returns Formatted error string
   */
  toString(): string {
    const parts = [
      `ValidationError: ${this.message}`,
      `Field: ${this.field}`,
    ];
    
    if (this.expectedType) {
      parts.push(`Expected Type: ${this.expectedType}`);
    }
    
    if (this.rule) {
      parts.push(`Rule: ${this.rule}`);
    }
    
    if (this.value !== undefined) {
      parts.push(`Value: ${typeof this.value === 'object' 
        ? JSON.stringify(this.value) 
        : String(this.value)}`);
    }
    
    return parts.join('\n');
  }
}

export default ValidationError;
