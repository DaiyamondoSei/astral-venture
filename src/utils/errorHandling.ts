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

// Error deduplication cache
const recentErrors = new Map<string, {
  count: number;
  timestamp: number;
}>();

// Error sampling rate to reduce noise (0.0-1.0)
const ERROR_SAMPLING_RATE = 0.8;

// Deduplication window (in ms)
const ERROR_DEDUP_WINDOW = 5000;

/**
 * Enhanced utility function to handle errors consistently across the application
 * Optimized for performance with deduplication and sampling
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
  
  // Create error key for deduplication
  const errorKey = `${context}:${errorMessage}`;
  const now = Date.now();
  
  // Check for recent identical errors to avoid flooding
  const existingError = recentErrors.get(errorKey);
  if (existingError && (now - existingError.timestamp < ERROR_DEDUP_WINDOW)) {
    // Update count of duplicate errors
    existingError.count += 1;
    existingError.timestamp = now;
    
    // Skip further processing for duplicates
    console.log(`Duplicate error suppressed (${existingError.count} occurrences): ${errorKey}`);
    return;
  }
  
  // Apply random sampling to reduce volume of non-critical errors
  if (severity !== ErrorSeverity.CRITICAL && Math.random() > ERROR_SAMPLING_RATE) {
    console.log(`Error sampled out: ${errorKey}`);
    return;
  }
  
  // Add to recent errors list
  recentErrors.set(errorKey, {
    count: 1,
    timestamp: now
  });
  
  // Log error with context and severity
  const logMethod = severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.ERROR
    ? console.error
    : severity === ErrorSeverity.WARNING
      ? console.warn
      : console.info;
  
  logMethod(`[${severity.toUpperCase()}] Error in ${context}:`, error);
  
  // Report to analytics if enabled and not sampled out
  if (reportToAnalytics) {
    // This could be integrated with an actual analytics service
    console.info(`[Analytics] Reporting error: ${errorMessage} in ${context}`);
  }
  
  // Show toast if requested
  if (showToast) {
    const variant = severity === ErrorSeverity.INFO
      ? "default"
      : severity === ErrorSeverity.WARNING
        ? "default"
        : "destructive";
        
    toast({
      title: `Error in ${context}`,
      description: errorMessage.length > 100 
        ? `${errorMessage.substring(0, 100)}...` 
        : errorMessage,
      variant
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
    let lastError: any = null;
    
    while (true) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
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
        
        // Exponential backoff
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
        console.log(`Retrying ${context} in ${backoffTime}ms (attempt ${retryCount}/${maxRetries})...`);
        
        // Wait for backoff period
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
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

// Periodically clean up the error deduplication cache to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  recentErrors.forEach((value, key) => {
    if (now - value.timestamp > ERROR_DEDUP_WINDOW) {
      recentErrors.delete(key);
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} old error entries`);
  }
}, 60000); // Run every minute

// Add captureException function for use in other files
export function captureException(error: unknown, context: string): void {
  handleError(error, { context, reportToAnalytics: true });
}
