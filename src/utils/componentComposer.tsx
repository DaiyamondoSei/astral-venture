
import React from 'react';

/**
 * Creates a component composition from a sequence of higher-order components
 * 
 * @param components Array of higher-order components to compose
 * @returns A composed component that wraps the children with all HOCs
 */
export function composeComponents(components: React.FC<{children: React.ReactNode}>[]) {
  return ({ children }: { children: React.ReactNode }) => (
    components.reduceRight(
      (acc, Component) => <Component>{acc}</Component>,
      <>{children}</>
    )
  );
}

/**
 * Creates a provider composition from multiple context providers
 * 
 * @param providers Array of provider components with their props
 * @returns A composed provider that wraps the children with all providers
 */
export function composeProviders(
  providers: Array<{
    Provider: React.FC<{children: React.ReactNode} & any>;
    props?: Record<string, any>;
  }>
) {
  return ({ children }: { children: React.ReactNode }) => (
    providers.reduceRight(
      (acc, { Provider, props = {} }) => (
        <Provider {...props}>{acc}</Provider>
      ),
      <>{children}</>
    )
  );
}

/**
 * A higher-order component that adds error boundary functionality to any component
 * 
 * @param Component The component to wrap with an error boundary
 * @param ErrorFallback Optional custom error fallback component
 * @returns The component wrapped in an error boundary
 */
export function withErrorBoundary<P extends {}>(
  Component: React.ComponentType<P>,
  ErrorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
) {
  // Dynamically import ErrorBoundary to avoid circular dependencies
  const ErrorBoundaryComponent = React.lazy(() => import('@/components/ErrorBoundary'));
  
  return (props: P) => (
    <React.Suspense fallback={<div>Loading error boundary...</div>}>
      <ErrorBoundaryComponent fallback={ErrorFallback}>
        <Component {...props} />
      </ErrorBoundaryComponent>
    </React.Suspense>
  );
}

/**
 * A higher-order component that adds loading state handling
 * 
 * @param Component The component to enhance with loading state
 * @param LoadingComponent Optional custom loading component
 * @returns The component with loading state handling
 */
export function withLoading<P extends { isLoading?: boolean }>(
  Component: React.ComponentType<P>,
  LoadingComponent: React.ComponentType = () => (
    <div className="flex items-center justify-center p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-quantum-500"></div>
    </div>
  )
) {
  return (props: P) => {
    if (props.isLoading) {
      return <LoadingComponent />;
    }
    return <Component {...props} />;
  };
}
