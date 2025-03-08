
import { useState, useCallback, useEffect } from 'react';
import { AchievementData } from '../../data/types';
import { AchievementTrackerProps, AchievementState, AchievementTrackerResult } from './types';
import { useAchievementState } from './useAchievementState';
import { useAchievementDetection } from './useAchievementDetection';
import { useAchievementProgress } from './useAchievementProgress';
import { useProgressTracking } from './useProgressTracking';

export function useAchievementTracker(props: AchievementTrackerProps): AchievementTrackerResult {
  const [earnedAchievements, setEarnedAchievements] = useState<AchievementData[]>([]);
  
  // Initialize state with proper defaults
  const achievementState = useAchievementState({
    achievements: props.achievements || [],
    currentStreak: props.currentStreak || 0,
    reflectionCount: props.reflectionCount || 0,
    meditationMinutes: props.meditationMinutes || 0,
    totalPoints: props.totalPoints || 0,
    uniqueChakrasActivated: props.uniqueChakrasActivated || 0,
    wisdomResourcesExplored: props.wisdomResourcesExplored || 0
  });

  // Extract state for sub-hooks
  const [state, actions] = achievementState;
  const [achievementHistoryState, setAchievementHistory] = useState(state.achievementHistory || []);
  const [progressTrackingState, setProgressTracking] = useState(state.progressTracking || {});
  const [currentAchievement, setCurrentAchievement] = useState(state.currentAchievement);

  // Track achievement progress
  useAchievementDetection(
    props,
    { 
      ...state, 
      achievementHistory: achievementHistoryState, 
      progressTracking: progressTrackingState,
      earnedAchievements,
      currentAchievement
    },
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
    { 
      ...state, 
      achievementHistory: achievementHistoryState, 
      progressTracking: progressTrackingState,
      earnedAchievements,
      currentAchievement
    }
  );

  // Get progress tracking utilities
  const { trackProgress, logActivity } = useProgressTracking(
    { 
      ...state, 
      progressTracking: progressTrackingState,
      achievementHistory: achievementHistoryState,
      earnedAchievements,
      currentAchievement
    },
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
