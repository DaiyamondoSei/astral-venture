
import React, { ComponentType, ReactNode, memo, useCallback, useState } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

interface WithErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Higher-order component that wraps a component in an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Higher-order component that applies memoization to a component
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  const MemoizedComponent = memo(Component, propsAreEqual);
  return function WithMemoComponent(props: P) {
    return <MemoizedComponent {...props} />;
  };
}

/**
 * Higher-order component that combines multiple HOCs
 */
export function compose<P extends object>(
  ...hocs: Array<(Component: ComponentType<P>) => ComponentType<P>>
): (Component: ComponentType<P>) => ComponentType<P> {
  return (Component) => {
    return hocs.reduceRight((acc, hoc) => hoc(acc), Component);
  };
}

/**
 * Creates a component with built-in error handling and performance optimization
 */
export function createOptimizedComponent<P extends object>(
  Component: ComponentType<P>,
  options: {
    withErrorBoundary?: boolean;
    errorFallback?: ReactNode;
    withMemo?: boolean;
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean;
  } = {}
) {
  const {
    withErrorBoundary: withErrorBoundaryOption = true,
    errorFallback,
    withMemo: withMemoOption = true,
    propsAreEqual
  } = options;
  
  let OptimizedComponent = Component;
  
  // Apply HOCs based on options
  if (withMemoOption) {
    OptimizedComponent = withMemo(OptimizedComponent, propsAreEqual);
  }
  
  if (withErrorBoundaryOption) {
    OptimizedComponent = withErrorBoundary(OptimizedComponent, errorFallback);
  }
  
  return OptimizedComponent;
}
