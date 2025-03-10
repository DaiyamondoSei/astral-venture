
import { toast } from 'sonner';
import { ErrorSeverity, ErrorCategory } from './errorHandling';

/**
 * Interface for error handling options
 */
export interface ErrorHandlingOptions {
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Error category */
  category?: ErrorCategory;
  /** Context where the error occurred */
  context?: string;
  /** Custom error message to display */
  customMessage?: string;
  /** Whether to show a toast notification */
  showToast?: boolean;
  /** Additional metadata for logging */
  metadata?: Record<string, unknown>;
  /** Optional callback for custom error handling */
  onError?: (error: unknown) => void;
  /** Whether to retry the operation */
  retry?: boolean;
  /** Optional retry count */
  retryCount?: number;
  /** Optional retry delay in milliseconds */
  retryDelay?: number;
}

/**
 * Display an error toast with consistent styling
 * 
 * @param message - Error message to display
 * @param description - Optional error description
 */
export function showErrorToast(message: string, description?: string): void {
  toast.error(message, {
    description,
    position: 'bottom-right',
    duration: 5000
  });
}

/**
 * Format error details for logging
 * 
 * @param error - The error object
 * @param context - Optional context information
 * @returns Formatted error details
 */
export function formatErrorDetails(error: unknown, context?: string): Record<string, unknown> {
  let errorMessage = 'Unknown error';
  let errorStack: string | undefined;
  const errorType = error instanceof Error ? error.constructor.name : typeof error;
  
  if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }
  
  return {
    errorType,
    errorMessage,
    errorStack,
    context,
    timestamp: new Date().toISOString()
  };
}

/**
 * Convert any value to a string for error reporting
 * 
 * @param value - The value to stringify
 * @returns String representation of the value
 */
export function safeStringify(value: unknown): string {
  try {
    if (typeof value === 'string') return value;
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'function') return '[Function]';
    if (typeof value === 'object') {
      return JSON.stringify(value, (key, val) => {
        if (typeof val === 'function') return '[Function]';
        if (val instanceof Error) return { message: val.message, stack: val.stack };
        return val;
      }, 2);
    }
    return String(value);
  } catch (e) {
    return '[Error during stringification]';
  }
}

/**
 * Check if an object is an HTTP response
 * 
 * @param obj - Object to check
 * @returns Whether the object is an HTTP response
 */
export function isResponse(obj: unknown): obj is Response {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'status' in obj &&
    'headers' in obj &&
    typeof (obj as Response).status === 'number' &&
    typeof (obj as Response).headers === 'object'
  );
}

/**
 * Extract details from a Response object for error reporting
 * 
 * @param response - The Response object
 * @returns Extracted response details
 */
export function extractResponseDetails(response: Response): Record<string, unknown> {
  return {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    headers: Object.fromEntries(response.headers.entries())
  };
}

/**
 * String representation of the current environment
 * Useful for debugging
 */
export function getEnvironmentInfo(): Record<string, unknown> {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString()
  };
}
