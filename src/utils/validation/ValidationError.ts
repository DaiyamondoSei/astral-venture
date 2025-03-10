
/**
 * Specialized error for validation failures
 */

export enum ValidationSeverity {
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface ValidationErrorOptions {
  field?: string;
  value?: unknown;
  severity?: ValidationSeverity;
  code?: string;
  suggestedFix?: string;
  extraDetails?: Record<string, unknown>;
}

export class ValidationError extends Error {
  public readonly field?: string;
  public readonly value?: unknown;
  public readonly severity: ValidationSeverity;
  public readonly code?: string;
  public readonly suggestedFix?: string;
  public readonly extraDetails?: Record<string, unknown>;
  
  constructor(message: string, options: ValidationErrorOptions = {}) {
    super(message);
    
    this.name = 'ValidationError';
    this.field = options.field;
    this.value = options.value;
    this.severity = options.severity || ValidationSeverity.ERROR;
    this.code = options.code;
    this.suggestedFix = options.suggestedFix;
    this.extraDetails = options.extraDetails;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  /**
   * Convert to a user-friendly message
   */
  toUserMessage(): string {
    const fieldPrefix = this.field ? `${this.field}: ` : '';
    const suggestion = this.suggestedFix ? ` ${this.suggestedFix}` : '';
    
    return `${fieldPrefix}${this.message}${suggestion}`;
  }
  
  /**
   * Create a serializable object for logging or API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      field: this.field,
      severity: this.severity,
      code: this.code,
      suggestedFix: this.suggestedFix,
      extraDetails: this.extraDetails
    };
  }
  
  /**
   * Factory method for creating field-specific validation errors
   */
  static forField(
    field: string,
    message: string,
    options: Omit<ValidationErrorOptions, 'field'> = {}
  ): ValidationError {
    return new ValidationError(message, { ...options, field });
  }
  
  /**
   * Factory method for creating value-specific validation errors
   */
  static forValue(
    value: unknown,
    message: string,
    options: Omit<ValidationErrorOptions, 'value'> = {}
  ): ValidationError {
    return new ValidationError(message, { ...options, value });
  }
}
