
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';
import { isValidationError } from '@/utils/validation/ValidationError';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ 
    error: Error; 
    resetErrorBoundary: () => void;
  }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  errorContextName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enhanced error boundary component that captures React errors
 * and displays a fallback UI
 */
class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log additional context about the error
    if (this.props.errorContextName) {
      console.info(`Error context: ${this.props.errorContextName}`);
    }

    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Special handling for validation errors
    if (isValidationError(error)) {
      console.warn('Validation error details:', {
        path: error.path,
        value: error.value,
        code: error.code
      });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset the error state when props change if resetOnPropsChange is true
    if (
      this.state.hasError && 
      this.props.resetOnPropsChange &&
      this.props.children !== prevProps.children
    ) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use the provided fallback component or default to ErrorFallback
      const FallbackComponent = this.props.fallback || ErrorFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetErrorBoundary={this.resetErrorBoundary} 
        />
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
