
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorCategory, ErrorSeverity, handleError } from '@/utils/errorHandling';

/**
 * Properties for the SafeErrorBoundary component
 */
interface SafeErrorBoundaryProps {
  /**
   * Content to render inside the boundary
   */
  children: ReactNode;
  
  /**
   * Component to render when an error occurs
   */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  
  /**
   * Context identifier for error tracking
   */
  context?: string;
  
  /**
   * Error category for classification
   */
  category?: ErrorCategory;
  
  /**
   * Error severity level
   */
  severity?: ErrorSeverity;
  
  /**
   * Whether to show a toast notification
   */
  showToast?: boolean;
  
  /**
   * Function to call when an error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /**
   * Additional metadata for error logging
   */
  metadata?: Record<string, unknown>;
}

/**
 * State for the SafeErrorBoundary component
 */
interface SafeErrorBoundaryState {
  /**
   * Whether an error has occurred
   */
  hasError: boolean;
  
  /**
   * The error that occurred
   */
  error: Error | null;
}

/**
 * Enhanced error boundary component with standardized error handling
 * 
 * @example
 * <SafeErrorBoundary 
 *   context="UserDashboard" 
 *   category={ErrorCategory.USER_INTERFACE}
 *   fallback={<p>Something went wrong. <button onClick={reset}>Try again</button></p>}
 * >
 *   <UserDashboard />
 * </SafeErrorBoundary>
 */
export class SafeErrorBoundary extends Component<SafeErrorBoundaryProps, SafeErrorBoundaryState> {
  constructor(props: SafeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SafeErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { 
      context = 'UI Component', 
      category = ErrorCategory.USER_INTERFACE,
      severity = ErrorSeverity.ERROR,
      showToast = true,
      onError,
      metadata
    } = this.props;

    // Use centralized error handling
    handleError(error, {
      context,
      category,
      severity,
      showToast,
      metadata: {
        ...metadata,
        componentStack: errorInfo.componentStack
      }
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { children, fallback } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error) {
      if (typeof fallback === 'function') {
        return fallback(error, this.resetErrorBoundary);
      }
      
      if (fallback) {
        return fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 border border-red-200 rounded bg-red-50 text-red-800">
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="mb-3 text-sm">{error.message || 'An unexpected error occurred'}</p>
          <button
            onClick={this.resetErrorBoundary}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook version of the error boundary for function components
 * 
 * @param props - Error boundary props
 * @returns JSX element wrapped in error boundary
 * 
 * @example
 * const MyComponent = () => {
 *   return withErrorBoundary(
 *     <ContentComponent />,
 *     {
 *       context: 'ContentComponent',
 *       fallback: <ErrorState />
 *     }
 *   );
 * };
 */
export function withErrorBoundary(
  children: ReactNode,
  props: Omit<SafeErrorBoundaryProps, 'children'>
): JSX.Element {
  return (
    <SafeErrorBoundary {...props}>
      {children}
    </SafeErrorBoundary>
  );
}

export default SafeErrorBoundary;
