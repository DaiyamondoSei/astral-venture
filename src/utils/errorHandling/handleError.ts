
/**
 * Centralized Error Handler
 * 
 * This module provides a centralized error handling system for the application.
 */

import { ErrorHandlingOptions, ErrorSeverity, ErrorCategory } from './types';
import { determineErrorCategory, determineErrorSeverity, extractErrorMessage } from './errorClassification';
import { displayErrorToast, formatValidationDetails, logErrorToConsole } from './errorDisplay';
import { isValidationError } from '../validation/ValidationError';
import { AppError, createAppError } from './AppError';

/**
 * Default error handling options
 */
const defaultOptions: ErrorHandlingOptions = {
  showToast: true,
  logToConsole: true,
  logToServer: false,
  rethrow: false,
  captureUser: true
};

/**
 * Centralized error handler for consistent error handling across the app
 */
export function handleError(
  error: unknown,
  options: ErrorHandlingOptions | string = {}
): AppError {
  // Convert string context to options object
  const opts: ErrorHandlingOptions = typeof options === 'string' 
    ? { ...defaultOptions, context: options }
    : { ...defaultOptions, ...options };
  
  // Determine error category if not specified
  if (!opts.category) {
    opts.category = determineErrorCategory(error);
  }
  
  // Determine severity if not specified
  if (!opts.severity) {
    opts.severity = determineErrorSeverity(opts.category as ErrorCategory);
  }
  
  // Convert to AppError for consistent processing
  const appError = createAppError(error, { 
    context: opts.context,
    severity: opts.severity as any, // Type conversion between modules
    category: opts.category as any // Type conversion between modules
  });
  
  // Log to console if enabled
  if (opts.logToConsole) {
    logErrorToConsole(
      error,
      appError.severity as any, // Type conversion between modules
      appError.category as any, // Type conversion between modules
      typeof opts.context === 'string' ? opts.context : undefined,
      opts.metadata
    );
  }
  
  // Show toast notification if enabled
  if (opts.showToast) {
    const message = opts.customMessage || appError.userMessage;
    const details = opts.isValidation && opts.includeValidationDetails && isValidationError(error)
      ? formatValidationDetails(error)
      : typeof opts.context === 'string' 
        ? `Error in ${opts.context}` 
        : undefined;
    
    displayErrorToast(message, appError.severity as any, details);
  }
  
  // Log to server if enabled
  if (opts.logToServer) {
    try {
      logErrorToServer(appError);
    } catch (loggingError) {
      // Don't let logging errors cause more problems
      console.error('Error while logging error to server:', loggingError);
    }
  }
  
  // Call custom error handler if provided
  if (opts.onError) {
    try {
      opts.onError(appError);
    } catch (callbackError) {
      console.error('Error in onError callback:', callbackError);
    }
  }
  
  // Rethrow if requested
  if (opts.rethrow) {
    throw error;
  }
  
  return appError;
}

/**
 * Helper for handling validation errors consistently
 */
export function handleValidationError(
  error: unknown,
  options: ErrorHandlingOptions = {}
): AppError {
  return handleError(error, {
    showToast: true,
    logToServer: false, // Usually don't need to log validation errors to server
    rethrow: false,
    category: 'validation' as ErrorCategory,
    isValidation: true,
    includeValidationDetails: true,
    ...options
  });
}

/**
 * Helper for handling API errors consistently
 */
export function handleApiError(
  error: unknown,
  options: ErrorHandlingOptions = {}
): AppError {
  return handleError(error, {
    showToast: true,
    logToServer: true,
    rethrow: false,
    category: 'network' as ErrorCategory,
    ...options
  });
}

/**
 * Create a wrapped version of an async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: ErrorHandlingOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, options);
      throw error;
    }
  };
}

/**
 * Stub function for server-side error logging
 * This would be implemented with your actual backend service
 */
async function logErrorToServer(appError: AppError): Promise<void> {
  // In a real implementation, this would send the error to your backend
  // Just logging to console for now
  console.log('Would log to server:', appError);
}

export default {
  handleError,
  handleValidationError,
  handleApiError,
  withErrorHandling
};
