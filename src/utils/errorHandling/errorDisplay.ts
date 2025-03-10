
/**
 * Error Display Utilities
 * 
 * This module provides utilities for displaying errors to users.
 */

import { toast } from 'sonner';
import { ErrorSeverity } from './types';
import { isValidationError } from '../validation/ValidationError';

/**
 * Format validation details for display
 */
export function formatValidationDetails(error: unknown): string {
  if (!isValidationError(error)) {
    return '';
  }
  
  if (error.details) {
    return typeof error.details === 'string' 
      ? error.details 
      : JSON.stringify(error.details);
  }
  
  if (error.rule === 'type-check') {
    return `Expected ${error.expectedType}, received ${typeof error.value}`;
  }
  
  if (error.rule === 'required') {
    return 'This field is required';
  }
  
  if (error.rule?.includes('min')) {
    return `Value is below the minimum allowed`;
  }
  
  if (error.rule?.includes('max')) {
    return `Value exceeds the maximum allowed`;
  }
  
  return '';
}

/**
 * Display error toast notification
 */
export function displayErrorToast(
  message: string, 
  severity: ErrorSeverity,
  details?: string
): void {
  const toastType = severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.ERROR
    ? 'error'
    : severity === ErrorSeverity.WARNING
      ? 'warning'
      : 'info';
  
  toast[toastType](message, {
    description: details,
    position: 'bottom-right'
  });
}

/**
 * Log error to console with contextual information
 */
export function logErrorToConsole(
  error: unknown, 
  severity: ErrorSeverity,
  category: string,
  context?: string,
  metadata?: Record<string, unknown>
): void {
  const contextStr = context ? `(${context})` : '';
  
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      console.error(`[CRITICAL] [${category}] ${contextStr}`, error, metadata);
      break;
    case ErrorSeverity.ERROR:
      console.error(`[ERROR] [${category}] ${contextStr}`, error, metadata);
      break;
    case ErrorSeverity.WARNING:
      console.warn(`[WARNING] [${category}] ${contextStr}`, error, metadata);
      break;
    default:
      console.info(`[INFO] [${category}] ${contextStr}`, error, metadata);
  }
}
