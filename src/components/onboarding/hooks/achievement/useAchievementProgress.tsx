
import { useCallback } from 'react';
import { onboardingAchievements, progressiveAchievements, milestoneAchievements } from '../../data';
import { AchievementState, AchievementTrackerProps } from './types';

export function useAchievementProgress(
  props: AchievementTrackerProps,
  state: AchievementState
) {
  const { completedSteps = {} } = props;
  const { achievementHistory, progressTracking } = state;

  // Get achievement progress percentage for a specific achievement
  const getAchievementProgress = useCallback((achievementId: string): number => {
    const achievement = [...onboardingAchievements, ...progressiveAchievements, ...milestoneAchievements]
      .find(a => a.id === achievementId);
      
    if (!achievement) return 0;
    
    // Handle different achievement types
    switch (achievement.type) {
      case 'streak':
        if (!achievement.streakDays) return 0;
        return Math.min(100, (progressTracking.streakDays / achievement.streakDays) * 100);
        
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
    
    return 0;
  }, [achievementHistory, completedSteps, progressTracking]);

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
    getAchievementProgress,
    getTotalPoints,
    getProgressPercentage
  };
}
