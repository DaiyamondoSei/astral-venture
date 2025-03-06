
import { useState, useEffect } from 'react';
import { onboardingAchievements, AchievementData } from '../onboardingData';
import { StepInteraction } from '@/contexts/onboarding/types';

export const useAchievementTracker = (
  userId: string, 
  completedSteps: Record<string, boolean>,
  stepInteractions: StepInteraction[]
) => {
  const [earnedAchievements, setEarnedAchievements] = useState<AchievementData[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementData | null>(null);

  // Check for achievements based on completed steps
  useEffect(() => {
    const storedAchievements = JSON.parse(localStorage.getItem(`achievements-${userId}`) || '{}');
    
    // Find achievements that should be awarded
    const newAchievements = onboardingAchievements.filter(achievement => {
      // If it requires a specific step and that step is completed
      return achievement.requiredStep && 
             completedSteps[achievement.requiredStep] && 
             !storedAchievements[achievement.id];
    });
    
    if (newAchievements.length > 0) {
      // Update earned achievements state
      setEarnedAchievements(prevAchievements => {
        const updatedAchievements = [...prevAchievements];
        newAchievements.forEach(achievement => {
          if (!updatedAchievements.find(a => a.id === achievement.id)) {
            updatedAchievements.push(achievement);
          }
        });
        return updatedAchievements;
      });
      
      // Store as awarded in localStorage
      const updatedAchievements = { ...storedAchievements };
      newAchievements.forEach(achievement => {
        updatedAchievements[achievement.id] = {
          awarded: true,
          timestamp: new Date().toISOString()
        };
      });
      
      localStorage.setItem(`achievements-${userId}`, JSON.stringify(updatedAchievements));
    }
  }, [completedSteps, userId]);

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

  // Analyze user interaction patterns (could be used for future achievements)
  const getUserInteractions = () => {
    return stepInteractions.map(interaction => ({
      stepId: interaction.stepId,
      interactionType: interaction.interactionType
    }));
  };

  return {
    earnedAchievements,
    currentAchievement,
    dismissAchievement,
    getUserInteractions
  };
};
