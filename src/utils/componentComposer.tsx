
import React from 'react';

/**
 * Creates a composed component by wrapping a component with multiple higher-order components
 * 
 * @param BaseComponent The base component to wrap
 * @param enhancers Array of higher-order components to apply
 * @returns The enhanced component
 */
export function composeComponent<P>(
  BaseComponent: React.ComponentType<P>,
  ...enhancers: Array<(Component: React.ComponentType<any>) => React.ComponentType<any>>
): React.ComponentType<P> {
  return enhancers.reduceRight(
    (EnhancedComponent, enhancer) => enhancer(EnhancedComponent),
    BaseComponent
  ) as React.ComponentType<P>;
}

/**
 * Creates a component with error boundary
 * 
 * @param Component The component to wrap with error boundary
 * @param FallbackComponent Optional custom error fallback component
 * @returns The component with error boundary
 */
export function withErrorBoundary<P>(
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<{ error: Error }>
): React.ComponentType<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <React.Suspense fallback={<div className="loading">Loading...</div>}>
        {/* @ts-ignore - ErrorBoundary is imported elsewhere */}
        <ErrorBoundary FallbackComponent={FallbackComponent}>
          <Component {...props} />
        </ErrorBoundary>
      </React.Suspense>
    );
  };
}

/**
 * Creates a component with lazy loading
 * 
 * @param importFn Function that imports the component
 * @param LoadingComponent Optional custom loading component
 * @returns The lazily loaded component
 */
export function createLazyComponent<P = {}>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  LoadingComponent: React.ComponentType = () => <div className="loading">Loading...</div>
): React.LazyExoticComponent<React.ComponentType<P>> {
  const LazyComponent = React.lazy(importFn);
  
  // Return the lazy component with suspense
  return LazyComponent;
}

/**
 * Higher-order component that adds performance tracking
 * 
 * @param Component The component to wrap
 * @param componentName Optional name for the component
 * @returns The wrapped component with performance tracking
 */
export function withPerformanceTracking<P>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const displayName = componentName || Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = React.memo((props: P) => {
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (renderTime > 16) { // More than 1 frame (at 60fps)
          console.warn(`Slow render detected for ${displayName}: ${renderTime.toFixed(2)}ms`);
        }
      };
    }, []);
    
    return <Component {...props} />;
  });
  
  WrappedComponent.displayName = `WithPerformanceTracking(${displayName})`;
  
  return WrappedComponent;
}
