
import { useState, useEffect, useCallback } from 'react';
import { onboardingAchievements, streakAchievements, progressiveAchievements, milestoneAchievements, AchievementData } from '../data';
import { StepInteraction } from '@/contexts/onboarding/types';
import { useToast } from '@/components/ui/use-toast';

export const useAchievementTracker = (
  userId: string, 
  completedSteps: Record<string, boolean>,
  stepInteractions: StepInteraction[],
  currentStreak: number = 0,
  reflectionCount: number = 0,
  meditationMinutes: number = 0,
  totalPoints: number = 0,
  uniqueChakrasActivated: number = 0,
  wisdomResourcesExplored: number = 0
) => {
  const [earnedAchievements, setEarnedAchievements] = useState<AchievementData[]>([]);
  const [achievementHistory, setAchievementHistory] = useState<Record<string, {awarded: boolean, timestamp: string, tier?: number}>>({});
  const [currentAchievement, setCurrentAchievement] = useState<AchievementData | null>(null);
  const [progressTracking, setProgressTracking] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Load previously awarded achievements
  useEffect(() => {
    const storedAchievements = JSON.parse(localStorage.getItem(`achievements-${userId}`) || '{}');
    setAchievementHistory(storedAchievements);
    
    // Initialize progress tracking
    setProgressTracking({
      streakDays: currentStreak,
      reflections: reflectionCount,
      meditation_minutes: meditationMinutes,
      total_energy_points: totalPoints,
      unique_chakras_activated: uniqueChakrasActivated,
      wisdom_resources_explored: wisdomResourcesExplored
    });
  }, [userId, currentStreak, reflectionCount, meditationMinutes, totalPoints, uniqueChakrasActivated, wisdomResourcesExplored]);

  // Update progress tracking when values change
  useEffect(() => {
    setProgressTracking(prev => ({
      ...prev,
      streakDays: currentStreak,
      reflections: reflectionCount,
      meditation_minutes: meditationMinutes,
      total_energy_points: totalPoints,
      unique_chakras_activated: uniqueChakrasActivated,
      wisdom_resources_explored: wisdomResourcesExplored
    }));
  }, [currentStreak, reflectionCount, meditationMinutes, totalPoints, uniqueChakrasActivated, wisdomResourcesExplored]);

  // Check for achievements based on completed steps
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
          if (achievement.streakDays && currentStreak >= achievement.streakDays) {
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
          
        case 'progressive':
          // Progressive achievements are handled separately
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
  }, [completedSteps, stepInteractions, achievementHistory, userId, toast, progressTracking]);

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

  // Track progress for a specific value
  const trackProgress = useCallback((key: string, value: number) => {
    setProgressTracking(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Update progress from an activity
  const logActivity = useCallback((activity: string, value: number = 1) => {
    setProgressTracking(prev => ({
      ...prev,
      [activity]: (prev[activity] || 0) + value
    }));
  }, []);

  // Get achievement progress percentage for a specific achievement
  const getAchievementProgress = useCallback((achievementId: string): number => {
    const achievement = [...onboardingAchievements, ...progressiveAchievements, ...milestoneAchievements]
      .find(a => a.id === achievementId);
      
    if (!achievement) return 0;
    
    // Handle different achievement types
    switch (achievement.type) {
      case 'streak':
        if (!achievement.streakDays) return 0;
        return Math.min(100, (currentStreak / achievement.streakDays) * 100);
        
      case 'milestone':
        if (!achievement.progressThreshold || !achievement.trackedValue) return 0;
        const currentValue = progressTracking[achievement.trackedValue] || 0;
        return Math.min(100, (currentValue / achievement.progressThreshold) * 100);
        
      case 'progressive':
        if (!achievement.tieredLevels || !achievement.trackedValue) return 0;
        
        const value = progressTracking[achievement.trackedValue] || 0;
        const currentTier = achievementHistory[achievement.id]?.tier || 0;
        
        // If all tiers are complete
        if (currentTier >= achievement.tieredLevels.length) {
          return 100;
        }
        
        // Calculate progress to next tier
        const currentThreshold = currentTier > 0 ? achievement.tieredLevels[currentTier - 1] : 0;
        const nextThreshold = achievement.tieredLevels[currentTier];
        const tierProgress = ((value - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
        
        return Math.min(100, tierProgress);
        
      default:
        // For step-based achievements, check if it's completed
        if (achievementHistory[achievement.id]?.awarded) {
          return 100;
        }
        
        // For multi-step achievements, calculate percentage of completed steps
        if (achievement.requiredSteps) {
          const completedCount = achievement.requiredSteps.filter(step => completedSteps[step]).length;
          return (completedCount / achievement.requiredSteps.length) * 100;
        }
        
        return 0;
    }
  }, [achievementHistory, completedSteps, currentStreak, progressTracking]);

  // Get total earned points
  const getTotalPoints = useCallback((): number => {
    return Object.keys(achievementHistory)
      .filter(id => achievementHistory[id].awarded)
      .reduce((total, id) => {
        const achievement = onboardingAchievements.find(a => a.id === id);
        // For progressive achievements, need to look at the tier
        if (achievement?.type === 'progressive' && achievement.pointsPerTier) {
          const tier = achievementHistory[id].tier || 0;
          if (tier > 0 && tier <= achievement.pointsPerTier.length) {
            return total + achievement.pointsPerTier[tier - 1];
          }
        }
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
    trackProgress,
    logActivity,
    getAchievementProgress,
    getTotalPoints,
    getProgressPercentage,
    achievementHistory,
    progressTracking
  };
};
