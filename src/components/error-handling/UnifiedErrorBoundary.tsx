
import React, { Component, ErrorInfo, ReactNode, useState, useEffect, useCallback } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import ErrorFallback from './ErrorFallback';

// Error boundary state interface
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  lastErrorTime: number;
}

// Error boundary props interface
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; resetErrorBoundary: () => void }) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  componentName?: string;
}

/**
 * UnifiedErrorBoundary: A comprehensive error boundary component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: 0
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
    // Record the error timestamp
    const now = Date.now();
    
    // Update error count and time
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
      lastErrorTime: now
    }));

    // Execute error callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log the error to the console
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  resetErrorBoundary = (): void => {
    // Execute reset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }

    // Reset the error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, componentName } = this.props;

    if (hasError && error) {
      // Use the provided fallback or default error component
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback({ 
            error, 
            resetErrorBoundary: this.resetErrorBoundary 
          });
        }
        return fallback;
      }

      // Default fallback UI
      return (
        <ErrorFallback 
          error={error} 
          componentName={componentName}
          resetErrorBoundary={this.resetErrorBoundary} 
        />
      );
    }

    // When there is no error, render children normally
    return children;
  }
}

/**
 * Error Boundary Provider with performance tracking
 */
export const ErrorBoundaryProvider: React.FC<{
  children: ReactNode;
  componentName?: string;
}> = ({ children, componentName }) => {
  const performance = usePerformance();
  
  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    // Track error in performance monitoring
    performance.trackMetric(
      componentName || 'unknown',
      'error',
      1
    );
    
    // Log additional error details if available
    if (performance.config.enableDetailedLogging) {
      console.error(`[${componentName || 'ErrorBoundary'}] Error details:`, {
        error,
        componentStack: errorInfo.componentStack
      });
      
      performance.trackMetric(
        componentName || 'unknown',
        'errorDetail',
        Date.now()
      );
    }
  }, [componentName, performance]);
  
  return (
    <ErrorBoundary
      componentName={componentName}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Higher-order component that wraps a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    fallback?: React.ReactNode;
    onError?: (error: Error, info: React.ErrorInfo) => void;
    componentName?: string;
  } = {}
): React.FC<P> {
  const { 
    fallback, 
    onError, 
    componentName = Component.displayName || Component.name || 'Component'
  } = options;

  const WrappedComponent: React.FC<P> = (props) => {
    // Use the performance context for error tracking
    const performance = usePerformance();
    
    const handleError = useCallback((error: Error, info: React.ErrorInfo) => {
      // Log the error
      console.error(`[${componentName}] Error caught:`, error);
      console.error('Component stack:', info.componentStack);
      
      // Track the error in performance monitoring
      performance.trackMetric(componentName, 'error', 1);
      
      // Call the custom error handler if provided
      if (onError) {
        onError(error, info);
      }
    }, [performance]);

    return (
      <ErrorBoundary
        componentName={componentName}
        onError={handleError}
        fallback={fallback || (
          <ErrorFallback
            componentName={componentName}
          />
        )}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  // Set the display name for the wrapped component
  WrappedComponent.displayName = `withErrorBoundary(${componentName})`;

  return WrappedComponent;
}

export default ErrorBoundary;
