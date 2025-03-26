
/**
 * ValidationError
 * 
 * A specialized error class for validation failures with support
 * for structured error details.
 */
import { ValidationErrorDetail, ValidationErrorCode, ValidationSeverity } from '@/types/core/validation/types';
import { ValidationErrorCodes, ErrorSeverities } from '@/types/core/validation/constants';

export class ValidationError extends Error {
  /** Field or path that failed validation */
  field: string;
  
  /** Validation rule that failed */
  rule?: string;
  
  /** Validation error code */
  code?: ValidationErrorCode;
  
  /** Error severity */
  severity?: ValidationSeverity;
  
  /** Detailed error information */
  details?: ValidationErrorDetail[];
  
  /** Expected type (for type errors) */
  expectedType?: string;
  
  /** Original error */
  originalError?: unknown;
  
  constructor(
    message: string, 
    fieldOrDetails?: string | ValidationErrorDetail[], 
    rule?: string,
    code: ValidationErrorCode = ValidationErrorCodes.VALIDATION_FAILED
  ) {
    super(message);
    this.name = 'ValidationError';
    
    if (typeof fieldOrDetails === 'string') {
      this.field = fieldOrDetails;
      this.details = [{
        path: fieldOrDetails,
        message: message,
        rule: rule,
        code: code,
        severity: ErrorSeverities.ERROR
      }];
    } else if (Array.isArray(fieldOrDetails)) {
      this.field = fieldOrDetails[0]?.path || 'unknown';
      this.details = fieldOrDetails;
    } else {
      this.field = 'unknown';
      this.details = [{
        path: 'unknown',
        message: message,
        code: code,
        severity: ErrorSeverities.ERROR
      }];
    }
    
    this.rule = rule;
    this.code = code;
    this.severity = ErrorSeverities.ERROR;
    
    // Required for extending Error in TypeScript
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  /**
   * Get a simplified UI-friendly representation of the errors
   */
  getUIDetails(): Record<string, string> {
    if (!this.details) return { [this.field]: this.message };
    
    const result: Record<string, string> = {};
    this.details.forEach(detail => {
      result[detail.path] = detail.message;
    });
    return result;
  }
  
  /**
   * Static factory methods for common validation errors
   */
  static requiredError(field: string, customMessage?: string): ValidationError {
    const message = customMessage || `${field} is required`;
    return new ValidationError(message, field, 'required', ValidationErrorCodes.REQUIRED);
  }
  
  static typeError(field: string, expectedType: string, customMessage?: string): ValidationError {
    const message = customMessage || `${field} must be a ${expectedType}`;
    const error = new ValidationError(message, field, 'type', ValidationErrorCodes.TYPE_ERROR);
    error.expectedType = expectedType;
    return error;
  }
  
  static formatError(field: string, format: string, customMessage?: string): ValidationError {
    const message = customMessage || `${field} must be in ${format} format`;
    return new ValidationError(message, field, 'format', ValidationErrorCodes.FORMAT_ERROR);
  }
  
  static rangeError(field: string, range: string, customMessage?: string): ValidationError {
    const message = customMessage || `${field} must be ${range}`;
    return new ValidationError(message, field, 'range', ValidationErrorCodes.RANGE_ERROR);
  }
  
  static fromApiError(error: unknown, field?: string): ValidationError {
    const apiMessage = error instanceof Error ? error.message : String(error);
    const validationError = new ValidationError(
      `API error: ${apiMessage}`, 
      field || 'api', 
      'api', 
      ValidationErrorCodes.VALIDATION_FAILED
    );
    validationError.originalError = error;
    return validationError;
  }
  
  /**
   * Check if an error is a ValidationError
   */
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
}

/**
 * Check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return ValidationError.isValidationError(error);
}

export default ValidationError;
