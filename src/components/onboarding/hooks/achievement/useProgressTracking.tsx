
import { useCallback } from 'react';
import { AchievementState } from './types';

type ProgressTrackingKey = string;
type ProgressValue = number;
type ProgressTrackingRecord = Record<ProgressTrackingKey, ProgressValue>;

interface ActivityDetails {
  value?: number;
  amount?: number;
  metadata?: Record<string, any>;
}

export const useProgressTracking = (
  state: AchievementState,
  setProgressTracking: (progress: ProgressTrackingRecord) => void
) => {
  // Get current progress value for a tracking type
  const getProgressValue = useCallback((trackingType: ProgressTrackingKey): ProgressValue => {
    return state.progressTracking?.[trackingType] || 0;
  }, [state.progressTracking]);

  // Update progress for a specific tracking type
  const trackProgress = useCallback((trackingType: ProgressTrackingKey, amount: ProgressValue) => {
    // If amount is 0, no need to update
    if (amount === 0) return;

    const currentValue = getProgressValue(trackingType);
    const newValue = Math.max(0, currentValue + amount); // Ensure value doesn't go below 0

    setProgressTracking({
      ...state.progressTracking,
      [trackingType]: newValue
    });
  }, [getProgressValue, state.progressTracking, setProgressTracking]);

  // Reset progress for a specific tracking type
  const resetProgress = useCallback((trackingType: ProgressTrackingKey) => {
    setProgressTracking({
      ...state.progressTracking,
      [trackingType]: 0
    });
  }, [state.progressTracking, setProgressTracking]);

  // Update multiple tracking types at once
  const trackMultipleProgress = useCallback((updates: Record<ProgressTrackingKey, ProgressValue>) => {
    const newProgressTracking = { ...state.progressTracking };
    let hasUpdates = false;

    Object.entries(updates).forEach(([trackingType, amount]) => {
      if (amount === 0) return;

      const currentValue = getProgressValue(trackingType);
      newProgressTracking[trackingType] = Math.max(0, currentValue + amount);
      hasUpdates = true;
    });

    if (hasUpdates) {
      setProgressTracking(newProgressTracking);
    }
  }, [getProgressValue, state.progressTracking, setProgressTracking]);

  // Log an activity with optional details
  const logActivity = useCallback((
    activityType: ProgressTrackingKey,
    details: ActivityDetails = {}
  ) => {
    // Determine amount to increment:
    // 1. Use details.value if provided (absolute value)
    // 2. Use details.amount if provided (increment)
    // 3. Default to 1 (simple increment)
    const incrementAmount = details.value !== undefined
      ? details.value - getProgressValue(activityType)
      : details.amount !== undefined
        ? details.amount
        : 1;

    // Only update if there's a non-zero change
    if (incrementAmount !== 0) {
      trackProgress(activityType, incrementAmount);
    }
  }, [getProgressValue, trackProgress]);

  return {
    getProgressValue,
    trackProgress,
    resetProgress,
    trackMultipleProgress,
    logActivity
  };
};
