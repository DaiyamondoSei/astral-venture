
import { useState, useCallback } from 'react';
import { AchievementState, ProgressTrackingResult } from './types';

export function useProgressTracking(
  state: AchievementState,
  setProgressTracking: (value: Record<string, number>) => void
): ProgressTrackingResult {
  // Track progress for a specific type
  const trackProgress = useCallback((type: string, amount: number) => {
    setProgressTracking((prev) => {
      // Create a new object with the updated value
      return {
        ...prev,
        [type]: (prev[type] || 0) + amount
      };
    });
  }, [setProgressTracking]);

  // Log activity with optional details
  const logActivity = useCallback((activityType: string, details?: Record<string, any>) => {
    // Extract numeric value from details if available
    let value = 1; // Default value

    if (details && typeof details.value === 'number') {
      value = details.value;
    } else if (details && typeof details.amount === 'number') {
      value = details.amount;
    }

    // Track the activity with the extracted or default value
    trackProgress(activityType, value);

    // Additional logging or processing could be added here
    console.log(`Activity logged: ${activityType}`, details);
  }, [trackProgress]);

  // Get progress value for a specific type
  const getProgressValue = useCallback((type: string) => {
    return state.progressTracking[type] || 0;
  }, [state.progressTracking]);

  return {
    trackProgress,
    logActivity,
    getProgressValue
  };
}
