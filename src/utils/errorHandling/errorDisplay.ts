
/**
 * Error Display Utilities
 * 
 * Utilities for displaying errors to the user and logging them to the console.
 */

import { toast } from 'sonner';
import { ErrorSeverity, ErrorCategory } from './types';
import { isValidationError, ValidationError } from '../validation/ValidationError';

/**
 * Display an error toast with the appropriate severity styling
 */
export function displayErrorToast(
  message: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  details?: string
): void {
  const options = {
    description: details,
    duration: getSeverityDuration(severity),
    className: getSeverityClass(severity),
  };

  switch (severity) {
    case ErrorSeverity.INFO:
      toast.info(message, options);
      break;
    case ErrorSeverity.WARNING:
      toast.warning(message, options);
      break;
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      toast.error(message, options);
      break;
    case ErrorSeverity.DEBUG:
    default:
      toast(message, options);
      break;
  }
}

/**
 * Log an error to the console with appropriate formatting
 */
export function logErrorToConsole(
  error: unknown,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  category: ErrorCategory = ErrorCategory.UNEXPECTED,
  context?: string,
  metadata?: Record<string, unknown>
): void {
  const prefix = `[${severity.toUpperCase()}][${category}]`;
  const contextStr = context ? ` (${context})` : '';
  const message = getErrorMessage(error);
  
  // Create a formatted message
  const formattedMessage = `${prefix}${contextStr}: ${message}`;
  
  // Determine logging level based on severity
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
    case ErrorSeverity.ERROR:
    default:
      console.error(formattedMessage, error, metadata);
      break;
  }
}

/**
 * Format validation error details for display
 */
export function formatValidationDetails(error: unknown): string | undefined {
  if (!isValidationError(error)) {
    return undefined;
  }
  
  return error.getFormattedMessage();
}

/**
 * Extract an error message from any error type
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return String(error);
}

/**
 * Get appropriate CSS class for severity level
 */
function getSeverityClass(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.INFO:
      return 'toast-info';
    case ErrorSeverity.WARNING:
      return 'toast-warning';
    case ErrorSeverity.ERROR:
      return 'toast-error';
    case ErrorSeverity.CRITICAL:
      return 'toast-critical';
    case ErrorSeverity.DEBUG:
    default:
      return 'toast-default';
  }
}

/**
 * Get appropriate duration for severity level
 */
function getSeverityDuration(severity: ErrorSeverity): number {
  switch (severity) {
    case ErrorSeverity.INFO:
      return 3000;
    case ErrorSeverity.WARNING:
      return 5000;
    case ErrorSeverity.ERROR:
      return 7000;
    case ErrorSeverity.CRITICAL:
      return 10000;
    case ErrorSeverity.DEBUG:
    default:
      return 5000;
  }
}

export default {
  displayErrorToast,
  logErrorToConsole,
  formatValidationDetails
};
