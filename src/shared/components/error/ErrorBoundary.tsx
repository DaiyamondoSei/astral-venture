
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorFallbackProps {
  error: Error;
  componentName?: string;
  resetErrorBoundary: () => void;
}

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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
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
      
      if (typeof fallback === 'function') {
        return fallback({
          error: this.state.error,
          componentName,
          resetErrorBoundary: this.resetErrorBoundary
        });
      }
      
      return fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export type { ErrorFallbackProps };
