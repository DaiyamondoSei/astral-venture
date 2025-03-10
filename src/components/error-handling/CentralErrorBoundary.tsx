
import React, { Component, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { reportError } from '@/utils/errorHandling/errorReporter';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Central error boundary component that catches and handles React errors
 * 
 * This boundary prevents the entire application from crashing when
 * an error occurs in a component subtree.
 */
class CentralErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our reporting service
    reportError(error, {
      componentStack: errorInfo.componentStack,
      source: 'react-error-boundary'
    });
    
    // Store error info for rendering
    this.setState({
      errorInfo
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset the error state if props changed and resetOnPropsChange is true
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
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided, otherwise render default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-6 mx-auto my-8 max-w-md bg-white/10 backdrop-blur-lg rounded-lg border border-red-300/30 shadow-lg">
          <h2 className="text-xl font-semibold text-red-500 mb-3">Something went wrong</h2>
          
          <div className="mb-4 p-3 bg-gray-800/40 rounded text-sm font-mono overflow-auto max-h-40">
            <p className="text-red-400">{this.state.error?.toString()}</p>
            {this.state.errorInfo && (
              <details className="mt-2">
                <summary className="text-gray-400 cursor-pointer">Component Stack</summary>
                <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={this.resetErrorBoundary}
              className="text-white border-white/30 hover:bg-white/10"
            >
              Try Again
            </Button>
            
            <Button 
              variant="destructive"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CentralErrorBoundary;
