
/**
 * Standard validation error class for consistent error handling across the application
 */
export enum ValidationErrorCode {
  // Basic validation error codes
  TYPE = 'type',
  FORMAT = 'format',
  REQUIRED = 'required',
  PATTERN = 'pattern',
  RANGE = 'range',
  LENGTH = 'length',
  VALIDATION_ERROR = 'validation_error',
  
  // Domain-specific error codes
  AUTH = 'auth',
  PERMISSION = 'permission',
  CONFIG = 'config',
  DATA = 'data',
  API = 'api',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

export interface ValidationErrorDetail {
  path: string;
  message: string;
  code?: ValidationErrorCode;
  rule?: string;
  severity: ValidationSeverity;
}

/**
 * Severity levels for validation errors
 */
export enum ValidationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Main validation error class
 */
export class ValidationError extends Error {
  path?: string;
  code?: string;
  details?: any;
  rule?: string;
  field?: string;
  expectedType?: string;
  statusCode?: number;
  originalError?: Error;

  constructor(
    message: string,
    detailsOrOptions?: 
      ValidationErrorDetail | 
      ValidationErrorDetail[] | 
      Record<string, any>,
    code?: string,
    statusCode?: number
  ) {
    super(message);
    
    // Set name explicitly for better error identification
    this.name = 'ValidationError';
    
    // Process details/options depending on what was passed
    if (Array.isArray(detailsOrOptions)) {
      this.details = detailsOrOptions;
    } else if (detailsOrOptions && typeof detailsOrOptions === 'object') {
      // Extract common properties
      this.field = detailsOrOptions.field || detailsOrOptions.path;
      this.path = detailsOrOptions.path || detailsOrOptions.field;
      this.rule = detailsOrOptions.rule || detailsOrOptions.code;
      this.code = code || detailsOrOptions.code || detailsOrOptions.rule;
      this.expectedType = detailsOrOptions.expectedType;
      this.statusCode = statusCode || detailsOrOptions.statusCode;
      this.details = detailsOrOptions;
    }
    
    // Ensure code is set
    if (!this.code) {
      this.code = code || ValidationErrorCode.VALIDATION_ERROR;
    }
  }

  /**
   * Create a validation error from a schema validation error
   */
  static schemaError(
    path: string,
    details: Record<string, string>
  ): ValidationError {
    return new ValidationError(
      `Schema validation failed at ${path}`,
      {
        path,
        details,
        rule: 'schema',
      }
    );
  }

  /**
   * Create a validation error from an API error
   */
  static fromApiError(
    message: string,
    statusCode?: number,
    details?: any
  ): ValidationError {
    return new ValidationError(
      message,
      {
        path: 'api',
        rule: 'api_error',
        details,
        statusCode,
        severity: ValidationSeverity.ERROR
      },
      ValidationErrorCode.API,
      statusCode
    );
  }

  /**
   * Check if an error is a ValidationError
   */
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError || 
      (error instanceof Error && error.name === 'ValidationError');
  }
}

/**
 * Check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return ValidationError.isValidationError(error);
}
