
import { useState, useEffect } from 'react';
import { useAchievementTracker as useInternalAchievementTracker } from './achievement/useAchievementTracker';
import { AchievementTrackerProps, IAchievementData } from './achievement/types';

interface UseAchievementTrackerExtraProps {
  userId?: string;
  completedSteps?: Record<string, boolean>;
  stepInteractions?: any[];
  currentStreak?: number;
  reflectionCount?: number;
  meditationMinutes?: number;
  totalPoints?: number;
  uniqueChakrasActivated?: number;
  wisdomResourcesExplored?: number;
}

export function useAchievementTracker(props: AchievementTrackerProps, extraProps: UseAchievementTrackerExtraProps) {
  // Create internal props
  const internalProps: AchievementTrackerProps = {
    ...props,
    userId: extraProps.userId,
    completedSteps: extraProps.completedSteps,
    stepInteractions: extraProps.stepInteractions,
    currentStreak: extraProps.currentStreak,
    reflectionCount: extraProps.reflectionCount,
    meditationMinutes: extraProps.meditationMinutes
  };
  
  // Use the internal achievement tracker
  const trackerResult = useInternalAchievementTracker(internalProps);
  
  // Track additional statistics
  useEffect(() => {
    if (extraProps.totalPoints) {
      trackerResult.trackProgress?.('total_energy_points', extraProps.totalPoints);
    }
    if (extraProps.uniqueChakrasActivated) {
      trackerResult.trackProgress?.('unique_chakras_activated', extraProps.uniqueChakrasActivated);
    }
    if (extraProps.wisdomResourcesExplored) {
      trackerResult.trackProgress?.('wisdom_resources_explored', extraProps.wisdomResourcesExplored);
    }
  }, [
    extraProps.totalPoints,
    extraProps.uniqueChakrasActivated,
    extraProps.wisdomResourcesExplored,
    trackerResult.trackProgress
  ]);
  
  return trackerResult;
}
