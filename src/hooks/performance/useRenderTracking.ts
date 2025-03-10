
import { useEffect } from 'react';
import { toast } from 'sonner';
import { TrackingState, PerformanceTrackingOptions } from './types';

/**
 * Hook to track render performance metrics
 */
export function useRenderTracking(
  stateRef: React.MutableRefObject<TrackingState>,
  options: PerformanceTrackingOptions
): void {
  const {
    slowThreshold = 16, // ~60fps threshold
    warnOnSlowRenders = false,
    componentName
  } = options;

  // Track render performance
  useEffect(() => {
    const state = stateRef.current;
    if (!state.isTracking) return;

    const currentTime = performance.now();
    const renderTime = currentTime - state.lastRenderTimestamp;
    state.lastRenderTimestamp = currentTime;

    const metrics = state.metrics;
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
  });
}

export default useRenderTracking;
