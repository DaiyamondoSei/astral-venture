
/**
 * Custom error class for validation errors
 * Provides structured information about validation failures
 */
export class ValidationError extends Error {
  public severity: 'warning' | 'error' = 'error';
  public field?: string | string[];
  public expectedType?: string;
  public rule?: string;
  public details?: string;
  public statusCode?: number;
  public originalError?: unknown;
  public code: string = 'VALIDATION_FAILED';
  public metadata: Record<string, unknown> = {};

  constructor(message: string, options: ValidationErrorOptions = {}) {
    super(message);
    this.name = 'ValidationError';
    
    if (options.field) this.field = options.field;
    if (options.expectedType) this.expectedType = options.expectedType;
    if (options.rule) this.rule = options.rule;
    if (options.details) this.details = options.details;
    if (options.severity) this.severity = options.severity;
    if (options.statusCode) this.statusCode = options.statusCode;
    if (options.originalError) this.originalError = options.originalError;
    if (options.code) this.code = options.code;
    if (options.metadata) this.metadata = options.metadata;
  }

  /**
   * Create a new ValidationError for required field validation
   */
  static requiredError(field: string | string[]): ValidationError {
    return new ValidationError(
      `${Array.isArray(field) ? field.join(', ') : field} is required`,
      { field, rule: 'required' }
    );
  }

  /**
   * Create a new ValidationError for type validation
   */
  static typeError(field: string | string[], expectedType: string): ValidationError {
    return new ValidationError(
      `${Array.isArray(field) ? field.join(', ') : field} must be of type ${expectedType}`,
      { field, expectedType, rule: 'type' }
    );
  }

  /**
   * Create a new ValidationError for format validation
   */
  static formatError(field: string | string[], format: string): ValidationError {
    return new ValidationError(
      `${Array.isArray(field) ? field.join(', ') : field} must match format ${format}`,
      { field, rule: 'format' }
    );
  }

  /**
   * Create a new ValidationError for range validation
   */
  static rangeError(field: string | string[], min?: number, max?: number): ValidationError {
    let message = `${Array.isArray(field) ? field.join(', ') : field} must be`;
    if (min !== undefined) message += ` >= ${min}`;
    if (min !== undefined && max !== undefined) message += ' and';
    if (max !== undefined) message += ` <= ${max}`;
    
    return new ValidationError(message, { field, rule: 'range' });
  }

  /**
   * Create a new ValidationError for schema validation
   */
  static schemaError(message: string, details: string): ValidationError {
    return new ValidationError(message, { 
      rule: 'schema', 
      details
    });
  }

  /**
   * Create a new ValidationError from API error
   */
  static fromApiError(error: unknown, endpoint?: string): ValidationError {
    const message = error instanceof Error ? error.message : String(error);
    return new ValidationError(`API Error${endpoint ? ` (${endpoint})` : ''}: ${message}`, {
      originalError: error,
      rule: 'api',
      statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    });
  }

  /**
   * Convert error to a user-friendly message
   */
  toUserMessage(): string {
    return this.message;
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): Record<string, any> {
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
   * Check if an error is a ValidationError
   */
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
}

/**
 * Options for creating a ValidationError
 */
export interface ValidationErrorOptions {
  field?: string | string[];
  expectedType?: string;
  severity?: 'warning' | 'error';
  code?: string;
  statusCode?: number;
  originalError?: unknown;
  metadata?: Record<string, unknown>;
  details?: string;
  rule?: string;
}

export default ValidationError;
