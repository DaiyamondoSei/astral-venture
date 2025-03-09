
import { useState, useCallback, useMemo } from 'react';
import { AchievementEventType, IAchievementData, ProgressTrackingResult } from './types';

interface UseProgressTrackingProps {
  userId?: string;
  onProgress?: (type: string, value: number, previousValue: number) => void;
}

/**
 * Hook to track progress for various achievement types
 */
export function useProgressTracking({ 
  userId, 
  onProgress 
}: UseProgressTrackingProps): ProgressTrackingResult {
  // State to track progress values
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [unlockedAchievements, setUnlockedAchievements] = useState<IAchievementData[]>([]);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [activityLog, setActivityLog] = useState<Record<string, any>[]>([]);
  
  // Track progress for a specific type
  const trackProgress = useCallback((type: string, amount: number) => {
    setProgress(prev => {
      const currentValue = prev[type] || 0;
      const newValue = currentValue + amount;
      
      // Call the onProgress callback if provided
      if (onProgress) {
        onProgress(type, newValue, currentValue);
      }
      
      return {
        ...prev,
        [type]: newValue
      };
    });
  }, [onProgress]);
  
  // Reset progress for a specific type
  const resetProgress = useCallback((type: string) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[type];
      return newProgress;
    });
  }, []);
  
  // Log activity for tracking and analysis
  const logActivity = useCallback((activityType: string, details: Record<string, any> = {}) => {
    const activity = {
      type: activityType,
      timestamp: new Date().toISOString(),
      userId,
      ...details
    };
    
    // Add to activity log
    setActivityLog(prev => [...prev, activity]);
    
    // Track progress based on activity type
    switch (activityType) {
      case AchievementEventType.REFLECTION_COMPLETED:
        trackProgress('reflections', 1);
        break;
      case AchievementEventType.MEDITATION_COMPLETED:
        trackProgress('meditation_minutes', details.duration || 5);
        break;
      case AchievementEventType.CHAKRA_ACTIVATED:
        trackProgress('chakras_activated', 1);
        break;
      case AchievementEventType.WISDOM_EXPLORED:
        trackProgress('wisdom_resources', 1);
        break;
      default:
        // If it's a generic tracked event, increment by 1
        if (activityType.startsWith('track_')) {
          const trackType = activityType.replace('track_', '');
          trackProgress(trackType, 1);
        }
    }
  }, [trackProgress, userId]);
  
  // Get progress value for a specific type
  const getProgressValue = useCallback((type: string): number => {
    return progress[type] || 0;
  }, [progress]);
  
  // Track multiple progress types at once
  const trackMultipleProgress = useCallback((progressUpdates: Record<string, number>) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      let updated = false;
      
      // Update each progress type
      Object.entries(progressUpdates).forEach(([type, amount]) => {
        const currentValue = prev[type] || 0;
        const newValue = currentValue + amount;
        
        // Call the onProgress callback if provided
        if (onProgress) {
          onProgress(type, newValue, currentValue);
        }
        
        newProgress[type] = newValue;
        updated = true;
      });
      
      return updated ? newProgress : prev;
    });
  }, [onProgress]);
  
  // Create the result object
  const result = useMemo((): ProgressTrackingResult => ({
    earnedPoints,
    progress,
    didUnlockAchievement: unlockedAchievements.length > 0,
    unlockedAchievements,
    updated: false,
    trackProgress,
    resetProgress,
    logActivity,
    getProgressValue,
    trackMultipleProgress
  }), [
    earnedPoints, 
    progress, 
    unlockedAchievements, 
    trackProgress, 
    resetProgress, 
    logActivity,
    getProgressValue,
    trackMultipleProgress
  ]);
  
  return result;
}
