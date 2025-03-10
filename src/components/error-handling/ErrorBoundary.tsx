
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { handleError } from '../../utils/errorHandling/handleError';
import { ErrorSeverity, ErrorCategory } from '../../utils/errorHandling/AppError';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  errorComponent?: React.ComponentType<{ error: Error; resetError: () => void }>;
  componentName?: string;
  suppressConsoleErrors?: boolean;
  onReset?: () => void;
  retryRender?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch JavaScript errors in child component trees
 * and display a fallback UI instead of crashing the whole application.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Process error through central error handling system
    handleError(error, {
      showToast: true,
      logToConsole: !this.props.suppressConsoleErrors,
      logToServer: true,
      throwError: false,
      context: {
        componentName: this.props.componentName || 'unknown',
        componentStack: errorInfo.componentStack,
        recoveryPossible: true
      },
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.RENDERING
    });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom error component is provided, use it
      if (this.props.errorComponent) {
        const ErrorComponent = this.props.errorComponent;
        return <ErrorComponent error={this.state.error!} resetError={this.resetError} />;
      }
      
      // Otherwise use the fallback
      return this.props.fallback;
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
