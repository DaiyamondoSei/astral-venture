
import { useCallback } from 'react';
import { AchievementState } from './types';
import { trackAchievementProgress } from '@/utils/achievementUtils';

type TrackingDetails = {
  value?: number;
  amount?: number;
  metadata?: Record<string, any>;
};

export function useProgressTracking(
  state: AchievementState,
  setProgressTracking: (trackingData: Record<string, number>) => void
) {
  /**
   * Get the current progress value for a tracking type
   */
  const getProgressValue = useCallback(
    (trackingType: string): number => {
      return state.progressTracking?.[trackingType] || 0;
    },
    [state.progressTracking]
  );

  /**
   * Track progress for a specific metric
   */
  const trackProgress = useCallback(
    (trackingType: string, amount: number) => {
      if (amount === 0) return; // No change

      const currentValue = getProgressValue(trackingType);
      const newValue = Math.max(0, currentValue + amount); // Prevent negative values

      // Only update if there's an actual change
      if (newValue !== currentValue) {
        setProgressTracking({
          ...state.progressTracking,
          [trackingType]: newValue
        });
      }
    },
    [getProgressValue, setProgressTracking, state.progressTracking]
  );

  /**
   * Track multiple progress metrics at once
   */
  const trackMultipleProgress = useCallback(
    (progressUpdates: Record<string, number>) => {
      const updatedTracking = { ...state.progressTracking };
      let hasChanges = false;

      Object.entries(progressUpdates).forEach(([trackingType, amount]) => {
        if (amount === 0) return; // Skip if no change

        const currentValue = updatedTracking[trackingType] || 0;
        const newValue = Math.max(0, currentValue + amount); // Prevent negative values

        if (newValue !== currentValue) {
          updatedTracking[trackingType] = newValue;
          hasChanges = true;
        }
      });

      // Only update if there's an actual change
      if (hasChanges) {
        setProgressTracking(updatedTracking);
      }
    },
    [setProgressTracking, state.progressTracking]
  );

  /**
   * Reset progress for a specific tracking type
   */
  const resetProgress = useCallback(
    (trackingType: string) => {
      if (state.progressTracking?.[trackingType]) {
        setProgressTracking({
          ...state.progressTracking,
          [trackingType]: 0
        });
      }
    },
    [setProgressTracking, state.progressTracking]
  );

  /**
   * Log a specific activity with optional details
   */
  const logActivity = useCallback(
    (activityType: string, details: TrackingDetails = {}) => {
      // Use details.value or details.amount if provided, otherwise default to 1
      const incrementAmount = details.value ?? details.amount ?? 1;
      trackProgress(activityType, incrementAmount);

      // Track achievement progress in Supabase
      const achievementMapping: Record<string, string> = {
        reflections: 'reflection_entries',
        meditation_minutes: 'meditation_time',
        practices_completed: 'practice_master',
        wisdom_resources: 'wisdom_seeker',
        chakra_activations: 'chakra_master',
        energy_points: 'energy_milestone'
      };

      // If this activity type maps to an achievement, track it
      if (achievementMapping[activityType]) {
        trackAchievementProgress(
          achievementMapping[activityType], 
          incrementAmount
        );
      }
    },
    [trackProgress]
  );

  /**
   * Check if a specific tracking threshold has been met
   */
  const hasReachedThreshold = useCallback(
    (trackingType: string, threshold: number): boolean => {
      return getProgressValue(trackingType) >= threshold;
    },
    [getProgressValue]
  );

  return {
    getProgressValue,
    trackProgress,
    trackMultipleProgress,
    resetProgress,
    logActivity,
    hasReachedThreshold
  };
}
