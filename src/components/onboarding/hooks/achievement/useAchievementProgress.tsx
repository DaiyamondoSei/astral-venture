
import { useState, useCallback, useEffect } from 'react';
import { IAchievementData } from '../../data/types';

/**
 * Hook for tracking achievement progress across the application
 */
export function useAchievementProgress() {
  // Store achievement progress as achievementId -> progress value
  const [achievementProgress, setAchievementProgress] = useState<Record<string, number>>({});

  // Initialize achievements from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('achievementProgress');
      if (stored) {
        setAchievementProgress(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading achievement progress:', error);
    }
  }, []);

  // Update progress for an achievement
  const updateProgress = useCallback((achievementId: string, progressValue: number) => {
    setAchievementProgress(prev => {
      const updated = { ...prev, [achievementId]: progressValue };
      
      // Persist to localStorage
      try {
        localStorage.setItem('achievementProgress', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving achievement progress:', error);
      }
      
      return updated;
    });
  }, []);

  // Calculate progress percentage for an achievement
  const calculateProgressForAchievement = useCallback((achievement: IAchievementData): number => {
    if (!achievement || !achievement.id) return 0;
    
    // Get current progress value
    const currentProgress = achievementProgress[achievement.id] || 0;
    
    // Calculate as percentage of required amount
    if (achievement.requiredAmount) {
      return Math.min(100, (currentProgress / achievement.requiredAmount) * 100);
    }
    
    return currentProgress;
  }, [achievementProgress]);

  // Get all achievements with their current progress
  const getAchievementsWithProgress = useCallback(() => {
    return [];
  }, []);

  return {
    achievementProgress,
    updateProgress,
    calculateProgressForAchievement,
    getAchievementsWithProgress
  };
}
