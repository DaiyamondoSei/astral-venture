
import React from 'react';

/**
 * Custom equality check for React.memo() to efficiently check props equality.
 * This is useful for complex components with deeply nested props objects.
 */
export function arePropsEqual<T>(
  prevProps: Readonly<T>, 
  nextProps: Readonly<T>, 
  propsToIgnore: string[] = []
): boolean {
  if (prevProps === nextProps) {
    return true;
  }
  
  const prevKeys = Object.keys(prevProps) as Array<keyof T>;
  const nextKeys = Object.keys(nextProps) as Array<keyof T>;
  
  // Check if the number of keys is different
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }
  
  // Check each key
  return prevKeys.every(key => {
    const keyString = key as string;
    // Skip keys that should be ignored
    if (propsToIgnore.includes(keyString)) {
      return true;
    }
    
    const prevValue = prevProps[key];
    const nextValue = nextProps[key];
    
    // Check for functions - compare by reference
    if (typeof prevValue === 'function' && typeof nextValue === 'function') {
      return true; // Always return true for functions to avoid unnecessary re-renders
    }
    
    // Special case for event handlers (functions that start with 'on')
    if (typeof keyString === 'string' && keyString.startsWith('on') && 
        typeof prevValue === 'function' && typeof nextValue === 'function') {
      return true;
    }
    
    // Handle arrays
    if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
      if (prevValue.length !== nextValue.length) {
        return false;
      }
      
      // For simple arrays of primitives
      if (prevValue.every(item => 
        typeof item === 'string' || 
        typeof item === 'number' || 
        typeof item === 'boolean'
      )) {
        return prevValue.every((val, index) => val === nextValue[index]);
      }
      
      // For complex arrays, just check reference
      return prevValue === nextValue;
    }
    
    // Handle objects
    if (
      typeof prevValue === 'object' && 
      prevValue !== null && 
      typeof nextValue === 'object' && 
      nextValue !== null
    ) {
      return prevValue === nextValue; // Compare by reference for objects
    }
    
    // For all other values, do a strict equality check
    return prevValue === nextValue;
  });
}

/**
 * Creates a memoized component with custom equality check
 * @param Component The component to memoize
 * @param propsToIgnore Array of prop names to ignore in equality check
 */
export function createMemoizedComponent<P>(
  Component: React.ComponentType<P>,
  propsToIgnore: string[] = []
): React.MemoExoticComponent<React.ComponentType<P>> {
  return React.memo(Component, (prevProps, nextProps) => 
    arePropsEqual(prevProps, nextProps, propsToIgnore)
  );
}

/**
 * Creates a lazy-loaded component that only loads when needed
 * @param importFn Function that imports the component
 * @param fallback Optional fallback component to show during loading
 */
export function createLazyComponent<P>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  fallback: React.ReactNode = null
): React.FC<P> {
  const LazyComponent = React.lazy(importFn);
  
  return (props: P) => (
    <React.Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
}
