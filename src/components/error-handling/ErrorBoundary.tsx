
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';
import { ValidationError } from '@/utils/validation/ValidationError';
import { ErrorSeverities } from '@/types/core/validation';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Add severity and category for better error handling
    const enhancedError = error as Error & { 
      severity?: string;
      category?: string;
    };
    
    if (!enhancedError.severity) {
      enhancedError.severity = ErrorSeverities.ERROR;
    }
    
    if (!enhancedError.category) {
      enhancedError.category = 'ui';
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(enhancedError, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { fallback, children, componentName, showDetails } = this.props;
    
    if (hasError) {
      // Render custom fallback UI if provided
      if (fallback) {
        return fallback;
      }
      
      // If the error is a ValidationError, show a specialized message
      if (ValidationError.isValidationError(error)) {
        return (
          <ErrorFallback 
            error={error} 
            resetErrorBoundary={this.resetError}
            componentName={componentName}
            showDetails={showDetails}
          />
        );
      }
      
      // Default error fallback
      return (
        <ErrorFallback 
          error={error!}
          resetErrorBoundary={this.resetError}
          componentName={componentName}
          showDetails={showDetails}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
