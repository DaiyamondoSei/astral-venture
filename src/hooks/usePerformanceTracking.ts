
import { useCallback, useEffect, useRef, useState } from 'react';
import performanceMonitor from '@/utils/performance/performanceMonitor';
import { ValidationError } from '@/utils/validation/ValidationError';

// Type definitions
export interface PerformanceTrackingOptions {
  /** Automatically start monitoring when component mounts */
  autoStart?: boolean;
  /** Log slow renders to console */
  logSlowRenders?: boolean;
  /** Threshold in ms for what's considered a slow render */
  slowRenderThreshold?: number;
  /** Track component interactions automatically */
  trackInteractions?: boolean;
  /** Categories to track for this component */
  categories?: string[];
}

export interface InteractionTiming {
  name: string;
  duration: number;
  timestamp: number;
}

/**
 * Hook for tracking component performance metrics
 * 
 * @param componentName Name of the component to track
 * @param options Performance tracking options
 */
export function usePerformanceTracking(
  componentName: string,
  options: PerformanceTrackingOptions = {}
) {
  if (!componentName) {
    throw new ValidationError('Component name is required for performance tracking', {
      field: 'componentName',
      rule: 'required'
    });
  }
  
  const renderStartTime = useRef<number | null>(null);
  const renderCount = useRef(0);
  const recentInteractions = useRef<InteractionTiming[]>([]);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(!!options.autoStart);

  // Record render start time
  useEffect(() => {
    if (!isMonitoring) return;
    
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

  // Setup monitoring based on options
  useEffect(() => {
    if (options.autoStart) {
      performanceMonitor.startMonitoring();
      setIsMonitoring(true);
    }

    // Clean up on component unmount
    return () => {
      // Only record unmount if we're tracking this component
      if (renderCount.current > 0) {
        performanceMonitor.recordUnmount(componentName);
      }
    };
  }, [componentName, options.autoStart]);

  /**
   * Record a user interaction with timing information
   */
  const recordInteraction = useCallback((interactionName: string, duration: number) => {
    if (!isMonitoring) return;
    
    const interaction = {
      name: interactionName,
      duration,
      timestamp: Date.now()
    };
    
    recentInteractions.current.push(interaction);
    
    // Limit the size of the interactions array
    if (recentInteractions.current.length > 10) {
      recentInteractions.current.shift();
    }
    
    performanceMonitor.recordEvent(
      'interaction', 
      `${componentName}:${interactionName}`, 
      duration
    );
  }, [componentName, isMonitoring]);

  /**
   * Start timing an interaction
   * @returns A function to stop timing and record the interaction
   */
  const startInteractionTiming = useCallback((interactionName: string) => {
    if (!isMonitoring) return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      recordInteraction(interactionName, duration);
      return duration;
    };
  }, [isMonitoring, recordInteraction]);

  /**
   * Start performance monitoring 
   */
  const startMonitoring = useCallback(() => {
    performanceMonitor.startMonitoring();
    setIsMonitoring(true);
  }, []);

  /**
   * Stop performance monitoring
   */
  const stopMonitoring = useCallback(() => {
    performanceMonitor.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  return {
    recordInteraction,
    startInteractionTiming,
    startMonitoring,
    stopMonitoring,
    resetMetrics: performanceMonitor.resetMetrics,
    getMetrics: () => performanceMonitor.getComponentMetrics(componentName),
    isMonitoring
  };
}

export default usePerformanceTracking;
