
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

export interface ErrorHandlingOptions {
  componentName?: string;
  errorContext?: string;
  reportErrors?: boolean;
  logErrors?: boolean;
  fallbackRender?: (props: { 
    error: Error; 
    resetErrorBoundary: () => void;
  }) => ReactNode;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  options?: ErrorHandlingOptions;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * An enhanced error boundary component that provides better error handling
 * and customization options than the basic React error boundary
 */
export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, options } = this.props;
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Log errors to console if enabled
    if (!options?.logErrors || options.logErrors) {
      console.error(
        `Error caught by EnhancedErrorBoundary${
          options?.componentName ? ` in ${options.componentName}` : ''
        }:`, 
        error, 
        errorInfo
      );
    }
    
    // Report errors to monitoring service if enabled
    if (options?.reportErrors) {
      // This would connect to an error reporting service
      // Example: reportErrorToService(error, errorInfo, options.componentName);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ 
      hasError: false, 
      error: null 
    });
  }

  render(): ReactNode {
    const { children, fallback, options } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error) {
      // Use custom fallback render if provided
      if (options?.fallbackRender) {
        return options.fallbackRender({ 
          error, 
          resetErrorBoundary: this.resetErrorBoundary 
        });
      }
      
      // Use provided fallback component if available
      if (fallback) {
        return fallback;
      }
      
      // Use default ErrorFallback component
      return (
        <ErrorFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
          componentName={options?.componentName}
          errorContext={options?.errorContext}
        />
      );
    }

    return children;
  }
}

export default EnhancedErrorBoundary;
