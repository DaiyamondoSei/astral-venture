
import { AchievementData } from '@/components/onboarding/data/types';

// Create a single source of truth for achievement-related operations
export const achievementService = {
  /**
   * Calculate achievement progress percentage
   * @param achievement The achievement to calculate progress for
   * @param currentValue The current progress value
   * @returns Progress percentage (0-100)
   */
  calculateProgress: (achievement: AchievementData, currentValue: number): number => {
    if (!achievement.progressThreshold || achievement.progressThreshold <= 0) {
      return 100; // If no threshold is defined, achievement is complete
    }
    
    const progress = Math.min(100, Math.floor((currentValue / achievement.progressThreshold) * 100));
    return progress;
  },
  
  /**
   * Determine if an achievement should be awarded
   * @param achievement The achievement to check
   * @param currentValue The current value to check against
   * @param previouslyAwarded Whether this achievement was previously awarded
   * @returns Boolean indicating if achievement should be awarded
   */
  shouldAwardAchievement: (
    achievement: AchievementData, 
    currentValue: number,
    previouslyAwarded: boolean = false
  ): boolean => {
    // Don't award if already awarded (unless it's a progressive achievement)
    if (previouslyAwarded && achievement.type !== 'progressive') {
      return false;
    }
    
    // Handle different achievement types
    switch (achievement.type) {
      case 'streak':
        return currentValue >= (achievement.streakDays || 1);
        
      case 'progressive':
        // For tiered achievements, check if we've reached a new tier
        if (achievement.tieredLevels && achievement.tieredLevels.length > 0) {
          const nextTierIndex = achievement.tier ? achievement.tier : 0;
          const nextTierThreshold = achievement.tieredLevels[nextTierIndex];
          return nextTierThreshold && currentValue >= nextTierThreshold;
        }
        return currentValue >= (achievement.progressThreshold || 1);
        
      case 'milestone':
        return currentValue >= (achievement.progressThreshold || 1);
        
      default:
        return true; // For discovery, completion, and interaction types
    }
  },
  
  /**
   * Calculate points earned for an achievement
   * @param achievement The achievement to calculate points for
   * @param currentTier For tiered achievements, the current tier
   * @returns Number of points earned
   */
  calculatePoints: (achievement: AchievementData, currentTier?: number): number => {
    // For progressive achievements with tier-based points
    if (achievement.type === 'progressive' && 
        achievement.pointsPerTier && 
        achievement.pointsPerTier.length > 0 &&
        typeof currentTier === 'number') {
      
      // Get points for the current tier, or use the last defined tier
      const tierIndex = Math.min(currentTier, achievement.pointsPerTier.length - 1);
      return achievement.pointsPerTier[tierIndex] || achievement.points;
    }
    
    // Default to the achievement's base points
    return achievement.points;
  }
};
