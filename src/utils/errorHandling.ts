
import { toast } from '@/components/ui/use-toast';

/**
 * Error severity levels for categorizing errors
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Configuration options for error handling
 */
export interface ErrorHandlingOptions {
  context: string;
  showToast?: boolean;
  severity?: ErrorSeverity;
  retry?: () => Promise<any>;
  maxRetries?: number;
  reportToAnalytics?: boolean;
}

/**
 * Enhanced utility function to handle errors consistently across the application
 * 
 * @param error The error to handle
 * @param options Configuration options for handling the error
 */
export function handleError(
  error: unknown, 
  options: ErrorHandlingOptions | string
): void {
  // Convert string context to options object for backward compatibility
  const opts = typeof options === 'string' 
    ? { context: options, showToast: true } 
    : options;
  
  const { 
    context, 
    showToast = true, 
    severity = ErrorSeverity.ERROR,
    reportToAnalytics = true
  } = opts;
  
  let errorMessage = 'An unknown error occurred';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  // Log error with context and severity
  const logMethod = severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.ERROR
    ? console.error
    : severity === ErrorSeverity.WARNING
      ? console.warn
      : console.info;
  
  logMethod(`[${severity.toUpperCase()}] Error in ${context}:`, error);
  
  // Report to analytics if enabled
  if (reportToAnalytics) {
    // This could be integrated with an actual analytics service
    console.info(`[Analytics] Reporting error: ${errorMessage} in ${context}`);
  }
  
  // Show toast if requested
  if (showToast) {
    toast({
      title: `Error in ${context}`,
      description: errorMessage.length > 100 
        ? `${errorMessage.substring(0, 100)}...` 
        : errorMessage,
      variant: severity === ErrorSeverity.INFO 
        ? "default" 
        : severity === ErrorSeverity.WARNING 
          ? "default" 
          : "destructive"
    });
  }
}

/**
 * Creates a safe async function that handles errors according to configuration
 * and includes retry logic
 * 
 * @param fn The async function to wrap
 * @param options Configuration options for error handling
 * @returns The wrapped function with error handling and retries
 */
export function createSafeAsyncFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: ErrorHandlingOptions | string
): (...args: T) => Promise<R | null> {
  const opts = typeof options === 'string' 
    ? { context: options, showToast: true } 
    : options;
  
  return async (...args: T): Promise<R | null> => {
    const { 
      retry, 
      maxRetries = 1,
      context
    } = opts;
    
    let retryCount = 0;
    
    while (true) {
      try {
        return await fn(...args);
      } catch (error) {
        // If we've exhausted retries or no retry function is provided
        if (retryCount >= maxRetries || !retry) {
          handleError(error, {
            ...opts,
            context: `${context} (after ${retryCount} retries)`
          });
          return null;
        }
        
        // Increment retry counter
        retryCount++;
        
        console.log(`Retrying ${context} (attempt ${retryCount}/${maxRetries})...`);
        
        // Execute retry function
        try {
          await retry();
        } catch (retryError) {
          handleError(retryError, {
            ...opts,
            context: `${context} retry preparation`,
            showToast: false
          });
          return null;
        }
      }
    }
  };
}

/**
 * Creates a safe synchronous function that catches errors
 * 
 * @param fn The function to wrap
 * @param options Configuration options for error handling
 * @returns The wrapped function with error handling
 */
export function createSafeFunction<T extends any[], R>(
  fn: (...args: T) => R,
  options: ErrorHandlingOptions | string
): (...args: T) => R | null {
  const opts = typeof options === 'string' 
    ? { context: options, showToast: true } 
    : options;
  
  return (...args: T): R | null => {
    try {
      return fn(...args);
    } catch (error) {
      handleError(error, opts);
      return null;
    }
  };
}

// Add captureException function for use in other files
export function captureException(error: unknown, context: string): void {
  handleError(error, { context, reportToAnalytics: true });
}
