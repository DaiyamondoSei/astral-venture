
/**
 * Centralized error handling system
 * 
 * This module provides a consistent approach to error handling across the application,
 * with support for different error types, error tracking, and user-friendly messages.
 */

import { ValidationError } from '../validation/ValidationError';

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  API = 'api',
  DATABASE = 'database',
  UI = 'ui',
  RENDERING = 'rendering',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system'
}

// Error handler options
export interface ErrorHandlerOptions {
  shouldReport?: boolean;
  shouldLog?: boolean;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  context?: Record<string, unknown>;
  displayMessage?: string;
}

// Error context
export interface ErrorContext {
  timestamp: string;
  url: string;
  userAgent: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  additionalContext?: Record<string, unknown>;
}

/**
 * Structured application error with enhanced metadata
 */
export class AppError extends Error {
  public severity: ErrorSeverity;
  public category: ErrorCategory;
  public code?: string;
  public context?: Record<string, unknown>;
  public originalError?: unknown;
  public displayMessage: string;

  constructor(
    message: string, 
    {
      severity = ErrorSeverity.ERROR,
      category = ErrorCategory.SYSTEM,
      code,
      context,
      originalError,
      displayMessage
    }: {
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      code?: string;
      context?: Record<string, unknown>;
      originalError?: unknown;
      displayMessage?: string;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.severity = severity;
    this.category = category;
    this.code = code;
    this.context = context;
    this.originalError = originalError;
    this.displayMessage = displayMessage || 'An unexpected error occurred';
    
    // Ensure correct prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Get a user-friendly message suitable for display
   */
  getUserMessage(): string {
    return this.displayMessage;
  }

  /**
   * Create a network error
   */
  static network(message: string, originalError?: unknown): AppError {
    return new AppError(message, {
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.NETWORK,
      originalError,
      displayMessage: 'Network connection issue. Please check your internet connection and try again.'
    });
  }

  /**
   * Create an authentication error
   */
  static authentication(message: string, originalError?: unknown): AppError {
    return new AppError(message, {
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.AUTHENTICATION,
      originalError,
      displayMessage: 'Authentication error. Please sign in again.'
    });
  }

  /**
   * Create a validation error
   */
  static validation(message: string, originalError?: unknown): AppError {
    return new AppError(message, {
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.VALIDATION,
      originalError,
      displayMessage: 'Please check your input and try again.'
    });
  }

  /**
   * Create an API error
   */
  static api(message: string, statusCode?: number, originalError?: unknown): AppError {
    let displayMessage = 'Unable to complete the request. Please try again later.';
    
    if (statusCode) {
      if (statusCode === 404) {
        displayMessage = 'The requested resource was not found.';
      } else if (statusCode >= 500) {
        displayMessage = 'Server error. Our team has been notified.';
      }
    }
    
    return new AppError(message, {
      severity: statusCode && statusCode >= 500 ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
      category: ErrorCategory.API,
      context: { statusCode },
      originalError,
      displayMessage
    });
  }
}

/**
 * Process and handle errors in a standardized way
 */
export function handleError(
  error: unknown, 
  options: ErrorHandlerOptions = {}
): AppError {
  // Default options
  const {
    shouldReport = true,
    shouldLog = true,
    severity = ErrorSeverity.ERROR,
    category = ErrorCategory.SYSTEM,
    context = {},
    displayMessage
  } = options;
  
  // Create context information
  const errorContext: ErrorContext = {
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    severity,
    category,
    additionalContext: context
  };
  
  // Transform error to AppError
  let appError: AppError;
  
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof ValidationError) {
    appError = AppError.validation(error.message, error);
  } else if (error instanceof Error) {
    appError = new AppError(error.message, {
      severity,
      category,
      originalError: error,
      displayMessage
    });
  } else {
    appError = new AppError(
      typeof error === 'string' ? error : 'Unknown error occurred',
      {
        severity,
        category,
        originalError: error,
        displayMessage
      }
    );
  }
  
  // Log error if requested
  if (shouldLog) {
    console.error('[AppError]', appError.message, {
      severity: appError.severity,
      category: appError.category,
      originalError: appError.originalError,
      context: errorContext
    });
  }
  
  // Report error if requested
  if (shouldReport) {
    // Implement error reporting to your monitoring service here
    // This could be Sentry, LogRocket, or a custom backend endpoint
  }
  
  return appError;
}

/**
 * Extract a user-friendly message from an error
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.getUserMessage();
  }
  
  if (error instanceof ValidationError) {
    return `Validation error: ${error.message}`;
  }
  
  if (error instanceof Error) {
    // Filter out technical details from standard error messages
    return error.message.replace(/^Error: /, '');
  }
  
  return 'An unexpected error occurred';
}
