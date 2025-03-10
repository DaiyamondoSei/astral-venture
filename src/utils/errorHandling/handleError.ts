
import { toast } from 'sonner';
import { AppError, ErrorSeverity, createAppError } from './AppError';
import { ValidationError } from '../validation/ValidationError';

/**
 * Error handling configuration options
 */
export interface ErrorHandlingOptions {
  showToast?: boolean;                 // Whether to show a toast notification
  logToConsole?: boolean;              // Whether to log to console
  logToServer?: boolean;               // Whether to log to server
  throwError?: boolean;                // Whether to rethrow the error
  context?: Record<string, unknown>;   // Additional context information
  captureUser?: boolean;               // Whether to capture user info in logs
  onError?: (error: AppError) => void; // Custom error handler callback
}

/**
 * Default error handling options
 */
const defaultOptions: ErrorHandlingOptions = {
  showToast: true,
  logToConsole: true,
  logToServer: true,
  throwError: false,
  captureUser: true
};

/**
 * Centralized error handler for consistent error handling across the app
 */
export async function handleError(
  error: unknown,
  options: ErrorHandlingOptions = {}
): Promise<AppError> {
  // Combine default options with provided options
  const opts = { ...defaultOptions, ...options };
  
  // Convert to AppError for consistent processing
  const appError = createAppError(error, { 
    context: { 
      ...opts.context,
      timestamp: new Date().toISOString() 
    } 
  });
  
  // Log to console if enabled
  if (opts.logToConsole) {
    const { severity } = appError;
    
    if (severity === ErrorSeverity.CRITICAL) {
      console.error('CRITICAL ERROR:', appError);
    } else if (severity === ErrorSeverity.ERROR) {
      console.error('ERROR:', appError);
    } else if (severity === ErrorSeverity.WARNING) {
      console.warn('WARNING:', appError);
    } else {
      console.info('INFO:', appError);
    }
  }
  
  // Show toast notification if enabled
  if (opts.showToast) {
    const { severity, message, suggestedAction } = appError;
    const toastMessage = suggestedAction 
      ? `${message} ${suggestedAction}`
      : message;
    
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.ERROR) {
      toast.error(toastMessage);
    } else if (severity === ErrorSeverity.WARNING) {
      toast.warning(toastMessage);
    } else {
      toast.info(toastMessage);
    }
  }
  
  // Log to server if enabled
  if (opts.logToServer) {
    try {
      // This would be implemented with your backend logging service
      // For now, we'll just stub this functionality
      await logErrorToServer(appError);
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
  if (opts.throwError) {
    throw appError;
  }
  
  return appError;
}

/**
 * Stub function for server-side error logging
 * This would be implemented with your actual backend service
 */
async function logErrorToServer(appError: AppError): Promise<void> {
  // This is a placeholder for actual server logging implementation
  // In a real app, this would send the error to your logging service
  console.log('Would log to server:', appError);
}

/**
 * Helper for handling validation errors consistently
 */
export function handleValidationError(
  error: ValidationError,
  options: ErrorHandlingOptions = {}
): AppError {
  return handleError(error, {
    showToast: true,
    logToServer: false, // Usually don't need to log validation errors to server
    throwError: false,
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
    throwError: false,
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
