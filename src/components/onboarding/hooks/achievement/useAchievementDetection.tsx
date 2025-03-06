
import { useEffect } from 'react';
import { AchievementData } from '../../data/types';
import { onboardingAchievements, progressiveAchievements } from '../../data';
import { useToast } from '@/components/ui/use-toast';
import { AchievementState, AchievementTrackerProps } from './types';

export function useAchievementDetection(
  props: AchievementTrackerProps,
  state: AchievementState,
  setEarnedAchievements: React.Dispatch<React.SetStateAction<AchievementData[]>>,
  setAchievementHistory: React.Dispatch<React.SetStateAction<Record<string, {awarded: boolean, timestamp: string, tier?: number}>>>
) {
  const { completedSteps, stepInteractions, userId } = props;
  const { achievementHistory, progressTracking } = state;
  const { toast } = useToast();

  // Check for achievements based on completed steps and other criteria
  useEffect(() => {
    // Find achievements that should be awarded
    const newAchievements: AchievementData[] = [];
    
    // Check step-based and interaction-based achievements
    onboardingAchievements.forEach(achievement => {
      // Skip already earned achievements
      if (achievementHistory[achievement.id]?.awarded) return;
      
      let shouldAward = false;
      
      // Check achievement type
      switch (achievement.type) {
        case 'discovery':
        case 'completion':
          // Check if required step is completed
          if (achievement.requiredStep && completedSteps[achievement.requiredStep]) {
            shouldAward = true;
          }
          
          // Check for multi-step achievements
          if (achievement.requiredSteps && achievement.requiredSteps.length > 0) {
            shouldAward = achievement.requiredSteps.every(step => completedSteps[step]);
          }
          break;
          
        case 'interaction':
          // Check for interaction-based achievements
          if (achievement.requiredInteraction) {
            shouldAward = stepInteractions.some(interaction => 
              interaction.interactionType === achievement.requiredInteraction);
          }
          break;
          
        case 'streak':
          // Check streak-based achievements
          if (achievement.streakDays && progressTracking.streakDays >= achievement.streakDays) {
            shouldAward = true;
          }
          break;
          
        case 'milestone':
          // Check milestone achievements
          if (achievement.progressThreshold && achievement.trackedValue) {
            const currentValue = progressTracking[achievement.trackedValue] || 0;
            shouldAward = currentValue >= achievement.progressThreshold;
          }
          break;
      }
      
      if (shouldAward) {
        newAchievements.push(achievement);
      }
    });
    
    // Check progressive achievements
    progressiveAchievements.forEach(achievement => {
      if (!achievement.tieredLevels || !achievement.pointsPerTier || !achievement.trackedValue) {
        return;
      }
      
      const currentValue = progressTracking[achievement.trackedValue] || 0;
      const currentTier = achievementHistory[achievement.id]?.tier || 0;
      
      // Find the next tier that hasn't been achieved yet
      let nextTierIndex = currentTier;
      
      // Make sure we don't go beyond the available tiers
      if (nextTierIndex < achievement.tieredLevels.length) {
        const nextTierThreshold = achievement.tieredLevels[nextTierIndex];
        
        // Check if the user has reached the next tier
        if (currentValue >= nextTierThreshold) {
          const tierAchievement = { 
            ...achievement,
            title: `${achievement.title} (Tier ${nextTierIndex + 1})`,
            description: `${achievement.description} - Level ${nextTierIndex + 1}`,
            points: achievement.pointsPerTier[nextTierIndex],
            tier: nextTierIndex + 1
          };
          
          newAchievements.push(tierAchievement);
        }
      }
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
        const tierInfo = achievement.tier || undefined;
        
        updatedAchievements[achievement.id] = {
          awarded: true,
          timestamp: new Date().toISOString(),
          ...(tierInfo && { tier: tierInfo })
        };
      });
      
      localStorage.setItem(`achievements-${userId}`, JSON.stringify(updatedAchievements));
      setAchievementHistory(updatedAchievements);
    }
  }, [completedSteps, stepInteractions, achievementHistory, userId, toast, progressTracking, setEarnedAchievements, setAchievementHistory]);
}
