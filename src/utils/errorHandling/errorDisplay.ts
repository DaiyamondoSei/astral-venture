
/**
 * Error Display Utilities
 * 
 * Utilities for displaying errors to users.
 */
import { ValidationError } from '@/utils/validation/ValidationError';
import { ErrorSeverity } from './types';
import { toast } from '@/components/ui/use-toast';

/**
 * Display a toast notification for an error
 */
export function displayErrorToast(
  message: string,
  severity: ErrorSeverity = 'error',
  details?: string
): void {
  const variant = getToastVariantFromSeverity(severity);
  
  toast({
    title: getToastTitleFromSeverity(severity),
    description: details ? `${message}: ${details}` : message,
    variant
  });
}

/**
 * Get toast variant from error severity
 */
function getToastVariantFromSeverity(severity: ErrorSeverity): 'default' | 'destructive' {
  switch (severity) {
    case 'error':
    case 'high':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Get toast title from error severity
 */
function getToastTitleFromSeverity(severity: ErrorSeverity): string {
  switch (severity) {
    case 'error':
    case 'high':
      return 'Error';
    case 'warning':
    case 'medium':
      return 'Warning';
    case 'info':
    case 'low':
      return 'Information';
    default:
      return 'Notification';
  }
}

/**
 * Format validation error details for display
 */
export function formatValidationDetails(error: ValidationError): string {
  if (Array.isArray(error.validationErrors) && error.validationErrors.length > 0) {
    return error.validationErrors.map(detail => detail.message).join(', ');
  }
  
  if (Array.isArray(error.details)) {
    return error.details.map(detail => detail.message).join(', ');
  }
  
  if (error.details && typeof error.details === 'string') {
    return error.details;
  }
  
  return error.message;
}

/**
 * Log error to console in a standardized format
 */
export function logErrorToConsole(
  error: unknown,
  severity: ErrorSeverity = 'error',
  category: string = 'unknown',
  context?: string,
  metadata?: Record<string, unknown>
): void {
  const logMethod = getConsoleMethodForSeverity(severity);
  
  // Log with context and category if available
  if (context) {
    console.groupCollapsed(`[${category.toUpperCase()}] Error in ${context}`);
  } else {
    console.groupCollapsed(`[${category.toUpperCase()}] Error`);
  }
  
  // Log the main error
  console[logMethod]('Error:', error);
  
  // Log metadata if provided
  if (metadata) {
    console[logMethod]('Metadata:', metadata);
  }
  
  // Log stack trace if available
  if (error instanceof Error && error.stack) {
    console[logMethod]('Stack trace:', error.stack);
  }
  
  console.groupEnd();
}

/**
 * Get the appropriate console method based on severity
 */
function getConsoleMethodForSeverity(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
  switch (severity) {
    case 'error':
    case 'high':
      return 'error';
    case 'warning':
    case 'medium':
      return 'warn';
    default:
      return 'info';
  }
}
