
import { useState, useEffect, useCallback } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAchievementState } from './useAchievementState';
import { IAchievementData } from '@/components/onboarding/hooks/achievement/types';

interface ProgressTrackerResult {
  trackProgress: (achievementId: string, value?: number) => void;
  getCurrentProgress: (achievementId: string) => number;
  isAchievementComplete: (achievementId: string) => boolean;
  getProgressPercentage: (achievementId: string) => number;
}

export const useAchievementProgress = (): ProgressTrackerResult => {
  const { trackStepInteraction } = useOnboarding();
  const { achievements, updateAchievement } = useAchievementState();
  
  // Track progress for an achievement
  const trackProgress = useCallback((achievementId: string, value = 1) => {
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (!achievement) {
      console.warn(`Achievement with ID ${achievementId} not found`);
      return;
    }
    
    // Clone achievement to modify it
    const updatedAchievement = { ...achievement };
    
    // Safely handle progress property
    const currentProgress = typeof updatedAchievement.progress === 'number' 
      ? updatedAchievement.progress 
      : 0;
    
    // Update progress
    updatedAchievement.progress = currentProgress + value;
    
    // Check if achievement is completed
    const requiredAmount = updatedAchievement.requiredAmount || 1;
    const isComplete = (updatedAchievement.progress >= requiredAmount);
    
    // If newly completed, set awarded flag
    if (isComplete && !updatedAchievement.awarded) {
      updatedAchievement.awarded = true;
      
      // Log interaction for tracking
      trackStepInteraction(achievementId, 'achievement_completed');
    }
    
    // Save updated achievement
    updateAchievement(updatedAchievement);
    
    return updatedAchievement;
  }, [achievements, updateAchievement, trackStepInteraction]);
  
  // Get current progress
  const getCurrentProgress = useCallback((achievementId: string): number => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;
    
    return typeof achievement.progress === 'number' ? achievement.progress : 0;
  }, [achievements]);
  
  // Check if achievement is complete
  const isAchievementComplete = useCallback((achievementId: string): boolean => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return false;
    
    // If awarded flag is set, achievement is complete
    if (achievement.awarded) return true;
    
    // Check progress against required amount
    const progress = typeof achievement.progress === 'number' ? achievement.progress : 0;
    const requiredAmount = achievement.requiredAmount || 1;
    
    return progress >= requiredAmount;
  }, [achievements]);
  
  // Calculate progress percentage
  const getProgressPercentage = useCallback((achievementId: string): number => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;
    
    const progress = typeof achievement.progress === 'number' ? achievement.progress : 0;
    const requiredAmount = achievement.requiredAmount || 1;
    
    // Ensure percentage is between 0 and 100
    const percentage = Math.min(100, Math.max(0, (progress / requiredAmount) * 100));
    return Math.round(percentage);
  }, [achievements]);
  
  return {
    trackProgress,
    getCurrentProgress,
    isAchievementComplete,
    getProgressPercentage
  };
};
