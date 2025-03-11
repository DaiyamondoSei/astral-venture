
/**
 * Performance Tracking Hook
 * 
 * Provides consistent, type-safe performance tracking capabilities
 * for measuring and reporting component performance.
 */

import { useRef, useEffect, useCallback } from 'react';

export interface PerformanceTrackingOptions {
  /** Component name for tracking */
  componentName: string;
  /** Whether to log slow renders to console */
  logSlowRenders?: boolean;
  /** Threshold in ms for slow render warnings */
  slowRenderThreshold?: number;
  /** Whether to track render count */
  trackRenderCount?: boolean;
  /** Whether to track mount time */
  trackMountTime?: boolean;
  /** Whether to track update times */
  trackUpdateTime?: boolean;
}

export interface PerformanceData {
  /** Component name */
  componentName: string;
  /** Render count since mount */
  renderCount: number;
  /** Time taken for initial mount in ms */
  mountTime?: number;
  /** Time taken for last update in ms */
  lastUpdateTime?: number;
  /** Average update time in ms */
  averageUpdateTime?: number;
  /** Interactions tracked for this component */
  interactions: Record<string, { count: number, averageTime: number }>;
}

export interface InteractionMetrics {
  /** Time when the interaction started */
  startTime: number;
  /** Type of interaction */
  type: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Hook for tracking component performance
 */
export function usePerformanceTracking(options: PerformanceTrackingOptions) {
  const {
    componentName,
    logSlowRenders = false,
    slowRenderThreshold = 16, // 16ms = 60fps threshold
    trackRenderCount = true,
    trackMountTime = true,
    trackUpdateTime = true
  } = options;

  // Performance tracking state refs
  const renderCount = useRef(0);
  const mountTime = useRef<number | null>(null);
  const renderStartTime = useRef(performance.now());
  const updateTimes = useRef<number[]>([]);
  const isMounted = useRef(false);
  const interactions = useRef<Record<string, { times: number[], count: number }>>({}); 

  // Track render start time
  renderStartTime.current = performance.now();
  
  // Increment render count
  if (trackRenderCount) {
    renderCount.current += 1;
  }

  /**
   * Create a function to track user interactions
   * Returns a function that, when called, will end the interaction tracking
   */
  const trackInteraction = useCallback((
    interactionType: string,
    metadata?: Record<string, any>
  ) => {
    const startTime = performance.now();
    
    // Initialize interaction tracking if needed
    if (!interactions.current[interactionType]) {
      interactions.current[interactionType] = { times: [], count: 0 };
    }
    
    // Return a function that will end the tracking when called
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      interactions.current[interactionType].times.push(duration);
      interactions.current[interactionType].count += 1;
      
      // Log slow interactions
      if (logSlowRenders && duration > slowRenderThreshold) {
        console.warn(
          `Slow interaction [${interactionType}] in ${componentName}: ${duration.toFixed(2)}ms`,
          metadata
        );
      }
    };
  }, [componentName, logSlowRenders, slowRenderThreshold]);

  // Measure mount and update times
  useEffect(() => {
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;
    
    // Check if this is the first render (mount)
    if (!isMounted.current) {
      isMounted.current = true;
      
      if (trackMountTime) {
        mountTime.current = renderDuration;
        
        // Log slow mounts
        if (logSlowRenders && renderDuration > slowRenderThreshold) {
          console.warn(`Slow mount in ${componentName}: ${renderDuration.toFixed(2)}ms`);
        }
      }
    } else if (trackUpdateTime) {
      // Track update time
      updateTimes.current.push(renderDuration);
      
      // Log slow updates
      if (logSlowRenders && renderDuration > slowRenderThreshold) {
        console.warn(`Slow update in ${componentName}: ${renderDuration.toFixed(2)}ms (render #${renderCount.current})`);
      }
    }
    
    // Cleanup function to report final stats
    return () => {
      if (process.env.NODE_ENV === 'development') {
        // Only log in development
        const totalUpdates = updateTimes.current.length;
        const totalUpdateTime = updateTimes.current.reduce((sum, time) => sum + time, 0);
        const avgUpdateTime = totalUpdates > 0 ? totalUpdateTime / totalUpdates : 0;
        
        // Calculate interaction averages
        const interactionStats = Object.fromEntries(
          Object.entries(interactions.current).map(([type, data]) => {
            const totalTime = data.times.reduce((sum, time) => sum + time, 0);
            const avgTime = data.times.length > 0 ? totalTime / data.times.length : 0;
            return [type, { count: data.count, averageTime: avgTime }];
          })
        );
        
        console.log(`Component Performance (${componentName}):`, {
          renderCount: renderCount.current,
          mountTime: mountTime.current,
          averageUpdateTime: avgUpdateTime,
          interactions: interactionStats
        });
      }
    };
  }, [componentName, logSlowRenders, slowRenderThreshold, trackMountTime, trackUpdateTime]);

  /**
   * Get current performance data
   */
  const getPerformanceData = useCallback((): PerformanceData => {
    // Calculate average update time
    const totalUpdates = updateTimes.current.length;
    const totalUpdateTime = updateTimes.current.reduce((sum, time) => sum + time, 0);
    const avgUpdateTime = totalUpdates > 0 ? totalUpdateTime / totalUpdates : 0;
    
    // Calculate last update time
    const lastUpdateTime = totalUpdates > 0 ? updateTimes.current[totalUpdates - 1] : undefined;
    
    // Calculate interaction averages
    const interactionStats = Object.fromEntries(
      Object.entries(interactions.current).map(([type, data]) => {
        const totalTime = data.times.reduce((sum, time) => sum + time, 0);
        const avgTime = data.times.length > 0 ? totalTime / data.times.length : 0;
        return [type, { count: data.count, averageTime: avgTime }];
      })
    );
    
    return {
      componentName,
      renderCount: renderCount.current,
      mountTime: mountTime.current || undefined,
      lastUpdateTime,
      averageUpdateTime: avgUpdateTime || undefined,
      interactions: interactionStats
    };
  }, [componentName]);

  return {
    trackInteraction,
    getPerformanceData,
    renderCount: renderCount.current
  };
}

export default usePerformanceTracking;
