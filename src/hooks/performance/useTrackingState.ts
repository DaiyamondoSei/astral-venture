
import { useRef } from 'react';
import { TrackingState, PerformanceTrackingOptions } from './types';

/**
 * Hook to create and manage the performance tracking state
 */
export function useTrackingState(options: PerformanceTrackingOptions): {
  state: React.MutableRefObject<TrackingState>;
  resetState: () => void;
} {
  const { componentName, enabled = process.env.NODE_ENV === 'development' } = options;
  
  // Create a ref to hold all tracking state to avoid re-renders
  const state = useRef<TrackingState>({
    metrics: {
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      slowRenders: 0,
      componentName,
      interactions: {},
      markers: {}
    },
    isTracking: options.autoStart ?? enabled,
    lastRenderTimestamp: performance.now(),
    interactionTimers: {},
    performanceHistory: []
  });
  
  // Function to reset the tracking state
  const resetState = () => {
    state.current = {
      ...state.current,
      metrics: {
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        slowRenders: 0,
        componentName,
        interactions: {},
        markers: {}
      },
      lastRenderTimestamp: performance.now()
    };
  };
  
  return { state, resetState };
}

export default useTrackingState;
