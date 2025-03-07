
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './error-handling/ErrorFallback';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
        <ErrorFallback error={this.state.error} resetErrorBoundary={this.resetError} />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-black/20 backdrop-blur-md">
          <h2 className="text-xl font-display text-white mb-2">
            An unknown error occurred
          </h2>
          <Button onClick={this.resetError}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
