
import { PerformanceTrackingOptions, TrackingState } from './types';

/**
 * Hook to track interaction timing
 */
export function useInteractionTracking(
  stateRef: React.MutableRefObject<TrackingState>,
  options: PerformanceTrackingOptions
): (interactionName: string) => (metadata?: Record<string, unknown>) => void {
  const {
    trackInteractions = true,
    slowThreshold = 16,
    warnOnSlowRenders = false,
    componentName
  } = options;

  // Start tracking an interaction
  const startInteractionTiming = (interactionName: string) => {
    const state = stateRef.current;
    if (!state.isTracking || !trackInteractions) return () => {};

    const startTime = performance.now();
    state.interactionTimers[interactionName] = startTime;

    // Return a function to end timing and record the result
    return (metadata?: Record<string, unknown>) => {
      if (!state.isTracking) return;

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Initialize the interaction record if it doesn't exist
      if (!state.metrics.interactions[interactionName]) {
        state.metrics.interactions[interactionName] = {
          count: 0,
          totalTime: 0,
          averageTime: 0
        };
      }

      const interaction = state.metrics.interactions[interactionName];
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

  return startInteractionTiming;
}

export default useInteractionTracking;
