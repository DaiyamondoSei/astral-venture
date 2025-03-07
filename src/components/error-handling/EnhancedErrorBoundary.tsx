
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error("Error caught by EnhancedErrorBoundary:", error, errorInfo);
  }

  componentDidUpdate(prevProps: Props): void {
    // If props changed and resetOnPropsChange is enabled, reset the error state
    if (
      this.state.hasError && 
      this.props.resetOnPropsChange && 
      prevProps.children !== this.props.children
    ) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-lg border border-red-200 bg-red-50 text-red-800">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="mb-4">{this.state.error?.message || "An unknown error occurred"}</p>
          <Button 
            variant="outline" 
            className="border-red-300 hover:bg-red-100"
            onClick={this.resetErrorBoundary}
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
