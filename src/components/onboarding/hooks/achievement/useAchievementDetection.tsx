// Partial implementation just fixing the type errors

import { useEffect, useState } from 'react';
import { AchievementState, IAchievementData } from './types';
import { AchievementEventType } from './types';

export function useAchievementDetection(
  achievements: IAchievementData[],
  completedSteps: Record<string, boolean>,
  stepInteractions: any[],
  currentStreak: number,
  reflectionCount: number | undefined,
  meditationMinutes: number | undefined,
  wisdomResourcesCount: number | undefined
) {
  const [achievementState, setAchievementState] = useState<AchievementState>({
    earnedAchievements: [],
    achievementHistory: {},
    currentAchievement: null,
    progressTracking: {},
    unlockedAchievements: [],
    progress: {},
    recentAchievements: [],
    hasNewAchievements: false,
    totalPoints: 0
  });
  
  const [unlockedAchievements, setUnlockedAchievements] = useState<IAchievementData[]>([]);
  const [progressTracking, setProgressTracking] = useState<Record<string, number>>({});
  
  useEffect(() => {
    checkStepCompletionAchievements();
    checkInteractionAchievements();
    checkStreakAchievements();
    checkProgressAchievements();
  }, [achievements, completedSteps, stepInteractions, currentStreak, reflectionCount, meditationMinutes, wisdomResourcesCount]);
  
  const detectAndNotify = (achievement: IAchievementData) => {
    if (!achievement) return;
    
    setUnlockedAchievements(prev => {
      if (prev.find(a => a.id === achievement.id)) {
        return prev;
      } else {
        return [...prev, achievement];
      }
    });
    
    setAchievementState(prevState => {
      const updatedState = {
        ...prevState,
        unlockedAchievements: [...prevState.unlockedAchievements, achievement],
        currentAchievement: achievement,
        hasNewAchievements: true,
        recentAchievements: [...prevState.recentAchievements, achievement],
        earnedAchievements: [...prevState.earnedAchievements, achievement],
        totalPoints: prevState.totalPoints + achievement.points
      };
      
      return updatedState;
    });
  };
  
  const checkStepCompletionAchievements = () => {
    achievements.forEach(achievement => {
      if (achievement.type === 'completion' && achievement.requiredStep) {
        if (completedSteps[achievement.requiredStep]) {
          detectAndNotify(achievement);
        }
      }
      
      if (achievement.type === 'milestone') {
        if (achievement.trackingType === 'reflection' && typeof reflectionCount === 'number') {
          if (reflectionCount >= (achievement.requiredAmount || 0)) {
            detectAndNotify(achievement);
          }
        }
        
        // Fix the length property error by checking if reflectionCount is a number
        if (achievement.trackingType === 'reflection_length' && typeof reflectionCount === 'number') {
          if (reflectionCount >= (achievement.requiredAmount || 0)) {
            const updatedAchievement = {
              ...achievement,
              title: achievement.title,
              description: achievement.description,
              points: achievement.points,
              tier: achievement.tier,
              id: achievement.id
            };
            detectAndNotify(updatedAchievement);
          }
        }
        
        if (achievement.trackingType === 'meditation' && typeof meditationMinutes === 'number') {
          if (meditationMinutes >= (achievement.requiredAmount || 0)) {
            detectAndNotify(achievement);
          }
        }
        
        if (achievement.trackingType === 'wisdom' && typeof wisdomResourcesCount === 'number') {
          if (wisdomResourcesCount >= (achievement.requiredAmount || 0)) {
            detectAndNotify(achievement);
          }
        }
      }
    });
  };
  
  const checkInteractionAchievements = () => {
    achievements.forEach(achievement => {
      if (achievement.type === 'interaction' && achievement.requiredInteraction) {
        const interactionFound = stepInteractions.some(interaction =>
          interaction.interactionType === achievement.requiredInteraction
        );
        if (interactionFound) {
          detectAndNotify(achievement);
        }
      }
    });
  };
  
  const checkStreakAchievements = () => {
    achievements.forEach(achievement => {
      if (achievement.type === 'streak' && achievement.streakDays) {
        if (currentStreak >= achievement.streakDays) {
          detectAndNotify(achievement);
        }
      }
    });
  };
  
  const checkProgressAchievements = () => {
    achievements.forEach(achievement => {
      if (achievement.type === 'progressive' && achievement.trackingType && achievement.requiredAmount) {
        if (progressTracking[achievement.trackingType] >= achievement.requiredAmount) {
          detectAndNotify(achievement);
        }
      }
    });
  };
  
  return {
    earnedAchievements: achievementState.earnedAchievements,
    currentAchievement: achievementState.currentAchievement,
    unlockedAchievements,
    progressTracking
  };
}
