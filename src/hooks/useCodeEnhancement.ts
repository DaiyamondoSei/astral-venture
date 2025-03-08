
import { useEffect } from 'react';
import { usePerformanceTracking } from './usePerformanceTracking';
import { useRenderTracking } from './useRenderTracking';
import { useErrorPrevention } from './useErrorPrevention';

interface CodeEnhancementOptions {
  complexity?: number;
  dependencies?: string[];
  hooks?: string[];
  childComponents?: string[];
  trackRenders?: boolean;
  validateProps?: boolean;
  trackPropChanges?: boolean;
}

/**
 * Unified hook for performance tracking, render tracking, and error prevention
 * 
 * @param componentName Name of the component using this hook
 * @param options Enhancement options and component metadata
 */
export function useCodeEnhancement(
  componentName: string, 
  options: CodeEnhancementOptions = {}
) {
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') return;
  
  const {
    complexity = 0,
    dependencies = [],
    hooks = [],
    childComponents = [],
    trackRenders = true,
    validateProps = true,
    trackPropChanges = true
  } = options;
  
  // Use performance tracking
  usePerformanceTracking(componentName);
  
  // Use render tracking
  useRenderTracking(componentName, {
    complexity,
    dependencies,
    hooks,
    childComponents
  });
  
  // Use error prevention
  const props = { complexity, dependencies, hooks, childComponents };
  useErrorPrevention(componentName, props, {
    trackRenders,
    validateProps,
    trackPropChanges
  });
  
  // Log component lifecycle
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.debug(`[${componentName}] Component mounted`);
    
    return () => {
      console.debug(`[${componentName}] Component unmounted`);
    };
  }, [componentName]);
}
