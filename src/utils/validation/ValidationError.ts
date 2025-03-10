
/**
 * Custom error class for validation errors
 * Provides standardized structure for validation failures
 */
export class ValidationError extends Error {
  public readonly field: string;
  public readonly value: unknown;
  public readonly constraint: string;
  public readonly code: string;

  constructor(
    message: string, 
    field: string = '', 
    value: unknown = undefined, 
    constraint: string = '', 
    code: string = 'VALIDATION_FAILED'
  ) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.constraint = constraint;
    this.code = code;

    // Ensures proper prototypal inheritance in transpiled JS
    // Necessary for instanceof checks to work properly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Create a validation error for a required field that's missing
   */
  static required(field: string): ValidationError {
    return new ValidationError(
      `${field} is required`,
      field,
      undefined,
      'required',
      'REQUIRED_FIELD'
    );
  }

  /**
   * Create a validation error for a field with invalid type
   */
  static invalidType(field: string, value: unknown, expectedType: string): ValidationError {
    return new ValidationError(
      `${field} should be a ${expectedType}`,
      field,
      value,
      `type:${expectedType}`,
      'INVALID_TYPE'
    );
  }

  /**
   * Create a validation error for a field that has an invalid value
   */
  static invalidValue(field: string, value: unknown, constraint: string): ValidationError {
    return new ValidationError(
      `${field} is invalid: ${constraint}`,
      field,
      value,
      constraint,
      'INVALID_VALUE'
    );
  }

  /**
   * Create a validation error for a field that fails enumeration validation
   */
  static invalidEnum(field: string, value: unknown, allowedValues: readonly unknown[]): ValidationError {
    const allowedValuesStr = Array.isArray(allowedValues) 
      ? allowedValues.map(v => `'${v}'`).join(', ')
      : String(allowedValues);
    
    return new ValidationError(
      `${field} must be one of: ${allowedValuesStr}`,
      field,
      value,
      `enum:${allowedValuesStr}`,
      'INVALID_ENUM'
    );
  }

  /**
   * Create a validation error for a general schema validation failure
   */
  static schemaValidation(field: string, value: unknown, details: string): ValidationError {
    return new ValidationError(
      `Schema validation failed for ${field}: ${details}`,
      field,
      value,
      details,
      'SCHEMA_VALIDATION'
    );
  }
}

export default ValidationError;
