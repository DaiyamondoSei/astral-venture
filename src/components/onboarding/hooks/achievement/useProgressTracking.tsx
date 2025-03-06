
import { useCallback } from 'react';
import { AchievementState } from './types';

export function useProgressTracking(
  state: AchievementState,
  setProgressTracking: React.Dispatch<React.SetStateAction<Record<string, number>>>
) {
  // Track progress for a specific value
  const trackProgress = useCallback((key: string, value: number) => {
    setProgressTracking(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setProgressTracking]);

  // Update progress from an activity
  const logActivity = useCallback((activity: string, value: number = 1) => {
    setProgressTracking(prev => ({
      ...prev,
      [activity]: (prev[activity] || 0) + value
    }));
  }, [setProgressTracking]);

  return {
    trackProgress,
    logActivity
  };
}
