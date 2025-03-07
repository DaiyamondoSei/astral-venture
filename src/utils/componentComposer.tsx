
import React, { ComponentType, forwardRef } from 'react';

/**
 * Adds performance optimizations and type safety to components
 */
export function optimizeComponent<P extends object>(
  Component: ComponentType<P>,
  options?: {
    displayName?: string;
    memo?: boolean;
    propsAreEqual?: (prevProps: P, nextProps: P) => boolean;
  }
): React.MemoExoticComponent<ComponentType<P>> | ComponentType<P> {
  const { displayName, memo = true, propsAreEqual } = options || {};
  
  // Set display name for better debugging
  if (displayName) {
    Component.displayName = displayName;
  }
  
  // Apply React.memo for performance
  if (memo) {
    return React.memo(Component, propsAreEqual);
  }
  
  return Component;
}

/**
 * Transforms a component with common higher-order patterns
 */
export function enhanceComponent<P extends object>(
  Component: ComponentType<P>,
  options?: {
    withRef?: boolean;
    withErrorBoundary?: boolean;
    withSuspense?: boolean;
    fallback?: React.ReactNode;
  }
): ComponentType<P> {
  const { withRef = false, withErrorBoundary = false, withSuspense = false, fallback } = options || {};
  
  let EnhancedComponent = Component;
  
  // Add forwardRef if requested
  if (withRef) {
    EnhancedComponent = forwardRef<unknown, P>((props, ref) => 
      React.createElement(Component, { ...props, ref } as any)
    ) as unknown as ComponentType<P>;
  }
  
  // Add error boundary if requested
  if (withErrorBoundary) {
    const OriginalComponent = EnhancedComponent;
    EnhancedComponent = (props: P) => (
      <ErrorBoundaryWrapper>
        <OriginalComponent {...props} />
      </ErrorBoundaryWrapper>
    );
  }
  
  // Add suspense if requested
  if (withSuspense) {
    const OriginalComponent = EnhancedComponent;
    EnhancedComponent = (props: P) => (
      <React.Suspense fallback={fallback || <div>Loading...</div>}>
        <OriginalComponent {...props} />
      </React.Suspense>
    );
  }
  
  return EnhancedComponent;
}

/**
 * Simple error boundary wrapper
 */
const ErrorBoundaryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This is a placeholder - in a real implementation, we would use an actual ErrorBoundary component
  return <>{children}</>;
};
