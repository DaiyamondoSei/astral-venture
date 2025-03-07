
import React from 'react';
import { toast } from '@/components/ui/use-toast';

/**
 * Custom error classes for different types of application errors
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication error') {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation error') {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error handling utility that centralizes error handling logic
 * and provides consistent error reporting throughout the application
 */
export const ErrorHandler = {
  /**
   * Handle an error with appropriate logging and user feedback
   * 
   * @param error The error to handle
   * @param context Additional context about where the error occurred
   * @param showToast Whether to show a toast notification to the user
   */
  handle: (error: unknown, context: string, showToast: boolean = true): void => {
    // Convert to Error object if it's not already
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Log error with context
    console.error(`Error in ${context}:`, errorObj);
    
    // Show toast notification if requested
    if (showToast) {
      toast({
        title: "An error occurred",
        description: errorObj.message || "Something went wrong",
        variant: "destructive",
      });
    }
  },
  
  /**
   * Create an async error handler that can be used with try/catch blocks
   * 
   * @param asyncFn The async function to wrap
   * @param context Context information for error logging
   * @param options Additional options
   * @returns A wrapped function that handles errors
   */
  withAsyncErrorHandling: <T, Args extends any[]>(
    asyncFn: (...args: Args) => Promise<T>,
    context: string,
    options: {
      showToast?: boolean;
      fallbackValue?: T;
      onError?: (error: Error) => void;
    } = {}
  ) => {
    return async (...args: Args): Promise<T | undefined> => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        ErrorHandler.handle(error, context, options.showToast);
        if (options.onError) {
          options.onError(error instanceof Error ? error : new Error(String(error)));
        }
        return options.fallbackValue;
      }
    };
  },
  
  /**
   * Create a component error boundary
   * 
   * @param WrappedComponent The component to wrap with error handling
   * @param fallback Optional fallback component to render on error
   * @returns Component with error boundary
   */
  withErrorBoundary: <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: React.ReactNode
  ) => {
    return class WithErrorBoundary extends React.Component<P, { hasError: boolean; error: Error | null }> {
      constructor(props: P) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Component error:', error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          if (fallback) {
            return fallback;
          }
          return (
            <div className="p-4 border border-red-500 bg-red-50 rounded-md">
              <h3 className="text-red-700 font-medium">Something went wrong</h3>
              <p className="text-red-600 text-sm">{this.state.error?.message || 'Unknown error'}</p>
              <button 
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try again
              </button>
            </div>
          );
        }

        return <WrappedComponent {...this.props} />;
      }
    };
  }
};

/**
 * Custom hook to use the error handler within functional components
 * 
 * @param context The context name for error reporting
 * @returns Error handling utilities
 */
export function useErrorHandler(context: string) {
  return {
    /**
     * Handle an error within a component
     * 
     * @param error The error to handle
     * @param showToast Whether to show a toast notification
     */
    handleError: (error: unknown, showToast: boolean = true) => {
      ErrorHandler.handle(error, context, showToast);
    },
    
    /**
     * Wrap an async function with error handling
     * 
     * @param asyncFn The async function to wrap
     * @param options Additional options for error handling
     * @returns A wrapped function that handles errors
     */
    withAsyncErrorHandling: <T, Args extends any[]>(
      asyncFn: (...args: Args) => Promise<T>,
      options: {
        showToast?: boolean;
        fallbackValue?: T;
        onError?: (error: Error) => void;
      } = {}
    ) => {
      return ErrorHandler.withAsyncErrorHandling(asyncFn, context, options);
    }
  };
}
