
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { usePerformance } from '../../contexts/PerformanceContext';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enhanced Error Boundary with performance tracking
 * Captures and handles errors in the component tree
 */
class ErrorBoundaryBase extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
    // Track the error in our metrics
    if (this.props.componentName && this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in dev mode
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset the error state if props change and resetOnPropsChange is true
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      prevProps !== this.props
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
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
        <div className="p-4 my-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm mb-4">{error.message || 'An unexpected error occurred'}</p>
          <button
            className="px-3 py-1 bg-destructive text-destructive-foreground text-sm rounded hover:bg-destructive/90"
            onClick={this.resetError}
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
 * HOC to inject performance tracking into ErrorBoundary
 */
export const EnhancedErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  const { trackEvent } = usePerformance();
  
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Track error in performance metrics
    trackEvent('error_boundary_caught', {
      componentName: props.componentName || 'unknown',
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // Call the original onError if provided
    if (props.onError) {
      props.onError(error, errorInfo);
    }
  };
  
  return <ErrorBoundaryBase {...props} onError={handleError} />;
};

export default EnhancedErrorBoundary;
