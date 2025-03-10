
/**
 * Application Error Class
 * 
 * Provides a standardized error structure for the application.
 */

import { ErrorSeverity, ErrorCategory } from './types';

export interface AppErrorOptions {
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  userMessage?: string;
  statusCode?: number;
  context?: Record<string, unknown>;
}

/**
 * Standard application error class that provides additional context
 * beyond the basic Error class.
 */
export class AppError extends Error {
  /** Severity level of the error */
  readonly severity: ErrorSeverity;
  
  /** Category of the error */
  readonly category: ErrorCategory;
  
  /** User-friendly error message */
  readonly userMessage: string;
  
  /** HTTP status code (if applicable) */
  readonly statusCode?: number;
  
  /** Additional context for debugging */
  readonly context?: Record<string, unknown>;
  
  /** Original error if this wraps another error */
  readonly originalError?: unknown;
  
  constructor(
    message: string,
    options: AppErrorOptions = {},
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.category = options.category || ErrorCategory.UNEXPECTED;
    this.userMessage = options.userMessage || 'An unexpected error occurred';
    this.statusCode = options.statusCode;
    this.context = options.context;
    this.originalError = originalError;
    
    // This is needed to make instanceof work correctly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Create an AppError from any error or error-like object
 */
export function createAppError(
  error: unknown,
  options: AppErrorOptions = {}
): AppError {
  // If it's already an AppError, just update options if provided
  if (error instanceof AppError) {
    return error;
  }
  
  // Extract message from different error types
  let message: string;
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    message = error.message;
  } else {
    message = String(error);
  }
  
  return new AppError(message, options, error);
}

export default AppError;
