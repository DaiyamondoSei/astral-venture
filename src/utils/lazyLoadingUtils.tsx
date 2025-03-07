
import React, { Suspense, lazy, ComponentType } from 'react';

/**
 * Options for the lazy loading component
 */
export interface LazyLoadOptions {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  retryCount?: number;
  onError?: (error: Error) => void;
}

/**
 * Create a lazy-loaded component with custom fallback and error handling
 * @param importFunction Dynamic import function for the component
 * @param options Customization options
 * @returns Lazy-loaded component with proper error boundaries
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.ComponentType<React.ComponentProps<T>> {
  const {
    fallback = <DefaultLoadingFallback />,
    errorFallback = <DefaultErrorFallback />,
    retryCount = 1,
    onError
  } = options;

  // Create the lazy component with retry logic
  const LazyComponent = lazy(() => {
    let attempts = 0;

    const loadComponent = async (): Promise<{ default: T }> => {
      try {
        return await importFunction();
      } catch (error) {
        attempts++;
        if (attempts <= retryCount) {
          console.warn(`Retrying component load (${attempts}/${retryCount})...`);
          return loadComponent();
        }
        
        // Log the error and call the onError callback
        console.error('Failed to load component after retries:', error);
        if (onError && error instanceof Error) {
          onError(error);
        }
        
        throw error;
      }
    };

    return loadComponent();
  });

  // Return the component with suspense and error boundary
  return (props: React.ComponentProps<T>) => (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * ErrorBoundary component for the lazy-loaded components
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error loading component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Default loading fallback component
 */
const DefaultLoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[200px]">
    <div className="animate-pulse text-white/50">Loading...</div>
  </div>
);

/**
 * Default error fallback component
 */
const DefaultErrorFallback = () => (
  <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] text-center p-4">
    <div className="text-red-500 mb-2">Failed to load component</div>
    <button 
      onClick={() => window.location.reload()} 
      className="px-4 py-2 bg-quantum-600 text-white rounded-md hover:bg-quantum-500 transition-colors"
    >
      Retry
    </button>
  </div>
);
