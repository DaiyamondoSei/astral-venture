
import { ValidationError } from '../validation/ValidationError';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',   // Application cannot continue functioning
  ERROR = 'error',         // Operation failed but app can continue
  WARNING = 'warning',     // Operation succeeded with issues
  INFO = 'info'            // Informational only
}

/**
 * Error categories for better organization and handling
 */
export enum ErrorCategory {
  VALIDATION = 'validation',    // Input validation errors
  API = 'api',                  // API communication errors
  AUTHENTICATION = 'auth',      // Authentication/authorization errors
  NETWORK = 'network',          // Network connectivity issues
  DATABASE = 'database',        // Database-related errors
  RENDERING = 'rendering',      // UI rendering errors
  BUSINESS_LOGIC = 'business',  // Business logic constraint violations
  UNKNOWN = 'unknown'           // Uncategorized errors
}

/**
 * Context information for better error tracking
 */
export interface ErrorContext {
  componentName?: string;       // Component where error occurred
  action?: string;              // Action being performed
  userId?: string;              // User ID if available
  metadata?: Record<string, unknown>; // Additional contextual data
  timestamp?: string;           // When the error occurred
}

/**
 * Common error type for the application
 */
export interface AppError {
  message: string;              // Human-readable error message
  originalError?: unknown;      // Original error object
  code?: string;                // Error code for programmatic handling
  severity: ErrorSeverity;      // How severe the error is
  category: ErrorCategory;      // What category the error belongs to
  context?: ErrorContext;       // Additional context
  field?: string;               // For validation errors, the field that failed
  recoverable: boolean;         // Whether the app can recover automatically
  userActionable: boolean;      // Whether the user can take action to fix
  suggestedAction?: string;     // Suggested action for the user
}

/**
 * Create an AppError from any error type
 */
export function createAppError(
  error: unknown, 
  options: Partial<AppError> = {}
): AppError {
  // Default values
  const defaultAppError: AppError = {
    message: 'An unexpected error occurred',
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.UNKNOWN,
    recoverable: false,
    userActionable: false,
    context: {
      timestamp: new Date().toISOString()
    }
  };

  // If it's already an AppError, just return it with any overrides
  if (isAppError(error)) {
    return { ...error, ...options };
  }

  // Handle ValidationError specially
  if (ValidationError.isValidationError(error)) {
    return {
      ...defaultAppError,
      message: error.message,
      code: error.code,
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.VALIDATION,
      field: error.field,
      originalError: error,
      recoverable: true,
      userActionable: true,
      suggestedAction: `Please check the ${error.field} field and try again`,
      ...options
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      ...defaultAppError,
      message: error.message,
      originalError: error,
      ...options
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      ...defaultAppError,
      message: error,
      ...options
    };
  }

  // Handle unknown error types
  return {
    ...defaultAppError,
    message: `Unknown error: ${String(error)}`,
    originalError: error,
    ...options
  };
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'severity' in error &&
    'category' in error &&
    'recoverable' in error &&
    'userActionable' in error
  );
}

/**
 * Extract user-friendly message from any error
 */
export function getUserErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  
  if (ValidationError.isValidationError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Create a validation-specific AppError
 */
export function createValidationError(
  field: string,
  message: string,
  options: Partial<AppError> = {}
): AppError {
  return {
    message,
    field,
    severity: ErrorSeverity.WARNING,
    category: ErrorCategory.VALIDATION,
    recoverable: true,
    userActionable: true,
    suggestedAction: `Please check the ${field} field and try again`,
    ...options
  };
}

/**
 * Create an API-specific AppError
 */
export function createApiError(
  message: string,
  originalError: unknown,
  options: Partial<AppError> = {}
): AppError {
  return {
    message,
    originalError,
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.API,
    recoverable: false,
    userActionable: false,
    suggestedAction: 'Please try again later',
    ...options
  };
}

/**
 * Create a network-specific AppError
 */
export function createNetworkError(
  message: string = 'Network connection issues',
  originalError?: unknown,
  options: Partial<AppError> = {}
): AppError {
  return {
    message,
    originalError,
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.NETWORK,
    recoverable: true,
    userActionable: true,
    suggestedAction: 'Please check your internet connection and try again',
    ...options
  };
}

/**
 * Create a permissions-specific AppError
 */
export function createPermissionError(
  message: string = 'You do not have permission to perform this action',
  options: Partial<AppError> = {}
): AppError {
  return {
    message,
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.AUTHENTICATION,
    recoverable: false,
    userActionable: false,
    ...options
  };
}
