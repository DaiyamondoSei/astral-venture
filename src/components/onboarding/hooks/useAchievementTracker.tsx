
import { useState, useEffect, useCallback } from 'react';
import { useAchievementProgress } from './achievement/useAchievementProgress';
import { useAchievementDisplay } from './achievement/useAchievementDisplay';
import { IAchievementData, AchievementTrackerProps, AchievementTrackerResult } from './achievement/types';

export const useAchievementTracker = (props: AchievementTrackerProps): AchievementTrackerResult => {
  const {
    onUnlock,
    achievementList = [],
    completedSteps = {},
    stepInteractions = [],
    userId = '',
    currentStreak = 0,
    reflectionCount = 0,
    meditationMinutes = 0,
    wisdomResourcesCount = 0,
    totalPoints = 0
  } = props;

  // Get achievement progress tracking functionality
  const achievementProgress = useAchievementProgress();
  
  // Get achievement display functionality
  const {
    currentAchievement,
    earnedAchievements,
    dismissAchievement,
    displayAchievement
  } = useAchievementDisplay();

  const [achievementHistory, setAchievementHistory] = useState<Record<string, any>>({});
  const [progressTracking, setProgressTracking] = useState<Record<string, number>>({});

  // Function to track progress for specific types
  const trackProgress = useCallback((type: string, amount: number) => {
    achievementProgress.updateProgress(type, amount);
    
    setProgressTracking(prev => ({
      ...prev,
      [type]: (prev[type] || 0) + amount
    }));
  }, [achievementProgress]);

  // Check completed steps for unlocking achievements
  useEffect(() => {
    Object.entries(completedSteps).forEach(([step, completed]) => {
      if (completed) {
        trackProgress(`step_${step}`, 1);
      }
    });
  }, [completedSteps, trackProgress]);

  // Check step interactions for unlocking achievements
  useEffect(() => {
    stepInteractions.forEach(interaction => {
      if (interaction && interaction.type) {
        trackProgress(`interaction_${interaction.type}`, 1);
      }
    });
  }, [stepInteractions, trackProgress]);

  // Check streak for unlocking achievements
  useEffect(() => {
    if (currentStreak > 0) {
      trackProgress('streak_days', currentStreak);
    }
  }, [currentStreak, trackProgress]);

  // Function to get achievement progress
  const getAchievementProgress = useCallback((achievementId: string): number => {
    const achievement = achievementList.find(a => a.id === achievementId);
    if (!achievement) return 0;
    
    return achievementProgress.calculateProgressForAchievement(achievement);
  }, [achievementList, achievementProgress]);

  // Function to get total achievement points
  const getTotalPoints = useCallback((): number => {
    return earnedAchievements.reduce((total, achievement) => total + (achievement.points || 0), 0);
  }, [earnedAchievements]);

  // Function to get overall progress percentage
  const getProgressPercentage = useCallback((): number => {
    if (achievementList.length === 0) return 0;
    return (earnedAchievements.length / achievementList.length) * 100;
  }, [achievementList, earnedAchievements]);

  return {
    earnedAchievements,
    currentAchievement,
    dismissAchievement,
    getAchievementProgress,
    getTotalPoints,
    getProgressPercentage,
    achievementHistory,
    progressTracking,
    trackProgress
  };
};

export default useAchievementTracker;
