
import { AchievementData } from '@/components/onboarding/data/types';
import { AchievementEvent, AchievementEventType } from '@/components/onboarding/hooks/achievement/types';

// Event listeners for the achievement system
const eventListeners: Record<string, Function[]> = {};

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
  },
  
  /**
   * Get the next achievement to focus on
   * @param allAchievements List of all available achievements
   * @param completedAchievementIds IDs of completed achievements
   * @param progressData Current progress tracking data
   * @returns The next achievement to focus on, or null if all complete
   */
  getNextAchievement: (
    allAchievements: AchievementData[],
    completedAchievementIds: string[],
    progressData: Record<string, number>
  ): AchievementData | null => {
    // Filter to incomplete achievements
    const incompleteAchievements = allAchievements.filter(
      a => !completedAchievementIds.includes(a.id)
    );
    
    if (incompleteAchievements.length === 0) return null;
    
    // Find achievement closest to completion
    let highestProgress = -1;
    let nextAchievement: AchievementData | null = null;
    
    incompleteAchievements.forEach(achievement => {
      let progress = 0;
      
      // Calculate progress based on achievement type
      if (achievement.type === 'streak' && achievement.streakDays) {
        const streakDays = progressData.streakDays || 0;
        progress = (streakDays / achievement.streakDays) * 100;
      } 
      else if (achievement.type === 'milestone' && achievement.progressThreshold && achievement.trackedValue) {
        const currentValue = progressData[achievement.trackedValue] || 0;
        progress = (currentValue / achievement.progressThreshold) * 100;
      }
      else if (achievement.type === 'progressive' && achievement.tieredLevels && achievement.trackedValue) {
        const currentValue = progressData[achievement.trackedValue] || 0;
        const nextTierIndex = 0; // Assuming we start at the first tier
        if (nextTierIndex < achievement.tieredLevels.length) {
          const nextThreshold = achievement.tieredLevels[nextTierIndex];
          progress = (currentValue / nextThreshold) * 100;
        }
      }
      
      // Save achievement with highest progress
      if (progress > highestProgress) {
        highestProgress = progress;
        nextAchievement = achievement;
      }
    });
    
    return nextAchievement;
  },
  
  /**
   * Add event listener for achievement events
   */
  addEventListener: (
    eventType: AchievementEventType,
    callback: (event: AchievementEvent) => void
  ) => {
    if (!eventListeners[eventType]) {
      eventListeners[eventType] = [];
    }
    eventListeners[eventType].push(callback);
  },
  
  /**
   * Remove event listener
   */
  removeEventListener: (
    eventType: AchievementEventType,
    callback: (event: AchievementEvent) => void
  ) => {
    if (!eventListeners[eventType]) return;
    eventListeners[eventType] = eventListeners[eventType].filter(cb => cb !== callback);
  },
  
  /**
   * Dispatch achievement event
   */
  dispatchEvent: (event: AchievementEvent) => {
    if (!eventListeners[event.type]) return;
    eventListeners[event.type].forEach(callback => callback(event));
  }
};

// Export event types
export { AchievementEventType };
