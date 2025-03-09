
import { useEffect, useRef } from 'react';
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
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Unified hook for performance tracking, render tracking, and error prevention
 * with automatic sampling and throttling
 * 
 * @param componentName Name of the component using this hook
 * @param options Enhancement options and component metadata
 */
export function useCodeEnhancement(
  componentName: string, 
  options: CodeEnhancementOptions = {}
) {
  // Skip all monitoring in production for best performance
  if (process.env.NODE_ENV !== 'development') return;
  
  // Get global performance configuration
  const config = usePerfConfig();
  const sampledRef = useRef<boolean>(false);
  
  // Determine if this component should be monitored based on sampling rate
  useEffect(() => {
    sampledRef.current = Math.random() < config.samplingRate;
  }, [config.samplingRate, componentName]);
  
  // If component is not in the sample, skip monitoring
  if (!sampledRef.current) return;
  
  const {
    complexity = 0,
    dependencies = [],
    hooks = [],
    childComponents = [],
    trackRenders = true,
    validateProps = true,
    trackPropChanges = true,
    priority = 'medium'
  } = options;
  
  // Only enable monitoring based on priority and max components limit
  const priorityFactor = priority === 'high' ? 1 : priority === 'medium' ? 0.6 : 0.3;
  const shouldMonitor = Math.random() < (config.samplingRate * priorityFactor);
  
  if (!shouldMonitor) return;
  
  // Only use performance tracking if globally enabled
  usePerformanceTracking(componentName, {
    enabled: config.enablePerformanceTracking,
    throttleInterval: config.throttleInterval,
    batchUpdates: config.batchUpdates
  });
  
  // Only use render tracking if globally enabled
  useRenderTracking(componentName, {
    complexity,
    dependencies,
    hooks,
    childComponents,
    enabled: config.enableRenderTracking && trackRenders,
    throttleInterval: config.throttleInterval
  });
  
  // Only use error prevention if globally enabled
  const props = { complexity, dependencies, hooks, childComponents };
  useErrorPrevention(componentName, props, {
    trackRenders: trackRenders && config.enableRenderTracking,
    validateProps: validateProps && config.enableValidation,
    trackPropChanges: trackPropChanges && config.enablePropTracking,
    throttleInterval: config.throttleInterval,
    batchUpdates: config.batchUpdates
  });
  
  // Log component lifecycle with less verbosity
  useEffect(() => {
    if (!config.enableDebugLogging) return;
    
    // Only log component mounting for high-complexity components
    if (complexity > 2 || priority === 'high') {
      console.debug(`[${componentName}] Component mounted`);
      
      return () => {
        console.debug(`[${componentName}] Component unmounted`);
      };
    }
  }, [componentName, complexity, priority, config.enableDebugLogging]);
}
