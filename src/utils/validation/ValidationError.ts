
/**
 * ValidationError class
 * 
 * A specialized error type for data validation failures that includes
 * structured information about the validation failure.
 */

export class ValidationError extends Error {
  public readonly field: string;
  public readonly code: string;
  public readonly value: unknown;
  
  constructor(
    message: string,
    field: string,
    code: string = 'invalid_value',
    value: unknown = undefined
  ) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
    this.value = value;
    
    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
  
  /**
   * Checks if an error is a ValidationError
   */
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
  
  /**
   * Creates a validation error for a missing required field
   */
  static requiredField(field: string): ValidationError {
    return new ValidationError(
      `The field '${field}' is required`,
      field,
      'required_field'
    );
  }
  
  /**
   * Creates a validation error for an invalid type
   */
  static invalidType(field: string, expectedType: string, value: unknown): ValidationError {
    return new ValidationError(
      `The field '${field}' must be a ${expectedType}`,
      field,
      'invalid_type',
      value
    );
  }
  
  /**
   * Creates a validation error for an invalid format
   */
  static invalidFormat(field: string, format: string, value: unknown): ValidationError {
    return new ValidationError(
      `The field '${field}' must be in ${format} format`,
      field,
      'invalid_format',
      value
    );
  }
  
  /**
   * Creates a validation error for a value out of range
   */
  static outOfRange(field: string, min: number | null, max: number | null, value: unknown): ValidationError {
    const rangeDesc = min !== null && max !== null
      ? `between ${min} and ${max}`
      : min !== null
        ? `greater than or equal to ${min}`
        : `less than or equal to ${max}`;
    
    return new ValidationError(
      `The field '${field}' must be ${rangeDesc}`,
      field,
      'out_of_range',
      value
    );
  }
  
  /**
   * Creates a validation error for an invalid string length
   */
  static invalidLength(field: string, minLength: number | null, maxLength: number | null, value: unknown): ValidationError {
    const lengthDesc = minLength !== null && maxLength !== null
      ? `between ${minLength} and ${maxLength} characters`
      : minLength !== null
        ? `at least ${minLength} characters`
        : `at most ${maxLength} characters`;
    
    return new ValidationError(
      `The field '${field}' must be ${lengthDesc}`,
      field,
      'invalid_length',
      value
    );
  }
}

export default ValidationError;
