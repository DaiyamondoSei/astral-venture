
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ValidationError } from '@/utils/validation/ValidationError';
import { toast } from 'sonner';
import { reportError } from '@/utils/errorHandling/errorReporter';
import { handleError } from '@/utils/errorHandling/handleError';
import { ErrorSeverity, ErrorCategory } from '@/utils/errorHandling/AppError';

interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  
  /** Optional component to render when an error occurs */
  fallback?: React.ReactNode | React.ComponentType<{ 
    error: Error; 
    resetErrorBoundary: () => void; 
  }>;
  
  /** Optional error handler function */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /** Reset on props change */
  resetOnPropsChange?: boolean;
  
  /** Component name for tracking */
  componentName?: string;
  
  /** Whether to suppress console errors */
  suppressConsoleErrors?: boolean;
  
  /** Handler called on reset */
  onReset?: () => void;
  
  /** Whether to retry render on reset */
  retryRender?: boolean;
  
  /** Whether to capture analytics */
  captureAnalytics?: boolean;
  
  /** Extra context for error reports */
  errorContext?: Record<string, unknown>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Unified error boundary that combines functionality from all error boundary components
 */
class UnifiedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error info
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Process error through central error handling system
    handleError(error, {
      showToast: true,
      logToConsole: !this.props.suppressConsoleErrors,
      logToServer: true,
      throwError: false,
      context: {
        componentName: this.props.componentName || 'unknown',
        componentStack: errorInfo.componentStack,
        recoveryPossible: true,
        errorCount: this.state.errorCount + 1,
        ...this.props.errorContext
      }
    });
    
    // Report error to monitoring system
    reportError(error, this.props.componentName || 'UnifiedErrorBoundary');
    
    // Show toast for validation errors
    if (error instanceof ValidationError) {
      toast.error(`Validation Error: ${error.message}`, {
        description: `Field: ${error.field}, Expected: ${error.expectedType || 'valid value'}`,
        duration: 5000
      });
    }
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if props changed and resetOnPropsChange is true
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback component if provided and it's a component
      if (this.props.fallback && typeof this.props.fallback === 'function') {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
      }
      
      // Use custom fallback element if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="error-boundary p-4 border border-red-500 rounded-md bg-red-50 dark:bg-red-900/20">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
            Something went wrong
          </h2>
          <pre className="text-sm bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-auto max-h-36">
            {this.state.error.message}
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
    
    return this.props.children;
  }
}

export default UnifiedErrorBoundary;
