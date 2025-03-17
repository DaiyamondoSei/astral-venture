
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';
import { handleError } from '@/utils/errorHandling';

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
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Handle error with centralized error handler
    handleError(error, {
      context: this.props.componentName || 'ErrorBoundary',
      showToast: false,
      logToConsole: true
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or the provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return this.state.error ? (
        <ErrorFallback 
          error={this.state.error} 
          resetErrorBoundary={this.resetError} 
          componentName={this.props.componentName}
          showDetails={this.props.showDetails}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-black/20 backdrop-blur-md">
          <h2 className="text-xl font-display text-white mb-2">
            An unknown error occurred
            {this.props.componentName && <span className="text-sm text-white/70"> in {this.props.componentName}</span>}
          </h2>
          <button 
            onClick={this.resetError}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
