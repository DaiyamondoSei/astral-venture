
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from './errorReporter';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  errorKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enhanced error boundary component with standardized error handling
 * 
 * Features:
 * - Consistent error display
 * - Error reporting
 * - Recovery mechanism
 * - Customizable fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Report error to monitoring system
    captureException(error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if errorKey prop changes
    if (
      this.state.hasError &&
      prevProps.errorKey !== this.props.errorKey
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }
      
      if (fallback) {
        return fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50 text-red-800 max-w-lg mx-auto my-4">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="mb-4">{error.message || 'An unexpected error occurred'}</p>
          <button
            onClick={this.resetError}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}

/**
 * Higher-order component to wrap a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
