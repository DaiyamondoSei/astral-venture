
/**
 * Error Display Utilities
 * 
 * Utilities for displaying and logging errors in a consistent way
 */

import { toast } from 'sonner';
import { ErrorCategory, ErrorSeverity } from './AppError';
import { isValidationError } from '../validation/ValidationError';

/**
 * Format validation details for display
 */
export function formatValidationDetails(error: unknown): string {
  if (isValidationError(error)) {
    if (error.details) {
      let details = '';
      if (typeof error.details === 'object') {
        const entries = Object.entries(error.details);
        details = entries.map(([key, value]) => `${key}: ${value}`).join(', ');
      }
      return details;
    }
    
    if (error.rule) {
      if (error.expectedType) {
        return `Expected ${error.expectedType}, got ${typeof error.value}`;
      }
      
      if (error.rule === 'minLength') {
        return 'Input is too short';
      }
      
      if (error.rule === 'maxLength') {
        return 'Input is too long';
      }
      
      return `Rule violation: ${error.rule}`;
    }
    
    return error.message;
  }
  
  return '';
}

/**
 * Display an error using toast notifications
 */
export function displayErrorToast(
  message: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  details?: string
): void {
  // Map severity to the appropriate toast function
  switch (severity) {
    case ErrorSeverity.DEBUG:
    case ErrorSeverity.INFO:
      toast.info(message, {
        description: details,
        duration: 3000
      });
      break;
      
    case ErrorSeverity.WARNING:
      toast.warning(message, {
        description: details,
        duration: 5000
      });
      break;
      
    case ErrorSeverity.CRITICAL:
      toast.error(message, {
        description: details,
        duration: 8000
      });
      break;
      
    case ErrorSeverity.ERROR:
    default:
      toast.error(message, {
        description: details,
        duration: 6000
      });
      break;
  }
}

/**
 * Log an error to the console with consistent formatting
 */
export function logErrorToConsole(
  error: unknown,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  category: ErrorCategory = ErrorCategory.UNEXPECTED,
  context?: string,
  metadata?: Record<string, unknown>
): void {
  // Format prefixes for the log message
  const severityPrefix = `[${severity.toUpperCase()}]`;
  const categoryPrefix = `[${category}]`;
  const contextPrefix = context ? `(${context})` : '';
  
  // Format the main message
  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Unknown error';
  }
  
  // Log with appropriate level and formatting
  const formattedMessage = `${severityPrefix} ${categoryPrefix} ${contextPrefix} ${message}`;
  
  switch (severity) {
    case ErrorSeverity.DEBUG:
      console.debug(formattedMessage, error, metadata);
      break;
      
    case ErrorSeverity.INFO:
      console.info(formattedMessage, error, metadata);
      break;
      
    case ErrorSeverity.WARNING:
      console.warn(formattedMessage, error, metadata);
      break;
      
    case ErrorSeverity.CRITICAL:
      console.error('%c' + formattedMessage, 'color: red; font-weight: bold', error, metadata);
      break;
      
    case ErrorSeverity.ERROR:
    default:
      console.error(formattedMessage, error, metadata);
      break;
  }
  
  // Log stack trace for Error objects
  if (error instanceof Error && error.stack) {
    console.groupCollapsed('Stack trace');
    console.log(error.stack);
    console.groupEnd();
  }
}

export default {
  formatValidationDetails,
  displayErrorToast,
  logErrorToConsole
};
