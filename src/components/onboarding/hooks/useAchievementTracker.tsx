
import { useState, useEffect } from 'react';
import { useProgressTracking } from './achievement/useProgressTracking';
import { useAchievementState } from './achievement/useAchievementState';
import { IAchievementData } from './achievement/types';
import { onboardingAchievements } from '../data';

interface UseAchievementTrackerProps {
  userId?: string;
  initialAchievements?: IAchievementData[];
  onUnlock?: (achievement: IAchievementData) => void;
}

/**
 * Hook to track and manage user achievements
 */
export function useAchievementTracker(props: UseAchievementTrackerProps = {}) {
  const { userId, initialAchievements = [], onUnlock } = props;
  
  // Initialize achievement state
  const achievementState = useAchievementState(initialAchievements);
  const [achievements] = useState<IAchievementData[]>(onboardingAchievements);
  
  // Create progress tracking
  const progressTracking = useProgressTracking(
    achievementState, 
    (newProgress) => {
      achievementState.progressTracking = newProgress;
    }
  );
  
  // Check for newly earned achievements based on progress
  useEffect(() => {
    // For each achievement, check if it should be unlocked
    achievements.forEach(achievement => {
      // Skip already earned achievements
      if (achievementState.earnedAchievements.some(a => a.id === achievement.id)) {
        return;
      }
      
      // Check if this achievement meets unlock conditions
      let shouldUnlock = false;
      
      // Different types of achievements have different unlock conditions
      if (achievement.trackingType && achievement.requiredAmount) {
        const currentValue = progressTracking.getProgressValue(achievement.trackingType);
        shouldUnlock = currentValue >= achievement.requiredAmount;
      }
      
      // Unlock the achievement if conditions are met
      if (shouldUnlock) {
        // Add to earned achievements
        achievementState.earnedAchievements.push(achievement);
        
        // Call onUnlock callback if provided
        if (onUnlock) {
          onUnlock(achievement);
        }
        
        // Update other achievement state properties
        achievementState.hasNewAchievements = true;
        achievementState.recentAchievements.push(achievement);
        achievementState.currentAchievement = achievement;
      }
    });
  }, [achievementState.progressTracking, achievements, onUnlock]);
  
  // Return the combined state and methods
  return {
    ...achievementState,
    ...progressTracking,
    checkAchievements: () => {
      // Functionality for manually checking achievements
      console.log('Checking achievements');
    }
  };
}

export default useAchievementTracker;
