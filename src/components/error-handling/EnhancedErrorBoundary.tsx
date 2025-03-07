
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { captureException } from '@/utils/errorHandling';

// Define proper error context type
interface ErrorContext {
  componentName: string;
  location: string;
  additionalInfo?: Record<string, any>;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context: ErrorContext;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { context, onError } = this.props;
    
    // Log error with context
    console.error(`Error in ${context.componentName}:`, error, errorInfo);
    
    // Show toast notification
    toast({
      title: `Error in ${context.componentName}`,
      description: error.message || 'An unknown error occurred',
      variant: "destructive"
    });
    
    // Report error to error tracking service
    captureException(error, context.componentName);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-medium mb-2">
            Something went wrong in {this.props.context.componentName}
          </h3>
          <p className="text-red-600 text-sm">
            {this.state.error?.message || 'An unknown error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
