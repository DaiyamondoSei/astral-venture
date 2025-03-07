
import React from 'react';
import { ErrorHandler } from '@/utils/enhancedErrorHandling';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: string;
  resetOnPropsChange?: boolean;
}

/**
 * Enhanced Error Boundary Component with better error reporting
 * 
 * Provides more detailed error information, customizable fallback UI,
 * and integrates with the application's error handling system.
 */
class EnhancedErrorBoundary extends React.Component<Props, { hasError: boolean; error: Error | null }> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null 
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to the error handling system
    const { context = 'ErrorBoundary', onError } = this.props;
    
    // Use our error handler to log the error
    ErrorHandler.handle(error, context, false);
    
    // Also log the component stack
    console.error('Component stack:', errorInfo.componentStack);
    
    // Call the custom onError handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset the error state when props change if resetOnPropsChange is true
    if (this.props.resetOnPropsChange && 
        this.state.hasError && 
        prevProps !== this.props) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or the provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <div className="p-4 border border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-md shadow-md">
          <h3 className="text-red-700 dark:text-red-400 font-medium text-lg mb-2">Something went wrong</h3>
          <p className="text-red-600 dark:text-red-300 text-sm mb-3">
            {this.state.error?.message || 'An unknown error occurred'}
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="text-xs bg-red-100 dark:bg-red-900 p-2 rounded mb-3 overflow-auto max-h-40">
              {this.state.error.stack}
            </pre>
          )}
          <Button 
            variant="destructive"
            size="sm"
            onClick={this.resetError}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
