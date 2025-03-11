
import { useRef, useEffect, useMemo } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';
import { metricsCollector } from '@/utils/performance/metricsCollector';

/**
 * Options for performance tracking hook
 */
export interface PerformanceTrackingOptions {
  componentName: string;
  enableMetrics?: boolean;
  trackInteractions?: boolean;
  trackRenders?: boolean;
  throttleInterval?: number;
}

/**
 * Hook for tracking component performance
 */
export function usePerformanceTracking(options: PerformanceTrackingOptions) {
  const { 
    componentName, 
    enableMetrics = true,
    trackInteractions = true,
    trackRenders = true,
    throttleInterval = 0
  } = options;
  
  const { deviceCapability, config } = usePerformance();
  const startTimeRef = useRef<number>(0);
  const elementRef = useRef<HTMLElement>(null);
  const shouldTrack = enableMetrics && config?.enablePerformanceTracking;

  // Set up performance observer for tracking render metrics
  useEffect(() => {
    if (!shouldTrack || !trackRenders || !componentName) return;

    // Configure a performance observer to track measures
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.startsWith(`render-${componentName}`)) {
          metricsCollector.trackComponentMetric(
            componentName,
            entry.name,
            entry.duration,
            'render'
          );
        }
      });
    });

    // Start observing render measurements
    observer.observe({ entryTypes: ['measure'] });
    
    // Clean up observer on unmount
    return () => observer.disconnect();
  }, [enableMetrics, componentName, shouldTrack, trackRenders, config?.enablePerformanceTracking]);

  // Create API for the component to track its performance
  const api = useMemo(() => ({
    // Start timing a render/operation
    startTiming: () => {
      if (!shouldTrack) return;
      startTimeRef.current = performance.now();
    },
    
    // End timing and record the metric
    endTiming: (metricName = 'render') => {
      if (!shouldTrack || !startTimeRef.current) return;
      
      const duration = performance.now() - startTimeRef.current;
      metricsCollector.trackComponentMetric(componentName, metricName, duration);
      startTimeRef.current = 0;
    },
    
    // Track an interaction event (returns cleanup function)
    trackInteraction: (name: string) => {
      if (!shouldTrack || !trackInteractions) return () => {};
      
      const start = performance.now();
      return () => {
        const duration = performance.now() - start;
        metricsCollector.trackComponentMetric(
          componentName, 
          name, 
          duration, 
          'interaction'
        );
      };
    },
    
    // DOM ref for the component
    ref: elementRef
  }), [componentName, shouldTrack, trackInteractions]);

  return api;
}

export default usePerformanceTracking;
