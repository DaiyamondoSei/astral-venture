
import React, { lazy, Suspense } from 'react';

/**
 * Creates an optimized lazy-loaded sacred geometry component
 * @param importFn Import function that loads the component
 * @param LoadingComponent Optional component to show while loading
 */
export function createLazyGeometryComponent<P = {}>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  LoadingComponent: React.ComponentType | null = null
): React.FC<P> {
  // Create the lazy component
  const LazyComponent = lazy(importFn);
  
  // Create a simple loading placeholder if none provided
  const DefaultLoadingComponent = () => (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-quantum-500/30 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border border-quantum-400/60"></div>
      </div>
    </div>
  );
  
  const Fallback = LoadingComponent || DefaultLoadingComponent;
  
  // Return a component that handles loading state
  return (props: P) => (
    <Suspense fallback={<Fallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Pre-loads a component in the background without rendering it
 * Call this for routes/components that will likely be needed soon
 */
export function preloadGeometryComponent(
  importFn: () => Promise<{ default: React.ComponentType<any> }>
): void {
  // Use requestIdleCallback to load during idle time if available
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      importFn().catch(e => console.warn('Failed to preload component:', e));
    });
  } else {
    // Fallback to setTimeout
    setTimeout(() => {
      importFn().catch(e => console.warn('Failed to preload component:', e));
    }, 1000);
  }
}

/**
 * Create optimized lazy-loaded versions of sacred geometry components
 */
export const LazyMetatronsCube = createLazyGeometryComponent(() => 
  import('../components/sacred-geometry/MetatronsCube')
);

export const LazyMetatronsBackground = createLazyGeometryComponent(() => 
  import('../components/sacred-geometry/components/MetatronsBackground')
);

// Preload key geometry components during app initialization
export const preloadKeyGeometryComponents = (): void => {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      // Preload in sequence to avoid overwhelming network
      import('../components/sacred-geometry/MetatronsCube')
        .then(() => import('../components/sacred-geometry/components/MetatronsBackground'))
        .then(() => import('../components/sacred-geometry/components/GeometryNode'))
        .catch(e => console.warn('Failed to preload geometry components:', e));
    }, { timeout: 5000 });
  }
};
