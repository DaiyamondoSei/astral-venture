
import { useCallback, useEffect, useRef } from 'react';

// Import types
export interface PerformanceTrackingOptions {
  /** Automatically start monitoring when component mounts */
  autoStart?: boolean;
  /** Log slow renders to console */
  logSlowRenders?: boolean;
  /** Threshold in ms for what's considered a slow render */
  slowRenderThreshold?: number;
}

// Consistent interface for performance monitoring
export interface PerformanceMonitor {
  recordRender: (componentName: string, renderTime: number) => void;
  recordUnmount: (componentName: string) => void;
  recordEvent: (category: string, name: string, duration: number) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  resetMetrics: () => void;
  getComponentMetrics: (componentName: string) => ComponentMetrics;
}

export interface ComponentMetrics {
  component: string;
  averageRenderTime: number;
  totalRenders: number;
  slowRenders: number;
}

// Placeholder for performance monitor functions until we implement them fully
const performanceMonitor: PerformanceMonitor = {
  recordRender: (componentName: string, renderTime: number) => {
    console.debug(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
  },
  
  recordUnmount: (componentName: string) => {
    console.debug(`[Performance] ${componentName} unmounted`);
  },
  
  recordEvent: (category: string, name: string, duration: number) => {
    console.debug(`[Performance] ${category}:${name} took ${duration.toFixed(2)}ms`);
  },
  
  startMonitoring: () => {
    console.debug('[Performance] Started monitoring');
  },
  
  stopMonitoring: () => {
    console.debug('[Performance] Stopped monitoring');
  },
  
  resetMetrics: () => {
    console.debug('[Performance] Metrics reset');
  },
  
  getComponentMetrics: (componentName: string): ComponentMetrics => {
    return {
      component: componentName,
      averageRenderTime: 0,
      totalRenders: 0,
      slowRenders: 0
    };
  }
};

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
