
import React, { Component, ErrorInfo, ReactNode, useCallback, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

// Error types for more specific handling
export type ErrorType = 
  | 'network' 
  | 'api' 
  | 'auth' 
  | 'validation' 
  | 'ui' 
  | 'unknown';

// Props for the main component
interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo, errorType: ErrorType) => void;
  onReset?: () => void;
  resetKeys?: any[];
}

// State for the error boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: ErrorType;
}

// Props for the fallback component
export interface FallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorType: ErrorType;
  resetErrorBoundary: () => void;
}

/**
 * Enhanced Error Boundary Component
 * 
 * Provides detailed error handling with typed error categorization
 * and automatic recovery for network errors
 */
class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown'
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so next render will show fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Determine error type for specific handling
    const errorType = this.determineErrorType(error);
    
    // Update state with error details
    this.setState({ errorInfo, errorType });
    
    // Log error to console and call onError callback
    console.error('EnhancedErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorType);
    }
    
    // Attempt automatic recovery for network errors after a delay
    if (errorType === 'network') {
      setTimeout(() => {
        this.resetErrorBoundary();
        toast({
          title: "Reconnecting",
          description: "Attempting to reconnect to the server...",
          duration: 3000
        });
      }, 5000);
    }
  }

  // Reset the error boundary to its initial state
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown'
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  // Determine the type of error for more specific handling
  determineErrorType(error: Error): ErrorType {
    // Check for network errors
    if (
      error.message.includes('network') ||
      error.message.includes('internet') ||
      error.message.includes('offline') ||
      error.message.includes('connection') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('fetch')
    ) {
      return 'network';
    }
    
    // Check for API errors
    if (
      error.message.includes('API') ||
      error.message.includes('status code') ||
      error.message.includes('response') ||
      error.message.includes('endpoint')
    ) {
      return 'api';
    }
    
    // Check for auth errors
    if (
      error.message.includes('authentication') ||
      error.message.includes('authorization') ||
      error.message.includes('login') ||
      error.message.includes('permission') ||
      error.message.includes('token') ||
      error.message.includes('session')
    ) {
      return 'auth';
    }
    
    // Check for validation errors
    if (
      error.message.includes('validation') ||
      error.message.includes('invalid') ||
      error.message.includes('required') ||
      error.message.includes('format')
    ) {
      return 'validation';
    }
    
    // Check for UI/rendering errors
    if (
      error.message.includes('render') ||
      error.message.includes('component') ||
      error.message.includes('element') ||
      error.message.includes('React')
    ) {
      return 'ui';
    }
    
    // Default to unknown
    return 'unknown';
  }

  componentDidUpdate(prevProps: EnhancedErrorBoundaryProps) {
    // Reset the error boundary if any reset keys have changed
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])
    ) {
      this.resetErrorBoundary();
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            errorType={this.state.errorType}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        );
      }
      
      // Use default fallback component
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorType={this.state.errorType}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    // When there's no error, render children
    return this.props.children;
  }
}

/**
 * Default error fallback component with specific error type messages
 */
const DefaultErrorFallback: React.FC<FallbackProps> = ({
  error,
  errorType,
  resetErrorBoundary
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const getErrorTitle = useCallback(() => {
    switch (errorType) {
      case 'network':
        return 'Connection Error';
      case 'api':
        return 'API Error';
      case 'auth':
        return 'Authentication Error';
      case 'validation':
        return 'Validation Error';
      case 'ui':
        return 'UI Rendering Error';
      default:
        return 'Unexpected Error';
    }
  }, [errorType]);
  
  const getErrorMessage = useCallback(() => {
    switch (errorType) {
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'api':
        return 'There was a problem communicating with our services.';
      case 'auth':
        return 'Your session may have expired. Please try logging in again.';
      case 'validation':
        return 'Some information is invalid or missing.';
      case 'ui':
        return 'The application encountered a rendering issue.';
      default:
        return 'An unexpected error occurred in the application.';
    }
  }, [errorType]);
  
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-black/20 backdrop-blur-md">
      <h2 className="text-xl font-display text-white mb-2">
        {getErrorTitle()}
      </h2>
      <p className="text-white/70 mb-4 text-center">
        {getErrorMessage()}
      </p>
      
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-quantum-600 hover:bg-quantum-500 text-white rounded-md transition-colors"
        >
          Try Again
        </button>
        
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-transparent border border-quantum-600 text-white rounded-md hover:bg-quantum-800/50 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {showDetails && (
        <div className="w-full max-w-md bg-black/40 p-4 rounded overflow-auto text-xs text-white/60 font-mono">
          <p className="mb-2">{error.name}: {error.message}</p>
          <p>{error.stack}</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedErrorBoundary;
