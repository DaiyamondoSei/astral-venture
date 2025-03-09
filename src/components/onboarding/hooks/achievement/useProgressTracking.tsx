
import { useCallback } from 'react';
import { AchievementState, ProgressTrackingResult, AchievementEventType, IAchievementData } from './types';

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
    
    // Only update if the value has changed
    if (newValue === currentValue) return;
    
    // Create a new object with the updated value
    const updatedProgress = {
      ...state.progressTracking,
      [type]: newValue
    };
    
    // Call the setter with the new object
    setProgressTracking(updatedProgress);
    
    // Log meaningful progress updates
    if (amount > 0) {
      console.log(`Progress tracked: ${type} increased by ${amount} to ${newValue}`);
    } else {
      console.log(`Progress decreased: ${type} changed by ${amount} to ${newValue}`);
    }
  }, [state.progressTracking, setProgressTracking, getProgressValue]);

  // Reset a specific progress type to zero
  const resetProgress = useCallback((type: string): void => {
    // Only reset if the current value is not already 0
    if (getProgressValue(type) === 0) return;
    
    const updatedProgress = {
      ...state.progressTracking,
      [type]: 0
    };
    
    setProgressTracking(updatedProgress);
    console.log(`Progress reset: ${type} set to 0`);
  }, [state.progressTracking, setProgressTracking, getProgressValue]);

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

    // Map activity types to progress tracking types
    let progressType = activityType;
    
    // Handle standard achievement event types
    switch (activityType) {
      case AchievementEventType.REFLECTION_COMPLETED:
        progressType = 'reflections';
        break;
      case AchievementEventType.MEDITATION_COMPLETED:
        progressType = 'meditation_minutes';
        value = details?.duration || value;
        break;
      case AchievementEventType.CHAKRA_ACTIVATED:
        progressType = 'chakras_activated';
        break;
      case AchievementEventType.WISDOM_EXPLORED:
        progressType = 'wisdom_resources_explored';
        break;
      default:
        // Use the original activity type
        break;
    }

    // Track the activity with the extracted or default value
    trackProgress(progressType, value);

    // Additional logging or processing
    console.log(`Activity logged: ${activityType}`, {
      progressType,
      value,
      details,
      timestamp: new Date().toISOString()
    });
  }, [trackProgress]);

  // Track multiple progress types at once
  const trackMultipleProgress = useCallback((progressUpdates: Record<string, number>): void => {
    // Skip if empty updates object
    if (Object.keys(progressUpdates).length === 0) return;
    
    // Find changes that need to be applied
    const changedValues = Object.entries(progressUpdates).filter(([type, amount]) => {
      const currentValue = state.progressTracking[type] || 0;
      return Math.max(0, currentValue + amount) !== currentValue;
    });
    
    // Skip if no actual changes
    if (changedValues.length === 0) return;
    
    const updatedProgress = { ...state.progressTracking };
    
    // Process each update
    changedValues.forEach(([type, amount]) => {
      const currentValue = updatedProgress[type] || 0;
      updatedProgress[type] = Math.max(0, currentValue + amount);
    });
    
    setProgressTracking(updatedProgress);
    
    // Log the batch update
    console.log('Multiple progress updates:', changedValues);
  }, [state.progressTracking, setProgressTracking]);

  // Create empty achievement array for type safety
  const emptyAchievements: IAchievementData[] = [];

  return {
    trackProgress,
    resetProgress,
    logActivity,
    getProgressValue,
    trackMultipleProgress,
    // Add required properties to match ProgressTrackingResult
    earnedPoints: 0,
    didUnlockAchievement: false,
    unlockedAchievements: emptyAchievements,
    progress: state.progressTracking || {},
    updated: false
  };
}
