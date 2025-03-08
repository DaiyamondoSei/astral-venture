
import React from 'react';
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';

/**
 * Higher-order component that adds performance tracking to any component
 * 
 * @param WrappedComponent Component to track
 * @param options Configuration options
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    trackProps?: boolean;
    trackState?: boolean;
    componentName?: string;
  } = {}
): React.FC<P> {
  const {
    trackProps = true,
    trackState = false,
    componentName = WrappedComponent.displayName || WrappedComponent.name || 'UnknownComponent'
  } = options;

  // Create a wrapper component that tracks performance
  const WithPerformanceTracking: React.FC<P> = (props) => {
    usePerformanceTracking(
      componentName,
      trackProps ? props as Record<string, any> : undefined,
      undefined // We don't have access to internal state in the HOC pattern
    );

    return <WrappedComponent {...props} />;
  };

  // Set display name for better debugging
  WithPerformanceTracking.displayName = `WithPerformanceTracking(${componentName})`;

  return WithPerformanceTracking;
};
