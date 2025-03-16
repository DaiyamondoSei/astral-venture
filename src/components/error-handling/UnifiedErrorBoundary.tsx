
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Types for our error boundary
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  componentName?: string;
  errorKey?: string;
  showInlineError?: boolean;
  reportErrors?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  errorInfo: ErrorInfo | null;
}

/**
 * Unified error boundary component with standardized error handling
 * 
 * Features:
 * - Consistent error display
 * - Error reporting
 * - Recovery mechanism
 * - Customizable fallback UI
 * - Performance tracking integration
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
      errorCount: (prevState: ErrorBoundaryState) => prevState.errorCount + 1
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Save error info for rendering
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Report error
    if (this.props.reportErrors) {
      this.reportError(error, errorInfo);
    }
    
    // Show toast notification
    this.showErrorToast(error);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if errorKey prop changes
    if (
      this.state.hasError &&
      prevProps.errorKey !== this.props.errorKey
    ) {
      this.resetError();
    }
  }
  
  private reportError(error: Error, errorInfo: ErrorInfo): void {
    // Report to error monitoring system
    console.error('Error captured by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    try {
      // Report to your error monitoring service
      const errorReport = {
        componentName: this.props.componentName || 'Unknown',
        componentStack: errorInfo.componentStack,
        recoveryPossible: true,
        errorCount: this.state.errorCount
      };
      
      // In a real app, you'd send this to your error monitoring service
      console.info('Error report:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
  
  private showErrorToast(error: Error): void {
    toast({
      variant: "destructive",
      title: "An error occurred",
      description: error.message || "Something went wrong",
    });
  }

  resetError = (): void => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showInlineError = true } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided as function
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }
      
      // Use custom fallback element if provided
      if (fallback) {
        return fallback;
      }
      
      // Default fallback UI
      if (showInlineError) {
        return (
          <Card className="border-red-300 bg-red-50 max-w-lg mx-auto my-4">
            <CardHeader>
              <CardTitle className="text-red-800">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-red-700">
              <p className="mb-4">{error.message || 'An unexpected error occurred'}</p>
              {errorInfo && (
                <details className="mt-2 whitespace-pre-wrap text-xs font-mono bg-red-100 p-2 rounded">
                  <summary className="cursor-pointer">Component Stack</summary>
                  <p className="mt-2 text-red-600">{errorInfo.componentStack}</p>
                </details>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={this.resetError}
                variant="destructive"
              >
                Try again
              </Button>
            </CardFooter>
          </Card>
        );
      }
    }

    return children;
  }
}

interface ErrorBoundaryProviderProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  componentName?: string;
  reportErrors?: boolean;
  showInlineError?: boolean;
}

/**
 * Function component wrapper for ErrorBoundary with performance tracking
 */
export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({ 
  children,
  fallback,
  componentName = 'UnnamedComponent',
  reportErrors = true,
  showInlineError = true
}) => {
  const performance = usePerformance();
  
  const handleError = (error: Error) => {
    // Track error in performance metrics
    performance.trackMetric(componentName, 'error_boundary_trigger', performance.now());
  };
  
  const handleReset = () => {
    // Track recovery in performance metrics
    performance.trackMetric(componentName, 'error_boundary_reset', performance.now());
  };
  
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={handleError}
      onReset={handleReset}
      componentName={componentName}
      reportErrors={reportErrors}
      showInlineError={showInlineError}
      errorKey={Date.now().toString()} // Force reset if component is re-mounted
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Higher-order component to wrap a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'> = {}
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary
      {...errorBoundaryProps}
      componentName={errorBoundaryProps.componentName || displayName}
    >
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
