
/**
 * Error Handling Types
 * 
 * This module defines the types used for standardized error handling
 * throughout the application.
 */

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  FATAL = 'fatal'
}

/**
 * Error categories for better organization and filtering
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA = 'data',
  RENDERING = 'rendering',
  PERFORMANCE = 'performance',
  UNEXPECTED = 'unexpected',
  USER_INPUT = 'user_input',
  RESOURCE = 'resource',
  INTEGRATION = 'integration',
  CONFIGURATION = 'configuration'
}

/**
 * Options for error handling
 */
export interface ErrorHandlingOptions {
  /**
   * Whether to show a toast notification to the user
   */
  showToast?: boolean;
  
  /**
   * Custom message to show in the toast notification
   */
  toastMessage?: string;
  
  /**
   * Whether to report the error to monitoring systems
   */
  reportError?: boolean;
  
  /**
   * Custom context data to include with the error report
   */
  context?: Record<string, unknown>;
  
  /**
   * Whether to throw the error (for propagation)
   */
  rethrow?: boolean;
  
  /**
   * Whether to include stack trace in logs
   */
  includeStack?: boolean;
  
  /**
   * Custom severity override
   */
  severity?: ErrorSeverity;
  
  /**
   * Custom category override
   */
  category?: ErrorCategory;
}

/**
 * Interface for error handlers that process specific error types
 */
export interface ErrorHandler {
  /**
   * Check if this handler can process the given error
   */
  canHandle(error: unknown): boolean;
  
  /**
   * Process the error and return a standardized AppError
   */
  handle(error: unknown, options?: ErrorHandlingOptions): Promise<any>;
}

/**
 * Error with HTTP status code
 */
export interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[] | null;
}

/**
 * Structured error response from API
 */
export interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: Record<string, unknown>;
  code?: string;
  status?: number;
  validation?: {
    errors?: Array<{
      field: string;
      message: string;
    }>;
  };
}
