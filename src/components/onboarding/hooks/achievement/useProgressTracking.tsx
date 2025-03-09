
import { useState, useCallback, useMemo } from 'react';
import { AchievementEventType, IAchievementData, ProgressTrackingResult } from './types';

interface UseProgressTrackingProps {
  userId?: string;
  onProgress?: (type: string, value: number, previousValue: number) => void;
}

/**
 * Hook to track progress for various achievement types
 */
export function useProgressTracking(state: any, setProgressTracking: (progress: Record<string, number>) => void): ProgressTrackingResult {
  // Create the result object with methods that use the state and setter
  const result = useMemo((): ProgressTrackingResult => {
    // Get progress value for a specific type
    const getProgressValue = (type: string): number => {
      return state.progressTracking[type] || 0;
    };
    
    // Track progress for a specific type
    const trackProgress = (type: string, amount: number) => {
      const currentValue = getProgressValue(type);
      const newValue = Math.max(0, currentValue + amount);
      
      if (currentValue !== newValue) {
        setProgressTracking({
          ...state.progressTracking,
          [type]: newValue
        });
      }
    };
    
    // Reset progress for a specific type
    const resetProgress = (type: string) => {
      setProgressTracking({
        ...state.progressTracking,
        [type]: 0
      });
    };
    
    // Log activity for tracking and analysis
    const logActivity = (activityType: string, details: Record<string, any> = {}) => {
      let amountToAdd = 1; // Default value to add
      
      // Extract amount or value from details
      if (details.value !== undefined) {
        amountToAdd = details.value;
      } else if (details.amount !== undefined) {
        amountToAdd = details.amount;
      }
      
      // Track progress based on activity type
      switch (activityType) {
        case 'reflection_completed':
          trackProgress('reflections', amountToAdd);
          break;
        case 'meditation_completed':
          trackProgress('meditation_minutes', amountToAdd);
          break;
        case 'chakra_activated':
          trackProgress('chakras_activated', amountToAdd);
          break;
        case 'wisdom_resources':
          trackProgress('wisdom_resources', amountToAdd);
          break;
        default:
          // If it's a generic tracked event, increment by the specified amount
          if (activityType.startsWith('track_')) {
            const trackType = activityType.replace('track_', '');
            trackProgress(trackType, amountToAdd);
          } else {
            // If the activity type matches directly a tracked metric, update it
            if (Object.keys(state.progressTracking).includes(activityType)) {
              trackProgress(activityType, amountToAdd);
            }
          }
      }
    };
    
    // Track multiple progress types at once
    const trackMultipleProgress = (progressUpdates: Record<string, number>) => {
      const newProgress = { ...state.progressTracking };
      let hasChanges = false;
      
      // Update each progress type
      Object.entries(progressUpdates).forEach(([type, amount]) => {
        const currentValue = state.progressTracking[type] || 0;
        const newValue = Math.max(0, currentValue + amount);
        
        if (currentValue !== newValue) {
          newProgress[type] = newValue;
          hasChanges = true;
        }
      });
      
      // Only update if there were changes
      if (hasChanges) {
        setProgressTracking(newProgress);
      }
    };

    return {
      earnedPoints: 0,
      progress: state.progressTracking,
      didUnlockAchievement: false,
      unlockedAchievements: [],
      updated: false,
      getProgressValue,
      trackProgress,
      resetProgress,
      logActivity,
      trackMultipleProgress
    };
  }, [state.progressTracking, setProgressTracking]);
  
  return result;
}
