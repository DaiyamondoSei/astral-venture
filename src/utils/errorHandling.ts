
import { toast } from '@/components/ui/use-toast';

/**
 * Error severity levels for different types of errors
 */
export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Options for error handling configuration
 */
export interface ErrorHandlingOptions {
  /** Context where the error occurred for better tracking */
  context: string;
  /** Whether to show a toast notification to the user */
  showToast?: boolean;
  /** Severity level of the error */
  severity?: ErrorSeverity;
  /** Custom error message to display instead of the original one */
  customMessage?: string;
  /** Whether to include the stack trace in the console output */
  includeStack?: boolean;
}

/**
 * Centralized error handler for consistent error handling across the application
 * @param error The error object or message string
 * @param options Options for handling the error or a string representing the context
 */
export const handleError = (
  error: unknown,
  options: ErrorHandlingOptions | string
): void => {
  // Normalize options
  const opts: ErrorHandlingOptions = typeof options === 'string' 
    ? { context: options } 
    : options;
  
  const {
    context,
    showToast = true,
    severity = ErrorSeverity.ERROR,
    customMessage,
    includeStack = true,
  } = opts;

  // Extract error details
  let errorMessage = 'An unknown error occurred';
  let errorStack = '';

  if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error !== null && typeof error === 'object') {
    errorMessage = String(error);
  }

  // Use custom message if provided
  const displayMessage = customMessage || errorMessage;

  // Log to console based on severity
  const prefix = `[${severity.toUpperCase()}] Error in ${context}:`;
  
  switch (severity) {
    case ErrorSeverity.WARNING:
      console.warn(prefix, includeStack && error instanceof Error ? error : errorMessage);
      break;
    case ErrorSeverity.INFO:
      console.info(prefix, includeStack && error instanceof Error ? error : errorMessage);
      break;
    default:
      console.error(prefix, includeStack && error instanceof Error ? error : errorMessage);
  }

  // Show toast notification if enabled
  if (showToast) {
    // Truncate long error messages for toast
    const truncatedMessage = displayMessage.length > 100 
      ? `${displayMessage.substring(0, 100)}...` 
      : displayMessage;
    
    toast({
      title: `Error in ${context}`,
      description: truncatedMessage,
      variant: severity === ErrorSeverity.ERROR ? 'destructive' : 'default',
      duration: 5000,
    });
  }
};

/**
 * Create a safe async function that handles errors internally
 * @param fn The async function to wrap
 * @param options Error handling options or context string
 * @returns A wrapped function that catches errors
 */
export const createSafeAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: ErrorHandlingOptions | string,
  fallbackValue: ReturnType<T> | null = null
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null> => {
  // Normalize options
  const opts: ErrorHandlingOptions & { 
    retry?: () => Promise<void>; 
    maxRetries?: number; 
  } = typeof options === 'string' ? { context: options } : { ...options };

  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Try to retry the operation if configured
      if (opts.retry && opts.maxRetries && opts.maxRetries > 0) {
        let retryCount = 0;
        
        while (retryCount < opts.maxRetries) {
          try {
            retryCount++;
            // Wait for retry operation (e.g., refreshing tokens)
            await opts.retry();
            // Try the original function again
            return await fn(...args);
          } catch (retryError) {
            // Last retry failed, give up
            if (retryCount >= opts.maxRetries) {
              handleError(error, opts);
              return fallbackValue;
            }
          }
        }
      }
      
      handleError(error, opts);
      return fallbackValue;
    }
  };
};

/**
 * Create a safe synchronous function that handles errors internally
 * @param fn The function to wrap
 * @param options Error handling options or context string
 * @returns A wrapped function that catches errors
 */
export const createSafeFunction = <T extends (...args: any[]) => any>(
  fn: T,
  options: ErrorHandlingOptions | string,
  fallbackValue: ReturnType<T> | null = null
): (...args: Parameters<T>) => ReturnType<T> | null => {
  return (...args: Parameters<T>): ReturnType<T> | null => {
    try {
      return fn(...args);
    } catch (error) {
      handleError(error, options);
      return fallbackValue;
    }
  };
};
