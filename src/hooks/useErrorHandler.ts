
import { useState, useCallback } from 'react';
import { captureException } from '@/utils/errorHandling/errorReporter';

export interface ErrorHandlerOptions {
  captureException?: boolean;
  logToConsole?: boolean;
  rethrow?: boolean;
  componentName?: string;
  tags?: string[];
}

const defaultOptions: ErrorHandlerOptions = {
  captureException: true,
  logToConsole: true,
  rethrow: false,
};

/**
 * Hook to provide consistent error handling across the application
 * 
 * @param options Options for configuring error handling behavior
 */
export function useErrorHandler(options?: ErrorHandlerOptions) {
  const [error, setError] = useState<Error | null>(null);
  const [isHandlingError, setIsHandlingError] = useState(false);
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  const handleError = useCallback((err: unknown, context?: Record<string, unknown>) => {
    setIsHandlingError(true);
    
    // Convert to Error object if it's not one already
    const errorObject = err instanceof Error 
      ? err 
      : new Error(typeof err === 'string' ? err : 'An unknown error occurred');
    
    // Set the error state
    setError(errorObject);
    
    // Log to console if enabled
    if (mergedOptions.logToConsole) {
      console.error('Error handled by useErrorHandler:', errorObject, context);
    }
    
    // Report to error tracking service if enabled
    if (mergedOptions.captureException) {
      captureException(errorObject, undefined, {
        componentName: mergedOptions.componentName,
        additionalContext: context,
        tags: mergedOptions.tags,
      });
    }
    
    setIsHandlingError(false);
    
    // Re-throw if configured to do so
    if (mergedOptions.rethrow) {
      throw errorObject;
    }
    
    return errorObject;
  }, [
    mergedOptions.captureException,
    mergedOptions.componentName,
    mergedOptions.logToConsole,
    mergedOptions.rethrow,
    mergedOptions.tags
  ]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * Wrap an async function with error handling
   */
  const withErrorHandling = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: Record<string, unknown>
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      try {
        return await fn(...args);
      } catch (err) {
        handleError(err, {
          ...context,
          functionArgs: args,
        });
        throw err; // Re-throw to allow caller to handle if needed
      }
    };
  }, [handleError]);
  
  return {
    error,
    isHandlingError,
    handleError,
    clearError,
    withErrorHandling,
  };
}

export default useErrorHandler;
