import React from 'react';

/**
 * Enhanced error handling utility
 * Provides standardized error handling with better debugging support
 */

// Error types for better categorization
export enum ErrorType {
  API = 'API_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NETWORK = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
  STATE = 'STATE_ERROR',
  RENDERING = 'RENDERING_ERROR'
}

// Extended error class with additional properties
export class AppError extends Error {
  type: ErrorType;
  context?: Record<string, unknown>;
  originalError?: Error;
  code?: string;
  
  constructor(message: string, options: {
    type?: ErrorType;
    context?: Record<string, unknown>;
    originalError?: Error;
    code?: string;
  } = {}) {
    super(message);
    this.name = 'AppError';
    this.type = options.type || ErrorType.UNKNOWN;
    this.context = options.context;
    this.originalError = options.originalError;
    this.code = options.code;
  }
}

/**
 * Creates a standardized error object
 * 
 * @param message Error message
 * @param options Additional error options
 * @returns Standardized AppError
 */
export function createError(message: string, options?: {
  type?: ErrorType;
  context?: Record<string, unknown>;
  originalError?: Error;
  code?: string;
}): AppError {
  return new AppError(message, options);
}

/**
 * Safely executes a function and handles any errors
 * 
 * @param fn Function to execute
 * @param errorHandler Optional custom error handler
 * @returns Result of the function or undefined if an error occurred
 */
export function safeExecute<T>(
  fn: () => T,
  errorHandler?: (error: AppError) => void
): T | undefined {
  try {
    return fn();
  } catch (error) {
    const appError = error instanceof AppError
      ? error
      : new AppError(
          error instanceof Error ? error.message : 'An unknown error occurred',
          { originalError: error instanceof Error ? error : undefined }
        );
    
    if (errorHandler) {
      errorHandler(appError);
    } else {
      console.error('Error in safeExecute:', appError);
    }
    
    return undefined;
  }
}

/**
 * Creates an async function that handles errors
 * 
 * @param fn Async function to wrap
 * @param errorHandler Optional custom error handler
 * @returns Wrapped function that handles errors
 */
export function createSafeAsyncFunction<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  errorHandler?: (error: AppError) => void
): (...args: Args) => Promise<T | undefined> {
  return async (...args: Args): Promise<T | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = error instanceof AppError
        ? error
        : new AppError(
            error instanceof Error ? error.message : 'An unknown error occurred',
            { originalError: error instanceof Error ? error : undefined }
          );
      
      if (errorHandler) {
        errorHandler(appError);
      } else {
        console.error('Error in safeAsyncFunction:', appError);
      }
      
      return undefined;
    }
  };
}

/**
 * Custom hook for handling errors in async operations
 * 
 * @param defaultErrorHandler Default error handler function
 * @returns Object with error handling utilities
 */
export function useErrorHandling(defaultErrorHandler?: (error: AppError) => void) {
  const [error, setError] = React.useState<AppError | null>(null);
  
  const handleError = React.useCallback((error: AppError) => {
    setError(error);
    if (defaultErrorHandler) {
      defaultErrorHandler(error);
    } else {
      console.error('Error caught by useErrorHandling:', error);
    }
  }, [defaultErrorHandler]);
  
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const wrapAsync = React.useCallback(<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>
  ) => {
    return async (...args: Args): Promise<T | undefined> => {
      try {
        return await fn(...args);
      } catch (caughtError) {
        const appError = caughtError instanceof AppError
          ? caughtError
          : new AppError(
              caughtError instanceof Error ? caughtError.message : 'An unknown error occurred',
              { originalError: caughtError instanceof Error ? caughtError : undefined }
            );
        
        handleError(appError);
        return undefined;
      }
    };
  }, [handleError]);
  
  return {
    error,
    handleError,
    clearError,
    wrapAsync
  };
}
