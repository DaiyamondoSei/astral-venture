
/**
 * Application Error Class
 * 
 * Provides a standardized error structure for the application.
 */

import { ValidationError } from '../validation/ValidationError';
import { ErrorCategory, ErrorSeverity } from './types';

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
    this.severity = options.severity || 'error';
    this.category = options.category || 'unknown';
    this.userMessage = options.userMessage || 'An unexpected error occurred';
    this.statusCode = options.statusCode;
    this.context = options.context;
    this.originalError = originalError;
    
    // This is needed to make instanceof work correctly
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert to a serializable object
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      severity: this.severity,
      category: this.category,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack
    };
  }

  /**
   * Create a user-friendly string representation
   */
  toUserString(): string {
    return this.userMessage;
  }

  /**
   * Create a debug string representation
   */
  toDebugString(): string {
    return `[${this.severity.toUpperCase()}] ${this.category}: ${this.message}`;
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
  let category = options.category;
  
  if (error instanceof ValidationError) {
    message = error.message;
    category = 'validation';
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    message = error.message;
  } else {
    message = String(error);
  }
  
  return new AppError(message, { ...options, category }, error);
}

export default AppError;
