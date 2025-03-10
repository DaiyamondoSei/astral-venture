
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorCategory, ErrorSeverity, handleError } from '@/utils/errorHandling';

/**
 * Props for the error fallback component
 */
export interface ErrorFallbackProps {
  /** The error that was caught */
  error: Error;
  /** Function to reset the error state */
  resetError: () => void;
  /** Additional error information */
  errorInfo?: ErrorInfo;
}

/**
 * Props for the EnhancedErrorBoundary component
 */
export interface EnhancedErrorBoundaryProps {
  /** Content to render */
  children: ReactNode;
  /** Error boundary configuration options */
  options: {
    /** Component name for error reporting */
    componentName?: string;
    /** Error category for classification */
    category?: ErrorCategory;
    /** Whether to reset on props change */
    resetOnPropsChange?: boolean;
    /** Whether to reset on unmount */
    resetOnUnmount?: boolean;
    /** Custom fallback component */
    FallbackComponent?: React.ComponentType<ErrorFallbackProps>;
    /** Custom error handling function */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** Whether to show a toast message */
    showToast?: boolean;
  };
}

/**
 * State for the EnhancedErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced error boundary component with consistent error handling
 */
export class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when an error occurs
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Handle errors with our standardized error handling
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Set error info in state
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.options.onError) {
      this.props.options.onError(error, errorInfo);
    }
    
    // Use centralized error handling
    handleError(error, {
      context: this.props.options.componentName || 'ErrorBoundary',
      category: this.props.options.category || ErrorCategory.USER_INTERFACE,
      severity: ErrorSeverity.ERROR,
      showToast: this.props.options.showToast !== false,
      metadata: {
        componentStack: errorInfo.componentStack,
        componentName: this.props.options.componentName
      }
    });
  }

  /**
   * Reset error state when props change if configured
   */
  componentDidUpdate(prevProps: EnhancedErrorBoundaryProps): void {
    if (
      this.state.hasError &&
      this.props.options.resetOnPropsChange &&
      this.props.children !== prevProps.children
    ) {
      this.resetError();
    }
  }

  /**
   * Reset error state when unmounting if configured
   */
  componentWillUnmount(): void {
    if (this.state.hasError && this.props.options.resetOnUnmount) {
      this.resetError();
    }
  }

  /**
   * Reset error state
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, options } = this.props;
    
    if (hasError && error) {
      // Use custom fallback if provided
      if (options.FallbackComponent) {
        return (
          <options.FallbackComponent
            error={error}
            resetError={this.resetError}
            errorInfo={errorInfo || undefined}
          />
        );
      }
      
      // Default fallback UI
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50 text-red-800">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="mb-2">{error.message}</p>
          <button 
            onClick={this.resetError}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded"
          >
            Try again
          </button>
        </div>
      );
    }
    
    return children;
  }
}

export default EnhancedErrorBoundary;
