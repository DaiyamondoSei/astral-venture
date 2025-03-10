
/**
 * Error Handling Types
 * 
 * This module defines the types used by the error handling system.
 */

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Error categories
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_PROCESSING = 'data_processing',
  USER_INPUT = 'user_input',
  PERFORMANCE = 'performance',
  UNEXPECTED = 'unexpected',
  RESOURCE = 'resource',
  VALIDATION = 'validation',
  USER_INTERFACE = 'user_interface',
  TYPE_ERROR = 'type_error',
  CONSTRAINT_ERROR = 'constraint_error'
}

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Error category */
  category?: ErrorCategory;
  /** Context where the error occurred */
  context?: string;
  /** Custom error message to display */
  customMessage?: string;
  /** Whether to show a toast notification */
  showToast?: boolean;
  /** Additional metadata for logging */
  metadata?: Record<string, unknown>;
  /** Optional callback for custom error handling */
  onError?: (error: unknown) => void;
  /** Whether to retry the operation */
  retry?: boolean;
  /** Optional retry count */
  retryCount?: number;
  /** Optional retry delay in milliseconds */
  retryDelay?: number;
  /** Whether to throw the error after handling */
  rethrow?: boolean;
  /** Whether this is a validation error */
  isValidation?: boolean;
  /** Whether to include validation details in toast */
  includeValidationDetails?: boolean;
  /** Whether to log the error to the console */
  logToConsole?: boolean;
  /** Whether to log the error to the server */
  logToServer?: boolean;
  /** Whether to capture the current user info in logs */
  captureUser?: boolean;
}
