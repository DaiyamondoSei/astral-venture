
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ValidationError } from '@/utils/validation/ValidationError';
import { captureException } from '@/utils/errorHandling';

interface ErrorBoundaryProps {
  /** Component to render when an error occurs */
  fallback?: React.ComponentType<{ 
    error: Error; 
    resetErrorBoundary: () => void; 
  }>;
  /** Content to render when no error occurs */
  children: ReactNode;
  /** Optional function to call when an error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional function to call when resetting the error boundary */
  onReset?: () => void;
}

interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred */
  error: Error | null;
}

/**
 * Enhanced error boundary component with improved error handling
 */
class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  /**
   * Static method to derive state from error
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Lifecycle method called when an error occurs
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('Error caught by EnhancedErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Report error to monitoring system
    captureException(error, 'EnhancedErrorBoundary');
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset the error boundary
   */
  resetErrorBoundary = (): void => {
    // Call onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    // Reset error state
    this.setState({
      hasError: false,
      error: null
    });
  };

  /**
   * Render fallback UI or children
   */
  render(): ReactNode {
    const { hasError, error } = this.state;
    const { fallback: Fallback, children } = this.props;
    
    if (hasError && error) {
      // Format validation errors more nicely
      if (error instanceof ValidationError) {
        console.info('ValidationError details:', {
          field: error.field,
          expectedType: error.expectedType,
          rule: error.rule,
          details: error.details
        });
      }
      
      // Render fallback component if provided
      if (Fallback) {
        return <Fallback error={error} resetErrorBoundary={this.resetErrorBoundary} />;
      }
      
      // Default fallback UI
      return (
        <div className="error-boundary p-4 border border-red-500 rounded-md bg-red-50 dark:bg-red-900/20">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
            Something went wrong
          </h2>
          <pre className="text-sm bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-auto max-h-36">
            {error.message}
          </pre>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={this.resetErrorBoundary}
          >
            Try again
          </button>
        </div>
      );
    }
    
    // No error, render children
    return children;
  }
}

export default EnhancedErrorBoundary;
