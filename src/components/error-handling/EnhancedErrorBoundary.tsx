
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * EnhancedErrorBoundary Component
 * 
 * An improved version of the ErrorBoundary with additional features
 * like callbacks, detailed error information, and automatic reset on props change
 */
class EnhancedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Set the error info for more detailed debugging
    this.setState({ errorInfo });
    
    // Optional callback for parent components to handle errors
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log the error to an error reporting service
    console.error('EnhancedErrorBoundary caught an error:', error, errorInfo);
  }

  // Reset error state when props change (if enabled)
  componentDidUpdate(prevProps: Props) {
    if (
      this.state.hasError && 
      this.props.resetOnPropsChange && 
      this.props.children !== prevProps.children
    ) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or the provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Use the default error fallback
      return this.state.error ? (
        <ErrorFallback error={this.state.error} resetErrorBoundary={this.resetError} />
      ) : (
        <div className="p-6 bg-white/90 rounded-lg shadow-lg text-gray-800">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <button 
            onClick={this.resetError}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try again
          </button>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
