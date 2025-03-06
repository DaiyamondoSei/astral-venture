
import { useState } from 'react';
import { useCallback } from 'react';
import { AchievementData } from '../../data/types';
import { AchievementTrackerProps } from './types';
import { useAchievementState } from './useAchievementState';
import { useAchievementDetection } from './useAchievementDetection';
import { useAchievementProgress } from './useAchievementProgress';
import { useProgressTracking } from './useProgressTracking';

export function useAchievementTracker(props: AchievementTrackerProps) {
  const [earnedAchievements, setEarnedAchievements] = useState<AchievementData[]>([]);
  
  // Initialize state
  const state = useAchievementState({
    ...props,
    currentStreak: props.currentStreak || 0,
    reflectionCount: props.reflectionCount || 0,
    meditationMinutes: props.meditationMinutes || 0,
    totalPoints: props.totalPoints || 0,
    uniqueChakrasActivated: props.uniqueChakrasActivated || 0,
    wisdomResourcesExplored: props.wisdomResourcesExplored || 0
  });

  // Extract state and setters for sub-hooks
  const { achievementHistory, currentAchievement, progressTracking } = state;
  const [achievementHistoryState, setAchievementHistory] = useState(achievementHistory);
  const [progressTrackingState, setProgressTracking] = useState(progressTracking);

  // Track achievement progress
  useAchievementDetection(
    props,
    { ...state, achievementHistory: achievementHistoryState, progressTracking: progressTrackingState },
    setEarnedAchievements,
    setAchievementHistory
  );

  // Get achievement progress calculations
  const { 
    getAchievementProgress, 
    getTotalPoints, 
    getProgressPercentage 
  } = useAchievementProgress(
    props,
    { ...state, achievementHistory: achievementHistoryState, progressTracking: progressTrackingState }
  );

  // Get progress tracking utilities
  const { trackProgress, logActivity } = useProgressTracking(
    { ...state, progressTracking: progressTrackingState },
    setProgressTracking
  );

  // Dismiss achievement
  const dismissAchievement = useCallback((achievementId: string) => {
    setEarnedAchievements(prevAchievements => 
      prevAchievements.filter(achievement => achievement.id !== achievementId)
    );
  }, []);

  return {
    earnedAchievements,
    currentAchievement,
    dismissAchievement,
    trackProgress,
    logActivity,
    getAchievementProgress,
    getTotalPoints,
    getProgressPercentage,
    achievementHistory: achievementHistoryState,
    progressTracking: progressTrackingState
  };
}
