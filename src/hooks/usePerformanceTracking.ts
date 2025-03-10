import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export interface PerformanceMetrics {
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowRenders: number;
  componentName: string;
  interactions: Record<string, {
    count: number;
    totalTime: number;
    averageTime: number;
  }>;
  markers: Record<string, number[]>;
}

export interface PerformanceTrackingOptions {
  componentName: string;
  trackInteractions?: boolean;
  slowThreshold?: number; // in milliseconds
  warnOnSlowRenders?: boolean;
  enabled?: boolean; // to easily disable in production
}

/**
 * Hook for tracking component performance metrics
 */
export function usePerformanceTracking(options: PerformanceTrackingOptions) {
  const {
    componentName,
    trackInteractions = true,
    slowThreshold = 16, // ~60fps threshold
    warnOnSlowRenders = false,
    enabled = process.env.NODE_ENV === 'development'
  } = options;

  // Use a ref to avoid causing re-renders due to metrics changes
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    totalRenderTime: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    slowRenders: 0,
    componentName,
    interactions: {},
    markers: {}
  });

  const lastRenderTimestamp = useRef<number>(performance.now());
  const isTrackingRef = useRef<boolean>(enabled);
  const interactionTimersRef = useRef<Record<string, number>>({});

  // Track render performance
  useEffect(() => {
    if (!isTrackingRef.current) return;

    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTimestamp.current;
    lastRenderTimestamp.current = currentTime;

    const metrics = metricsRef.current;
    metrics.renderCount += 1;
    metrics.totalRenderTime += renderTime;
    metrics.lastRenderTime = renderTime;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;

    if (renderTime > slowThreshold) {
      metrics.slowRenders += 1;
      
      if (warnOnSlowRenders) {
        console.warn(
          `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms ` +
          `(threshold: ${slowThreshold}ms)`
        );
        
        // Optionally show a toast for very slow renders (more than 5x the threshold)
        if (renderTime > slowThreshold * 5) {
          toast.warning(
            `Performance issue in ${componentName}. This might affect user experience.`
          );
        }
      }
    }

    // Cleanup function
    return () => {
      // No cleanup needed for render tracking
    };
  });

  // Start tracking an interaction
  const startInteractionTiming = (interactionName: string) => {
    if (!isTrackingRef.current || !trackInteractions) return () => {};

    const startTime = performance.now();
    interactionTimersRef.current[interactionName] = startTime;

    // Return a function to end timing and record the result
    return (metadata?: Record<string, unknown>) => {
      if (!isTrackingRef.current) return;

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Initialize the interaction record if it doesn't exist
      if (!metricsRef.current.interactions[interactionName]) {
        metricsRef.current.interactions[interactionName] = {
          count: 0,
          totalTime: 0,
          averageTime: 0
        };
      }

      const interaction = metricsRef.current.interactions[interactionName];
      interaction.count += 1;
      interaction.totalTime += duration;
      interaction.averageTime = interaction.totalTime / interaction.count;

      if (duration > slowThreshold && warnOnSlowRenders) {
        console.warn(
          `Slow interaction "${interactionName}" in ${componentName}: ${duration.toFixed(2)}ms`,
          metadata || {}
        );
      }
    };
  };

  // Add a performance marker
  const addMarker = (markerName: string, value?: number) => {
    if (!isTrackingRef.current) return;

    if (!metricsRef.current.markers[markerName]) {
      metricsRef.current.markers[markerName] = [];
    }

    metricsRef.current.markers[markerName].push(
      value !== undefined ? value : performance.now()
    );
  };

  // Start or stop tracking
  const startTracking = () => {
    isTrackingRef.current = true;
    lastRenderTimestamp.current = performance.now();
  };

  const stopTracking = () => {
    isTrackingRef.current = false;
  };

  // Reset the metrics
  const resetMetrics = () => {
    metricsRef.current = {
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      slowRenders: 0,
      componentName,
      interactions: {},
      markers: {}
    };
    lastRenderTimestamp.current = performance.now();
  };

  // Keep a history of performance snapshots for analysis
  const performanceHistory = useRef<any[]>([]);

  // Take a snapshot of current metrics
  const captureSnapshot = () => {
    if (!isTrackingRef.current) return;
    
    performanceHistory.current.push({
      ...metricsRef.current,
      timestamp: new Date().toISOString()
    });
    
    // Limit history size to prevent memory issues
    if (performanceHistory.current.length > 50) {
      performanceHistory.current.shift();
    }
  };

  // Periodically capture snapshots for long-lived components
  useEffect(() => {
    if (!isTrackingRef.current) return;
    
    const interval = setInterval(captureSnapshot, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    metrics: metricsRef.current,
    isTracking: isTrackingRef.current,
    startTracking,
    stopTracking,
    resetMetrics,
    startInteractionTiming,
    addMarker,
    performanceHistory: performanceHistory.current
  };
}

export default usePerformanceTracking;
