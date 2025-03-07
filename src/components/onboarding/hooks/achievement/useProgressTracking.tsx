
import { useCallback } from 'react';
import { AchievementState, ProgressTrackingResult } from './types';

/**
 * Hook for tracking user progress in various achievement categories
 * 
 * @param state The current achievement state
 * @param setProgressTracking Function to update the progress tracking state
 * @returns Object with methods for tracking and retrieving progress
 */
export function useProgressTracking(
  state: AchievementState,
  setProgressTracking: (value: Record<string, number>) => void
): ProgressTrackingResult {
  // Get the current value for a specific progress type
  const getProgressValue = useCallback((type: string): number => {
    return state.progressTracking[type] || 0;
  }, [state.progressTracking]);

  // Track progress for a specific type
  const trackProgress = useCallback((type: string, amount: number): void => {
    // If amount is 0, no need to update
    if (amount === 0) return;
    
    // Calculate new value, ensuring it doesn't go below 0
    const currentValue = getProgressValue(type);
    const newValue = Math.max(0, currentValue + amount);
    
    // Create a new object with the updated value
    const updatedProgress = {
      ...state.progressTracking,
      [type]: newValue
    };
    
    // Call the setter with the new object
    setProgressTracking(updatedProgress);
  }, [state.progressTracking, setProgressTracking, getProgressValue]);

  // Reset a specific progress type to zero
  const resetProgress = useCallback((type: string): void => {
    const updatedProgress = {
      ...state.progressTracking,
      [type]: 0
    };
    
    setProgressTracking(updatedProgress);
  }, [state.progressTracking, setProgressTracking]);

  // Log activity with optional details
  const logActivity = useCallback((activityType: string, details?: Record<string, any>): void => {
    // Extract numeric value from details if available
    let value = 1; // Default value

    if (details) {
      if (typeof details.value === 'number') {
        value = details.value;
      } else if (typeof details.amount === 'number') {
        value = details.amount;
      }
    }

    // Track the activity with the extracted or default value
    trackProgress(activityType, value);

    // Additional logging or processing could be added here
    console.log(`Activity logged: ${activityType}`, details);
  }, [trackProgress]);

  // Track multiple progress types at once
  const trackMultipleProgress = useCallback((progressUpdates: Record<string, number>): void => {
    const updatedProgress = { ...state.progressTracking };
    
    // Process each update
    Object.entries(progressUpdates).forEach(([type, amount]) => {
      const currentValue = updatedProgress[type] || 0;
      updatedProgress[type] = Math.max(0, currentValue + amount);
    });
    
    setProgressTracking(updatedProgress);
  }, [state.progressTracking, setProgressTracking]);

  return {
    trackProgress,
    resetProgress,
    logActivity,
    getProgressValue,
    trackMultipleProgress
  };
}
