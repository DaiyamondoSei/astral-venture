
import { useState, useEffect, useCallback } from 'react';
import { IAchievementData, AchievementState } from './types';

/**
 * Hook to track progress of achievements
 */
export function useAchievementProgress(achievementState: AchievementState) {
  const [achievementProgress, setAchievementProgress] = useState<Record<string, number>>({});
  
  // Initialize achievement progress
  useEffect(() => {
    if (achievementState.achievements) {
      const initialProgress: Record<string, number> = {};
      
      // Initialize progress for each achievement
      achievementState.achievements.forEach(achievement => {
        initialProgress[achievement.id] = achievement.progress || 0;
      });
      
      setAchievementProgress(initialProgress);
    }
  }, [achievementState.achievements]);
  
  // Update progress for a specific achievement
  const updateProgress = useCallback((achievementId: string, progressValue: number) => {
    if (!achievementId) return;
    
    setAchievementProgress(prev => ({
      ...prev,
      [achievementId]: Math.min(1, progressValue)
    }));
    
    // If achievement has an updateAchievement method, use it
    if (achievementState.updateAchievement) {
      achievementState.updateAchievement(achievementId, { progress: progressValue });
    }
  }, [achievementState]);
  
  // Calculate progress based on tracking type
  const calculateProgressForAchievement = useCallback((achievement: IAchievementData) => {
    if (!achievement) return 0;
    
    // For streak-based achievements
    if (achievement.type === 'streak' && achievement.streakDays && achievementState.progressTracking.streakDays) {
      const currentStreak = achievementState.progressTracking.streakDays;
      return Math.min(1, currentStreak / achievement.streakDays);
    }
    
    // For progressive achievements with a tracking type
    if (achievement.trackingType && achievement.requiredAmount) {
      const currentValue = achievementState.progressTracking[achievement.trackingType] || 0;
      return Math.min(1, currentValue / achievement.requiredAmount);
    }
    
    // For step-based achievements
    if (achievement.requiredSteps && Array.isArray(achievement.requiredSteps) && achievementState.progress) {
      let completedSteps = 0;
      
      achievement.requiredSteps.forEach(step => {
        if (achievementState.progress[step]) {
          completedSteps++;
        }
      });
      
      return Math.min(1, completedSteps / achievement.requiredSteps.length);
    }
    
    // For completed achievements
    if (achievementState.earnedAchievements.some(a => a.id === achievement.id)) {
      return 1;
    }
    
    return achievementProgress[achievement.id] || 0;
  }, [achievementState, achievementProgress]);
  
  // Get all achievements with their progress
  const getAchievementsWithProgress = useCallback(() => {
    if (!achievementState.achievements) return [];
    
    return achievementState.achievements.map(achievement => ({
      ...achievement,
      progress: calculateProgressForAchievement(achievement)
    }));
  }, [achievementState.achievements, calculateProgressForAchievement]);
  
  return {
    achievementProgress,
    updateProgress,
    calculateProgressForAchievement,
    getAchievementsWithProgress
  };
}
