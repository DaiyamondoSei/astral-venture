
import { useState, useEffect, useCallback } from 'react';
import { AchievementTrackerProps, IAchievementData, AchievementTrackerResult } from './types';
import { onboardingAchievements } from '../../data';

// Additional tracking data interface
interface ExtraTrackingData {
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

/**
 * Main hook for tracking achievements throughout the application
 * 
 * @param props Base configuration props
 * @param extraData Additional tracking data needed for achievement detection
 * @returns Achievement tracking functionality
 */
export function useAchievementTracker(
  props: AchievementTrackerProps,
  extraData?: ExtraTrackingData
): AchievementTrackerResult {
  // Initialize state
  const [earnedAchievements, setEarnedAchievements] = useState<IAchievementData[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<IAchievementData | null>(null);
  const [achievementHistory, setAchievementHistory] = useState<Record<string, any>>({});
  const [progressTracking, setProgressTracking] = useState<Record<string, number>>({
    reflections: extraData?.reflectionCount || 0,
    meditation_minutes: extraData?.meditationMinutes || 0,
    chakras_activated: extraData?.uniqueChakrasActivated || 0,
    wisdom_resources_explored: extraData?.wisdomResourcesExplored || 0,
    streakDays: extraData?.currentStreak || 0,
    total_energy_points: extraData?.totalPoints || 0
  });

  // Use achievements from props or default onboarding achievements
  const achievements = props.achievementList || onboardingAchievements;

  // Handle achievement unlocking
  const unlockAchievement = useCallback((achievement: IAchievementData) => {
    setEarnedAchievements(prev => {
      // Check if already earned
      if (prev.some(a => a.id === achievement.id)) {
        return prev;
      }
      
      // Add to earned achievements
      const newAchievements = [...prev, achievement];
      
      // Set as current achievement to display
      setCurrentAchievement(achievement);
      
      // Add to history
      setAchievementHistory(prev => ({
        ...prev,
        [achievement.id]: {
          timestamp: new Date().toISOString(),
          points: achievement.points
        }
      }));
      
      // Call onUnlock callback if provided
      if (props.onUnlock) {
        props.onUnlock(achievement);
      }
      
      return newAchievements;
    });
  }, [props]);
  
  // Dismiss current achievement notification
  const dismissAchievement = useCallback(() => {
    setCurrentAchievement(null);
  }, []);
  
  // Get achievement progress
  const getAchievementProgress = useCallback((id: string) => {
    const achievement = achievements.find(a => a.id === id);
    if (!achievement) return 0;
    
    // Different types of achievements have different progress tracking
    if (achievement.trackingType) {
      const currentValue = progressTracking[achievement.trackingType] || 0;
      return Math.min(1, currentValue / (achievement.requiredAmount || 1));
    }
    
    return earnedAchievements.some(a => a.id === id) ? 1 : 0;
  }, [achievements, progressTracking, earnedAchievements]);
  
  // Get total points earned
  const getTotalPoints = useCallback(() => {
    return earnedAchievements.reduce((total, achievement) => total + achievement.points, 0);
  }, [earnedAchievements]);
  
  // Get overall progress percentage
  const getProgressPercentage = useCallback(() => {
    const totalAchievements = achievements.length;
    const earnedCount = earnedAchievements.length;
    
    if (totalAchievements === 0) return 0;
    return (earnedCount / totalAchievements) * 100;
  }, [achievements, earnedAchievements]);

  // The complete tracker result
  return {
    earnedAchievements,
    currentAchievement,
    dismissAchievement,
    getAchievementProgress,
    getTotalPoints,
    getProgressPercentage,
    achievementHistory,
    progressTracking
  };
}
