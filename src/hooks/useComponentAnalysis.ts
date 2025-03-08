
import { useEffect, useRef } from 'react';
import { componentAnalyzer } from '@/utils/performance/ComponentAnalyzer';

/**
 * Hook for registering a component with the ComponentAnalyzer
 * 
 * @param componentName Name of the component
 * @param metadata Component metadata for analysis
 */
export function useComponentAnalysis(
  componentName: string,
  metadata: {
    complexity?: number;
    dependencies?: string[];
    hooks?: string[];
    parentComponents?: string[];
    childComponents?: string[];
  } = {}
): void {
  // Skip in production
  if (process.env.NODE_ENV !== 'development') return;
  
  const {
    complexity = 0,
    dependencies = [],
    hooks = [],
    parentComponents = [],
    childComponents = []
  } = metadata;
  
  const renderCountRef = useRef(0);
  
  // Register the component on mount
  useEffect(() => {
    componentAnalyzer.registerComponent({
      name: componentName,
      complexity,
      dependencies,
      hooks,
      parentComponents,
      childComponents,
    });
    
    // Cleanup on unmount
    return () => {
      // We don't currently have a method to unregister
      // But we could track mount/unmount cycles
    };
  }, [componentName, complexity, dependencies, hooks, parentComponents, childComponents]);
  
  // Track renders
  renderCountRef.current += 1;
  
  // Update render count after each render
  useEffect(() => {
    componentAnalyzer.updateComponent(componentName, {
      renderCount: renderCountRef.current
    });
  });
}
