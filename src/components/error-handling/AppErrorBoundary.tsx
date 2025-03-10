
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ValidationError } from '@/utils/validation/ValidationError';
import { toast } from 'sonner';

interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Optional fallback component to display when an error occurs */
  fallback?: ReactNode;
  /** Optional error handler function */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to reset the error boundary on navigation */
  resetOnNavigation?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enhanced error boundary component that provides standardized
 * error handling for the application
 */
export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('Error caught by AppErrorBoundary:', error, errorInfo);
    
    // Format validation errors for better user experience
    if (error instanceof ValidationError) {
      toast.error(`Validation Error: ${error.message}`, {
        description: `Field: ${error.field}, Expected: ${error.expectedType || 'valid value'}`,
        duration: 5000
      });
    } else {
      // Standard error toast
      toast.error('An error occurred in the application', {
        description: error.message,
        duration: 5000
      });
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Show fallback UI if provided, otherwise show default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-destructive/5 text-destructive">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4 text-center text-destructive/80">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={this.reset}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
