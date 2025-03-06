
import { useState, useEffect } from 'react';
import { onboardingAchievements, AchievementData } from '../onboardingData';
import { StepInteraction } from '@/contexts/onboarding/types';

export const useAchievementTracker = (
  userId: string, 
  completedSteps: Record<string, boolean>,
  stepInteractions: StepInteraction[]
) => {
  const [earnedAchievements, setEarnedAchievements] = useState<AchievementData[]>([]);
  const [achievementHistory, setAchievementHistory] = useState<Record<string, {awarded: boolean, timestamp: string}>>({});
  const [currentAchievement, setCurrentAchievement] = useState<AchievementData | null>(null);

  // Load previously awarded achievements
  useEffect(() => {
    const storedAchievements = JSON.parse(localStorage.getItem(`achievements-${userId}`) || '{}');
    setAchievementHistory(storedAchievements);
  }, [userId]);

  // Check for achievements based on completed steps
  useEffect(() => {
    // Find achievements that should be awarded
    const newAchievements = onboardingAchievements.filter(achievement => {
      // Skip already earned achievements
      if (achievementHistory[achievement.id]?.awarded) return false;
      
      // Check if required step is completed
      if (achievement.requiredStep && completedSteps[achievement.requiredStep]) return true;
      
      // Check for interaction-based achievements
      if (achievement.requiredInteraction) {
        return stepInteractions.some(interaction => 
          interaction.interactionType === achievement.requiredInteraction);
      }
      
      // Check for multi-step achievements
      if (achievement.requiredSteps && achievement.requiredSteps.length > 0) {
        return achievement.requiredSteps.every(step => completedSteps[step]);
      }
      
      return false;
    });
    
    if (newAchievements.length > 0) {
      // Update earned achievements state
      setEarnedAchievements(prev => {
        const updatedAchievements = [...prev];
        
        newAchievements.forEach(achievement => {
          if (!updatedAchievements.find(a => a.id === achievement.id)) {
            updatedAchievements.push(achievement);
          }
        });
        
        return updatedAchievements;
      });
      
      // Store as awarded in localStorage
      const updatedAchievements = { ...achievementHistory };
      newAchievements.forEach(achievement => {
        updatedAchievements[achievement.id] = {
          awarded: true,
          timestamp: new Date().toISOString()
        };
      });
      
      localStorage.setItem(`achievements-${userId}`, JSON.stringify(updatedAchievements));
      setAchievementHistory(updatedAchievements);
    }
  }, [completedSteps, stepInteractions, achievementHistory, userId]);

  // Display current achievement
  useEffect(() => {
    if (earnedAchievements.length > 0 && !currentAchievement) {
      setCurrentAchievement(earnedAchievements[0]);
    }
  }, [earnedAchievements, currentAchievement]);

  const dismissAchievement = (achievementId: string) => {
    setEarnedAchievements(prevAchievements => 
      prevAchievements.filter(achievement => achievement.id !== achievementId)
    );
    setCurrentAchievement(null);
  };

  // Analyze user interaction patterns
  const getUserInteractions = () => {
    return stepInteractions.map(interaction => ({
      stepId: interaction.stepId,
      interactionType: interaction.interactionType
    }));
  };

  // Get total earned points
  const getTotalPoints = (): number => {
    return Object.keys(achievementHistory)
      .filter(id => achievementHistory[id].awarded)
      .reduce((total, id) => {
        const achievement = onboardingAchievements.find(a => a.id === id);
        return total + (achievement?.points || 0);
      }, 0);
  };

  return {
    earnedAchievements,
    currentAchievement,
    dismissAchievement,
    getUserInteractions,
    getTotalPoints,
    achievementHistory
  };
};
