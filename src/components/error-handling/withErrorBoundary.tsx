
import React, { ComponentType, forwardRef, ForwardedRef } from 'react';
import ErrorBoundary from './ErrorBoundary';
import ErrorFallback from './ErrorFallback';
import { usePerformance } from '@/contexts/PerformanceContext';
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';

interface WithErrorBoundaryOptions {
  fallback?: React.ReactNode;
  errorComponent?: ComponentType<{ error: Error; resetErrorBoundary: () => void; showDetails?: boolean }>;
  trackErrors?: boolean;
  trackPerformance?: boolean;
  logErrors?: boolean;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

/**
 * Higher-order component that wraps a component with an error boundary
 * and performance tracking
 * 
 * @param Component - The component to wrap
 * @param options - Configuration options
 * @returns The wrapped component
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): ComponentType<P> {
  const {
    fallback,
    errorComponent: ErrorComponent = ErrorFallback,
    trackErrors = true,
    trackPerformance = true,
    logErrors = true,
    onError
  } = options;

  // Get the display name for the component
  const componentName = Component.displayName || Component.name || 'Component';

  // Create the wrapper component
  const WrappedComponent = forwardRef<unknown, P>((props, ref) => {
    // Use performance tracking if enabled
    const performance = usePerformance();
    const { trackInteraction } = usePerformanceTracking({
      componentName,
      trackRenders: trackPerformance,
      trackMountTime: trackPerformance,
      trackUpdateTime: trackPerformance,
      logSlowRenders: trackPerformance && performance.config.enableDetailedLogging
    });

    // Create a custom error handler
    const handleError = (error: Error, info: React.ErrorInfo) => {
      // Log the error if enabled
      if (logErrors) {
        console.error(`Error in ${componentName}:`, error);
        console.error('Component stack:', info.componentStack);
      }

      // Track the error if enabled
      if (trackErrors && trackPerformance) {
        performance.trackMetric('component_error', 1, {
          componentName,
          errorMessage: error.message,
          errorName: error.name
        });
      }

      // Call the custom error handler if provided
      if (onError) {
        onError(error, info);
      }
    };

    // Create the fallback element
    const errorFallback = (errorProps: { error: Error; resetErrorBoundary: () => void }) => (
      <ErrorComponent {...errorProps} />
    );

    return (
      <ErrorBoundary
        fallback={fallback || errorFallback}
        onError={handleError}
        componentName={componentName}
      >
        <Component {...props} ref={ref} />
      </ErrorBoundary>
    );
  });

  // Set the display name for the wrapped component
  WrappedComponent.displayName = `withErrorBoundary(${componentName})`;

  return WrappedComponent as ComponentType<P>;
}

export default withErrorBoundary;
