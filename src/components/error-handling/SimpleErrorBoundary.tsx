
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface SimpleErrorBoundaryProps {
  /** Component to render when an error occurs */
  fallback?: React.ComponentType<{ error: Error }>;
  /** Content to render when no error occurs */
  children: ReactNode;
  /** Optional function to call when an error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface SimpleErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred */
  error: Error | null;
}

/**
 * Simple error boundary component for basic error handling
 * This is useful for tests and simple use cases
 */
class SimpleErrorBoundary extends Component<SimpleErrorBoundaryProps, SimpleErrorBoundaryState> {
  constructor(props: SimpleErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  /**
   * Static method to derive state from error
   */
  static getDerivedStateFromError(error: Error): SimpleErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Lifecycle method called when an error occurs
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('Error caught by SimpleErrorBoundary:', error);
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Render fallback UI or children
   */
  render(): ReactNode {
    const { hasError, error } = this.state;
    const { fallback: Fallback, children } = this.props;
    
    if (hasError && error) {
      // Render fallback component if provided
      if (Fallback) {
        return <Fallback error={error} />;
      }
      
      // Default fallback UI
      return (
        <div className="p-3 border border-red-400 bg-red-50 rounded">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700 text-sm">{error.message}</p>
        </div>
      );
    }
    
    // No error, render children
    return children;
  }
}

export default SimpleErrorBoundary;
