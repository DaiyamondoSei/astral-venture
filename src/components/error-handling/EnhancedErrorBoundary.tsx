
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';

/**
 * Error categories for better error handling and reporting
 */
export enum ErrorCategory {
  DATA_FETCHING = 'data_fetching',
  USER_INTERFACE = 'user_interface',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  UNEXPECTED = 'unexpected'
}

/**
 * Error handling options for the EnhancedErrorBoundary
 */
export interface ErrorHandlingOptions {
  /**
   * Display name for the component that's being wrapped, used in error reporting
   */
  componentName: string;
  
  /**
   * Error category for better error classification and handling
   */
  category: ErrorCategory;
  
  /**
   * Whether to show toast notifications for errors
   */
  showToasts?: boolean;
  
  /**
   * Whether to log errors to the console
   */
  logErrors?: boolean;
  
  /**
   * Optional recovery action to try fixing the error
   */
  onRecoveryAttempt?: () => void;
  
  /**
   * Whether the component should try to render children even if there's an error
   */
  forceRender?: boolean;
  
  /**
   * Custom error message to display instead of the generic one
   */
  errorMessage?: string;
}

/**
 * Props for the EnhancedErrorBoundary component
 */
interface EnhancedErrorBoundaryProps {
  /**
   * Components to render inside the error boundary
   */
  children: ReactNode;
  
  /**
   * Fallback UI to display when an error occurs
   */
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
    errorInfo?: ErrorInfo;
  }>;
  
  /**
   * Error handling options for customizing behavior
   */
  options: ErrorHandlingOptions;
  
  /**
   * Function called when an error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo, category: ErrorCategory) => void;
}

/**
 * State for the EnhancedErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Default fallback component to display when an error occurs
 */
const DefaultErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
  errorInfo?: ErrorInfo;
}> = ({ error, resetError }) => {
  return (
    <div className="p-4 border border-red-300 bg-red-50 rounded-md">
      <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
      <p className="text-red-700 mb-4">{error.message || 'An unexpected error occurred'}</p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
};

/**
 * Enhanced error boundary component with additional error handling features
 */
export class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error info
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    const { options, onError } = this.props;
    const { componentName, category, showToasts = true, logErrors = true } = options;
    
    // Log errors if enabled
    if (logErrors) {
      console.error(
        `Error in ${componentName} (${category}):`,
        error,
        errorInfo
      );
    }
    
    // Show toast notification if enabled
    if (showToasts) {
      const errorMessage = options.errorMessage || `Error in ${componentName}: ${error.message}`;
      toast.error(errorMessage);
    }
    
    // Call onError callback if provided
    if (onError) {
      onError(error, errorInfo, category);
    }
  }

  resetError = (): void => {
    const { options } = this.props;
    
    // Call recovery function if provided
    if (options.onRecoveryAttempt) {
      options.onRecoveryAttempt();
    }
    
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback: FallbackComponent = DefaultErrorFallback, options } = this.props;
    const { forceRender = false } = options;
    
    // Render fallback UI if there's an error and not forcing render
    if (hasError && !forceRender && error) {
      return <FallbackComponent error={error} resetError={this.resetError} errorInfo={errorInfo || undefined} />;
    }
    
    // Render children (either because there's no error, or forceRender is true)
    return children;
  }
}

/**
 * Higher-order component to wrap a component with an enhanced error boundary
 * 
 * @param Component - Component to wrap
 * @param options - Error handling options
 * @returns Wrapped component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: ErrorHandlingOptions
): React.FC<P> {
  const displayName = options.componentName || Component.displayName || Component.name || 'Component';
  
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <EnhancedErrorBoundary options={options}>
        <Component {...props} />
      </EnhancedErrorBoundary>
    );
  };
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

export default EnhancedErrorBoundary;
