
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { handleError, ErrorSeverity, ErrorCategory } from '@/utils/errorHandling';

/**
 * Props for the enhanced error boundary component
 */
export interface EnhancedErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback component to render when an error occurs */
  fallback?: ReactNode;
  /** Callback function called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to reset the error state when props change */
  resetOnPropsChange?: boolean;
  /** Optional error context for better error tracking */
  errorContext?: string;
}

/**
 * State for the enhanced error boundary component
 */
interface EnhancedErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred */
  error: Error | null;
  /** Additional information about the error */
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced error boundary component with additional features
 * Catches JavaScript errors in its child component tree and displays a fallback UI
 */
class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when errors are caught
   */
  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Called when an error is caught
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log the error to our error handling system
    handleError(error, {
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.USER_INTERFACE,
      context: this.props.errorContext || 'EnhancedErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorInfo
      }
    });

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset error state when props change if resetOnPropsChange is true
   */
  componentDidUpdate(prevProps: EnhancedErrorBoundaryProps): void {
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      this.props.children !== prevProps.children
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    }
  }

  /**
   * Render the error fallback or children
   */
  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided, otherwise use default fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={() => {
            this.setState({
              hasError: false,
              error: null,
              errorInfo: null
            });
          }}
        />
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
