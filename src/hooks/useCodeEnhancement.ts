
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
 * with automatic sampling and throttling - optimized for minimal overhead
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
  
  // Only run this on mount
  useEffect(() => {
    // Higher sampling threshold - only monitor 10% of components
    sampledRef.current = Math.random() < (config.samplingRate * 0.5);
  }, []); // Empty deps array to only run on mount
  
  // If component is not in the sample, skip monitoring completely
  if (!sampledRef.current) return;
  
  const {
    complexity = 0,
    dependencies = [],
    hooks = [],
    childComponents = [],
    trackRenders = false, // Default to false to reduce overhead
    validateProps = false, // Default to false to reduce overhead
    trackPropChanges = false, // Default to false to reduce overhead
    priority = 'medium'
  } = options;
  
  // Only enable monitoring for high priority components or by random chance
  const priorityFactor = priority === 'high' ? 0.8 : priority === 'medium' ? 0.3 : 0.1;
  const shouldMonitor = Math.random() < (config.samplingRate * priorityFactor);
  
  if (!shouldMonitor) return;
  
  // Only use performance tracking if globally enabled and for high complexity components
  if (config.enablePerformanceTracking && (complexity > 1 || priority === 'high')) {
    usePerformanceTracking(componentName, {
      enabled: true,
      throttleInterval: config.throttleInterval * 2, // Double the throttle interval
      batchUpdates: config.batchUpdates
    });
  }
  
  // Only use render tracking if globally enabled and for high complexity or high priority components
  if (config.enableRenderTracking && trackRenders && (complexity > 2 || priority === 'high')) {
    useRenderTracking(componentName, {
      complexity,
      dependencies,
      hooks,
      childComponents,
      enabled: true,
      throttleInterval: config.throttleInterval * 2 // Double the throttle interval
    });
  }
  
  // Only use error prevention for validation if enabled and for complex components
  if ((config.enableValidation && validateProps) || 
      (config.enablePropTracking && trackPropChanges && complexity > 1)) {
    
    // Only pass in the props we need to track
    const propsToTrack = { complexity };
    
    useErrorPrevention(componentName, propsToTrack, {
      trackRenders: trackRenders && config.enableRenderTracking && complexity > 1,
      validateProps: validateProps && config.enableValidation,
      trackPropChanges: trackPropChanges && config.enablePropTracking && complexity > 1,
      throttleInterval: config.throttleInterval * 3 // Triple the throttle interval
    });
  }
  
  // Skip lifecycle logging to reduce console noise
}
