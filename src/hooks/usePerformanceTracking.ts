
import { useCallback, useEffect, useRef } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import type { PerformanceTrackingOptions } from '@/types/performance';

/**
 * Hook for tracking component performance
 * 
 * @param componentName Name of the component to track
 * @param options Performance tracking options
 */
export function usePerformanceTracking(
  componentName: string,
  options: PerformanceTrackingOptions = {}
) {
  const renderStartTime = useRef<number | null>(null);
  const renderCount = useRef(0);

  // Record render start time
  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current++;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - (renderStartTime.current || endTime);
      
      if (renderStartTime.current !== null) {
        performanceMonitor.recordRender(componentName, renderTime);
        
        if (options.logSlowRenders && renderTime > (options.slowRenderThreshold || 16)) {
          console.warn(
            `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
          );
        }
      }
    };
  });

  // Auto-start monitoring if specified
  useEffect(() => {
    if (options.autoStart) {
      performanceMonitor.startMonitoring();
    }

    // Clean up on component unmount
    return () => {
      // Only record unmount if we're tracking this component
      if (renderCount.current > 0) {
        performanceMonitor.recordUnmount(componentName);
      }
    };
  }, [componentName, options.autoStart]);

  const recordInteraction = useCallback((interactionName: string, duration: number) => {
    performanceMonitor.recordEvent('interaction', `${componentName}:${interactionName}`, duration);
  }, [componentName]);

  return {
    recordInteraction,
    startMonitoring: performanceMonitor.startMonitoring,
    stopMonitoring: performanceMonitor.stopMonitoring,
    resetMetrics: performanceMonitor.resetMetrics,
    getMetrics: () => performanceMonitor.getComponentMetrics(componentName)
  };
}

export default usePerformanceTracking;
