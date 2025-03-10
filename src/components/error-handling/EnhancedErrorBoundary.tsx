
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { handleError, ErrorCategory, ErrorSeverity } from '@/utils/errorHandling';
import ErrorFallback from './ErrorFallback';

/**
 * Props for the enhanced error boundary component
 */
export interface EnhancedErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  
  /** Error boundary configuration options */
  options?: {
    /** Custom fallback component to render when an error occurs */
    fallback?: ReactNode | ((props: { error: Error; resetErrorBoundary: () => void }) => ReactNode);
    
    /** Whether to show error details in the fallback */
    showErrorDetails?: boolean;
    
    /** Error category for logging and metrics */
    errorCategory?: ErrorCategory;
    
    /** Error severity level */
    errorSeverity?: ErrorSeverity;
    
    /** Custom error handler called when an error is caught */
    onError?: (error: Error, info: ErrorInfo) => void;
    
    /** Whether to reset the error boundary when props change */
    resetOnPropsChange?: boolean;
    
    /** Context label for error logging */
    contextLabel?: string;
  };
}

/**
 * State for the enhanced error boundary component
 */
interface EnhancedErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  
  /** The error that occurred */
  error?: Error;
}

/**
 * Enhanced error boundary component with more options and better error reporting
 */
class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): EnhancedErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Report the error to our error handling system
    handleError(error, {
      category: this.props.options?.errorCategory || ErrorCategory.USER_INTERFACE,
      severity: this.props.options?.errorSeverity || ErrorSeverity.ERROR,
      context: this.props.options?.contextLabel || 'ErrorBoundary',
      metadata: {
        componentStack: info.componentStack,
      }
    });
    
    // Call the custom error handler if provided
    if (this.props.options?.onError) {
      this.props.options.onError(error, info);
    }
  }

  componentDidUpdate(prevProps: EnhancedErrorBoundaryProps): void {
    // Reset the error boundary when props change if enabled
    if (
      this.state.hasError &&
      this.props.options?.resetOnPropsChange &&
      prevProps !== this.props
    ) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: undefined
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render the custom fallback component if provided
      if (this.props.options?.fallback) {
        if (typeof this.props.options.fallback === 'function') {
          return this.props.options.fallback({
            error: this.state.error,
            resetErrorBoundary: this.resetErrorBoundary
          });
        }
        return this.props.options.fallback;
      }
      
      // Render the default error fallback
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
          showDetails={this.props.options?.showErrorDetails}
        />
      );
    }

    // Render children if no error occurred
    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
