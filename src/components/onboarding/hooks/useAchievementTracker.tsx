
import { useState, useEffect } from 'react';
import { onboardingAchievements, AchievementData } from '../onboardingData';

interface StepInteraction {
  stepId: string;
  interactionType: string;
}

export const useAchievementTracker = (userId: string, completedSteps: Record<string, boolean>) => {
  const [pendingAchievements, setPendingAchievements] = useState<AchievementData[]>([]);
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
      // Update local state with new achievements
      setPendingAchievements(prevAchievements => [...prevAchievements, ...newAchievements]);
      
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

  // Display achievements one at a time
  useEffect(() => {
    if (pendingAchievements.length > 0 && !currentAchievement) {
      // Take the first pending achievement and show it
      const nextAchievement = pendingAchievements[0];
      setCurrentAchievement(nextAchievement);
      
      // Remove it from the pending list
      setPendingAchievements(prevAchievements => prevAchievements.slice(1));
    }
  }, [pendingAchievements, currentAchievement]);

  const handleAchievementDismiss = () => {
    setCurrentAchievement(null);
  };

  // Determine user's primary interaction patterns
  const getUserInteractions = (stepInteractions: any[]) => {
    return stepInteractions.map(interaction => ({
      stepId: interaction.stepId,
      interactionType: interaction.interactionType
    }));
  };

  return {
    currentAchievement,
    handleAchievementDismiss,
    getUserInteractions
  };
};
