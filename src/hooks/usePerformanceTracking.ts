import { useEffect, useRef } from 'react';
import { performanceMetrics } from '@/utils/performance/performanceMonitor';

export interface UsePerformanceTrackingOptions {
  enabled?: boolean;
  trackRenders?: boolean;
  trackInteractions?: boolean;
  componentName?: string;
}

/**
 * Hook for tracking component performance
 */
export function usePerformanceTracking(options: UsePerformanceTrackingOptions = {}) {
  const {
    enabled = true,
    trackRenders = true,
    trackInteractions = true,
    componentName
  } = options;
  
  const renderStartTime = useRef<number>(0);
  const componentNameRef = useRef<string>(
    componentName || 
    // Try to get component name from the call stack
    new Error().stack?.split('\n')[2]?.trim().split(' ')[1] ||
    'UnknownComponent'
  );
  
  // Track component mount and render
  useEffect(() => {
    if (!enabled || !trackRenders) return;
    
    // Calculate render time on mount
    const renderTime = performance.now() - renderStartTime.current;
    
    // Only record if time is valid
    if (renderTime > 0 && renderTime < 10000) { // Sanity check for unrealistic times
      performanceMetrics.recordRender(componentNameRef.current, renderTime);
    }
    
    // Track subsequent renders
    return () => {
      renderStartTime.current = performance.now();
    };
  });
  
  // Set initial render start time
  if (renderStartTime.current === 0) {
    renderStartTime.current = performance.now();
  }
  
  const trackInteraction = (interactionName: string) => {
    return (metadata?: Record<string, unknown>) => {
      if (!enabled || !trackInteractions) return () => {};
      
      const startTime = performance.now();
      
      return () => {
        const duration = performance.now() - startTime;
        performanceMetrics.recordInteraction(
          componentNameRef.current,
          interactionName,
          duration,
          metadata
        );
      };
    };
  };
  
  return {
    trackInteraction,
    componentName: componentNameRef.current
  };
}
