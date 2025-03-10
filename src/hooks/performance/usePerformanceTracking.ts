
import { PerformanceTrackingOptions, PerformanceTrackingResult } from './types';
import { useTrackingState } from './useTrackingState';
import { useRenderTracking } from './useRenderTracking';
import { useInteractionTracking } from './useInteractionTracking';
import { usePerformanceHistory } from './usePerformanceHistory';

/**
 * Combined hook for tracking component performance metrics
 */
export function usePerformanceTracking(
  componentName: string,
  options: Partial<PerformanceTrackingOptions> = {}
): PerformanceTrackingResult {
  const fullOptions: PerformanceTrackingOptions = {
    componentName,
    trackInteractions: true,
    slowThreshold: 16, // ~60fps threshold
    warnOnSlowRenders: false,
    enabled: process.env.NODE_ENV === 'development',
    autoStart: false,
    logSlowRenders: true,
    ...options
  };

  // Set up the tracking state
  const { state: stateRef, resetState } = useTrackingState(fullOptions);
  
  // Track render performance
  useRenderTracking(stateRef, fullOptions);
  
  // Create interaction tracking function
  const startInteractionTiming = useInteractionTracking(stateRef, fullOptions);
  
  // Set up performance history
  const captureSnapshot = usePerformanceHistory(stateRef);

  // Add a marker
  const addMarker = (markerName: string, value?: number) => {
    const state = stateRef.current;
    if (!state.isTracking) return;

    if (!state.metrics.markers[markerName]) {
      state.metrics.markers[markerName] = [];
    }

    state.metrics.markers[markerName].push(
      value !== undefined ? value : performance.now()
    );
  };

  // Start or stop tracking
  const startTracking = () => {
    stateRef.current.isTracking = true;
    stateRef.current.lastRenderTimestamp = performance.now();
  };

  const stopTracking = () => {
    stateRef.current.isTracking = false;
  };

  // Return the public API
  return {
    metrics: stateRef.current.metrics,
    isTracking: stateRef.current.isTracking,
    startTracking,
    stopTracking,
    resetMetrics: resetState,
    startInteractionTiming,
    addMarker,
    performanceHistory: stateRef.current.performanceHistory,
    captureSnapshot
  };
}

// Re-export types
export * from './types';
export default usePerformanceTracking;
