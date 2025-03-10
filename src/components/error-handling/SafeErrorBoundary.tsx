
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { handleError, ErrorCategory, ErrorSeverity } from '@/utils/errorHandling';
import ErrorFallback from './ErrorFallback';

/**
 * Props for the safe error boundary component
 */
export interface SafeErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  
  /** Optional custom fallback component */
  fallback?: ReactNode | ((props: { error: Error; resetErrorBoundary: () => void }) => ReactNode);
  
  /** Whether to show error details in the fallback */
  showErrorDetails?: boolean;
  
  /** Error category for logging and metrics */
  errorCategory?: ErrorCategory;
  
  /** Error severity level */
  errorSeverity?: ErrorSeverity;
  
  /** Custom error handler called when an error is caught */
  onError?: (error: Error, info: ErrorInfo) => void;
  
  /** Context label for error logging */
  contextLabel?: string;
}

/**
 * State for the safe error boundary component
 */
interface SafeErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  
  /** The error that occurred */
  error?: Error;
}

/**
 * A simple error boundary that uses our central error handling system
 * with sensible defaults for most use cases
 */
class SafeErrorBoundary extends Component<SafeErrorBoundaryProps, SafeErrorBoundaryState> {
  constructor(props: SafeErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): SafeErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Report the error to our error handling system
    handleError(error, {
      category: this.props.errorCategory || ErrorCategory.USER_INTERFACE,
      severity: this.props.errorSeverity || ErrorSeverity.ERROR,
      context: this.props.contextLabel || 'Component',
      metadata: {
        componentStack: info.componentStack,
      }
    });
    
    // Call the custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, info);
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
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({
            error: this.state.error,
            resetErrorBoundary: this.resetErrorBoundary
          });
        }
        return this.props.fallback;
      }
      
      // Render the default error fallback
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
          showDetails={this.props.showErrorDetails}
        />
      );
    }

    // Render children if no error occurred
    return this.props.children;
  }
}

export default SafeErrorBoundary;
