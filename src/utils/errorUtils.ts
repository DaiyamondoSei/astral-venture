
import { toast } from 'sonner';
import { ErrorCategory, ErrorSeverity, ErrorHandlingOptions } from './errorHandling';

/**
 * Standard error context options
 */
export interface ErrorContextOptions {
  /** Component or function name where error occurred */
  component?: string;
  /** Operation being performed when error occurred */
  operation?: string;
  /** User action that triggered the error */
  userAction?: string;
  /** Technical details for debugging */
  details?: Record<string, unknown>;
  /** Error category for classification */
  category?: ErrorCategory;
  /** Error severity level */
  severity?: ErrorSeverity;
}

/**
 * Creates a standardized error context string
 * 
 * @param options - Error context options
 * @returns Formatted error context string
 */
export function createErrorContext(options: ErrorContextOptions): string {
  const parts: string[] = [];
  
  if (options.component) {
    parts.push(options.component);
  }
  
  if (options.operation) {
    parts.push(options.operation);
  }
  
  if (options.userAction) {
    parts.push(`during ${options.userAction}`);
  }
  
  return parts.join(' - ');
}

/**
 * Converts error context options to error handling options
 * 
 * @param options - Error context options
 * @returns Error handling options
 */
export function createErrorOptions(options: ErrorContextOptions): ErrorHandlingOptions {
  return {
    context: createErrorContext(options),
    category: options.category,
    severity: options.severity,
    metadata: options.details,
    // Default to showing toast for errors and critical issues
    showToast: options.severity !== ErrorSeverity.INFO
  };
}

/**
 * Creates a standardized error with context
 * 
 * @param message - Error message
 * @param options - Error context options
 * @returns Error with enhanced properties
 */
export function createContextualError(
  message: string,
  options: ErrorContextOptions
): Error {
  const error = new Error(message);
  const context = createErrorContext(options);
  
  // Enhance error with additional properties
  Object.assign(error, {
    context,
    details: options.details,
    category: options.category,
    severity: options.severity
  });
  
  return error;
}

/**
 * Shows a user-friendly error message
 * 
 * @param message - User-friendly error message
 * @param options - Toast options
 */
export function showErrorMessage(
  message: string,
  options?: {
    description?: string;
    severity?: ErrorSeverity;
    action?: { label: string; onClick: () => void };
  }
): void {
  const toastType = options?.severity === ErrorSeverity.CRITICAL 
    ? 'error' 
    : options?.severity === ErrorSeverity.WARNING 
      ? 'warning' 
      : 'error';
  
  toast[toastType](message, {
    description: options?.description,
    action: options?.action && {
      label: options.action.label,
      onClick: options.action.onClick
    },
    position: 'bottom-right'
  });
}

/**
 * Extracts a user-friendly error message from various error types
 * 
 * @param error - The error to process
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
}

export default {
  createErrorContext,
  createErrorOptions,
  createContextualError,
  showErrorMessage,
  getUserFriendlyErrorMessage
};
