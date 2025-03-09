
import { useEffect, useState } from 'react';
import { IAchievementData } from '../../data/types';
import { useAchievementState } from './useAchievementState';

interface AchievementTrackerProps {
  onUnlock?: (achievement: IAchievementData) => void;
  onProgress?: (achievement: IAchievementData, progress: number) => void;
  achievementList?: IAchievementData[];
}

export function useAchievementTracker({
  onUnlock,
  onProgress,
  achievementList = [],
}: AchievementTrackerProps) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<IAchievementData[]>([]);
  const [inProgressAchievements, setInProgressAchievements] = useState<IAchievementData[]>([]);
  
  // Get achievement state from context
  const { 
    state: { achievements = [] },
    updateAchievement,
    unlockAchievement,
    getAchievementProgress,
  } = useAchievementState();
  
  // Handle achievement unlocking
  const handleUnlockAchievement = (achievement: IAchievementData) => {
    unlockAchievement(achievement.id);
    
    if (onUnlock) {
      onUnlock(achievement);
    }
    
    // Update local state
    setUnlockedAchievements(prev => [...prev, achievement]);
    setInProgressAchievements(prev => 
      prev.filter(a => a.id !== achievement.id)
    );
  };
  
  // Track progress for progressive achievements
  const trackProgress = (achievement: IAchievementData, progress: number) => {
    updateAchievement(achievement.id, { progress });
    
    if (onProgress) {
      onProgress(achievement, progress);
    }
    
    // If achievement is complete, unlock it
    if (progress >= 1) {
      handleUnlockAchievement(achievement);
    } else if (!inProgressAchievements.some(a => a.id === achievement.id)) {
      // Add to in-progress if not already there
      setInProgressAchievements(prev => [...prev, achievement]);
    }
  };
  
  return {
    unlockedAchievements,
    inProgressAchievements,
    trackProgress,
    unlockAchievement: handleUnlockAchievement,
    getProgress: getAchievementProgress,
  };
}
