
import { useState, useEffect, useCallback } from 'react';
import { onboardingAchievements, AchievementData } from '../data';
import { StepInteraction } from '@/contexts/onboarding/types';
import { useToast } from '@/components/ui/use-toast';

export const useAchievementTracker = (
  userId: string, 
  completedSteps: Record<string, boolean>,
  stepInteractions: StepInteraction[]
) => {
  const [earnedAchievements, setEarnedAchievements] = useState<AchievementData[]>([]);
  const [achievementHistory, setAchievementHistory] = useState<Record<string, {awarded: boolean, timestamp: string}>>({});
  const [currentAchievement, setCurrentAchievement] = useState<AchievementData | null>(null);
  const { toast } = useToast();

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
            
            // Show toast notification for new achievement
            toast({
              title: "Achievement Unlocked!",
              description: `${achievement.title}: ${achievement.description}`,
              duration: 5000,
            });
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
  }, [completedSteps, stepInteractions, achievementHistory, userId, toast]);

  // Display current achievement
  useEffect(() => {
    if (earnedAchievements.length > 0 && !currentAchievement) {
      setCurrentAchievement(earnedAchievements[0]);
    }
  }, [earnedAchievements, currentAchievement]);

  const dismissAchievement = useCallback((achievementId: string) => {
    setEarnedAchievements(prevAchievements => 
      prevAchievements.filter(achievement => achievement.id !== achievementId)
    );
    setCurrentAchievement(null);
  }, []);

  // Analyze user interaction patterns
  const getUserInteractions = useCallback(() => {
    return stepInteractions.map(interaction => ({
      stepId: interaction.stepId,
      interactionType: interaction.interactionType
    }));
  }, [stepInteractions]);

  // Get total earned points
  const getTotalPoints = useCallback((): number => {
    return Object.keys(achievementHistory)
      .filter(id => achievementHistory[id].awarded)
      .reduce((total, id) => {
        const achievement = onboardingAchievements.find(a => a.id === id);
        return total + (achievement?.points || 0);
      }, 0);
  }, [achievementHistory]);
  
  // Get progress percentage towards next milestone
  const getProgressPercentage = useCallback((): number => {
    const totalPoints = getTotalPoints();
    const milestone = Math.ceil(totalPoints / 100) * 100;
    const prevMilestone = milestone - 100;
    
    const progressToNextMilestone = totalPoints - prevMilestone;
    const percentageComplete = (progressToNextMilestone / 100) * 100;
    
    return Math.min(Math.round(percentageComplete), 100);
  }, [getTotalPoints]);

  return {
    earnedAchievements,
    currentAchievement,
    dismissAchievement,
    getUserInteractions,
    getTotalPoints,
    getProgressPercentage,
    achievementHistory
  };
};
