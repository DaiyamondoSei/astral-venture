
import { useEffect } from 'react';
import { TrackingState } from './types';

/**
 * Hook to manage performance history snapshots
 */
export function usePerformanceHistory(
  stateRef: React.MutableRefObject<TrackingState>,
  captureInterval: number = 30000 // Every 30 seconds
): () => void {
  // Capture a snapshot of current metrics
  const captureSnapshot = () => {
    const state = stateRef.current;
    if (!state.isTracking) return;
    
    state.performanceHistory.push({
      ...state.metrics,
      timestamp: new Date().toISOString()
    });
    
    // Limit history size to prevent memory issues
    if (state.performanceHistory.length > 50) {
      state.performanceHistory.shift();
    }
  };

  // Periodically capture snapshots for long-lived components
  useEffect(() => {
    const state = stateRef.current;
    if (!state.isTracking) return;
    
    const interval = setInterval(captureSnapshot, captureInterval);
    
    return () => {
      clearInterval(interval);
    };
  }, [captureInterval]);

  return captureSnapshot;
}

export default usePerformanceHistory;
