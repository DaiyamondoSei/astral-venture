
import { useEffect } from 'react';
import { usePerformanceTracking } from './usePerformanceTracking';
import { useRenderTracking } from './useRenderTracking';
import { useErrorPrevention } from './useErrorPrevention';
import { usePerfConfig } from './usePerfConfig';

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
  
  // Get global performance configuration
  const config = usePerfConfig();
  
  const {
    complexity = 0,
    dependencies = [],
    hooks = [],
    childComponents = [],
    trackRenders = true,
    validateProps = true,
    trackPropChanges = true
  } = options;
  
  // Only use performance tracking if globally enabled
  usePerformanceTracking(componentName, {
    enabled: config.enablePerformanceTracking
  });
  
  // Only use render tracking if globally enabled
  useRenderTracking(componentName, {
    complexity,
    dependencies,
    hooks,
    childComponents,
    enabled: config.enableRenderTracking
  });
  
  // Only use error prevention if globally enabled
  const props = { complexity, dependencies, hooks, childComponents };
  useErrorPrevention(componentName, props, {
    trackRenders: trackRenders && config.enableRenderTracking,
    validateProps: validateProps && config.enableValidation,
    trackPropChanges: trackPropChanges && config.enablePropTracking
  });
  
  // Log component lifecycle with less verbosity
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || !config.enableDebugLogging) return;
    
    // Only log component mounting for top-level components to reduce noise
    if (complexity > 2 || childComponents.length > 0) {
      console.debug(`[${componentName}] Component mounted`);
      
      return () => {
        console.debug(`[${componentName}] Component unmounted`);
      };
    }
  }, [componentName, complexity, childComponents, config.enableDebugLogging]);
}
