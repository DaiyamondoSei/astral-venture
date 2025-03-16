
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallbackProps } from '@/utils/errorHandling/types';

interface Props {
  fallback: React.ReactNode | ((props: ErrorFallbackProps) => React.ReactNode);
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary catches errors in child components and displays fallback UI
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback, componentName } = this.props;
      
      // Handle fallback as a render function
      if (typeof fallback === 'function') {
        return fallback({
          error: this.state.error,
          componentName,
          resetErrorBoundary: this.resetErrorBoundary
        });
      }
      
      // Handle fallback as a ReactNode
      return fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
