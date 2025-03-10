
import { toast } from '@/components/ui/use-toast';

export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface ErrorHandlingOptions {
  context?: string;
  severity?: ErrorSeverity;
  showToast?: boolean;
  truncateMessage?: boolean;
  stackTrace?: boolean;
  report?: boolean;
}

/**
 * Handle errors with consistent logging and UI feedback
 */
export function handleError(
  error: unknown,
  contextOrOptions: string | ErrorHandlingOptions
): void {
  // Process options
  const options: ErrorHandlingOptions = typeof contextOrOptions === 'string' 
    ? { context: contextOrOptions } 
    : contextOrOptions;
  
  const {
    context = 'Application',
    severity = ErrorSeverity.ERROR,
    showToast = true,
    truncateMessage = true,
    stackTrace = false,
    report = false
  } = options;
  
  // Extract error message
  let errorMessage = 'An unknown error occurred';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error !== null && typeof error === 'object') {
    errorMessage = String(error);
  }
  
  // Log error based on severity
  const logPrefix = `[${severity.toUpperCase()}] Error in ${context}:`;
  
  switch (severity) {
    case ErrorSeverity.WARNING:
      console.warn(logPrefix, error);
      break;
    case ErrorSeverity.INFO:
      console.info(logPrefix, error);
      break;
    default:
      console.error(logPrefix, error);
      if (stackTrace && error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
  }
  
  // Show toast notification if enabled
  if (showToast) {
    // Truncate very long error messages
    const displayMessage = truncateMessage && errorMessage.length > 100
      ? `${errorMessage.substring(0, 100)}...`
      : errorMessage;
    
    toast({
      title: `Error in ${context}`,
      description: displayMessage,
      variant: severity === ErrorSeverity.ERROR ? 'destructive' : 'default',
      duration: severity === ErrorSeverity.ERROR ? 5000 : 3000,
    });
  }
  
  // Report error to monitoring service if enabled
  if (report) {
    // Implementation for error reporting would go here
    // For example, sending to a monitoring service
  }
}

/**
 * Create a safe wrapper for async functions with error handling
 */
export function createSafeAsyncFunction<Args extends any[], Result>(
  fn: (...args: Args) => Promise<Result>,
  contextOrOptions: string | ErrorHandlingOptions & { 
    retry?: (error: Error, attempt: number) => Promise<void>, 
    maxRetries?: number
  }
): (...args: Args) => Promise<Result | null> {
  return async (...args: Args): Promise<Result | null> => {
    const options = typeof contextOrOptions === 'string' 
      ? { context: contextOrOptions } 
      : contextOrOptions;
    
    const { retry, maxRetries = 0 } = options;
    
    let attempt = 0;
    const maxAttempts = maxRetries + 1; // Initial attempt + retries
    
    while (attempt < maxAttempts) {
      try {
        return await fn(...args);
      } catch (error) {
        attempt++;
        
        if (attempt < maxAttempts && retry) {
          try {
            await retry(error instanceof Error ? error : new Error(String(error)), attempt);
          } catch (retryError) {
            handleError(retryError, {
              ...options,
              context: `${options.context || 'Function'} - Retry handler`
            });
            break; // Stop retrying if the retry function itself throws
          }
        } else {
          handleError(error, options);
          break;
        }
      }
    }
    
    return null;
  };
}

/**
 * Create a safe wrapper for synchronous functions with error handling
 */
export function createSafeFunction<Args extends any[], Result>(
  fn: (...args: Args) => Result,
  contextOrOptions: string | ErrorHandlingOptions
): (...args: Args) => Result | null {
  return (...args: Args): Result | null => {
    try {
      return fn(...args);
    } catch (error) {
      handleError(error, contextOrOptions);
      return null;
    }
  };
}

export default {
  handleError,
  createSafeAsyncFunction,
  createSafeFunction,
  ErrorSeverity
};
