
import { AchievementData } from '@/components/onboarding/data/types';

export interface AchievementMetrics {
  totalAchievements: number;
  completedAchievements: number;
  totalPoints: number;
  achievementsByType: Record<string, number>;
  completionRate: number;
  // Additional metrics that might be useful
  streakAchievements: number;
  progressiveAchievements: number;
  upcomingAchievements: AchievementData[];
}

export const achievementAnalytics = {
  /**
   * Generate complete achievement metrics for a user
   */
  generateMetrics(
    allAchievements: AchievementData[],
    completedAchievementIds: string[],
    progressTrackingData: Record<string, number>
  ): AchievementMetrics {
    const completedAchievements = completedAchievementIds.length;
    const totalAchievements = allAchievements.length;
    
    // Count achievements by type
    const achievementsByType: Record<string, number> = {};
    allAchievements.forEach(achievement => {
      const type = achievement.type;
      achievementsByType[type] = (achievementsByType[type] || 0) + 1;
    });
    
    // Calculate total points
    const totalPoints = allAchievements
      .filter(a => completedAchievementIds.includes(a.id))
      .reduce((total, a) => total + a.points, 0);
    
    // Count specific achievement types
    const streakAchievements = allAchievements
      .filter(a => a.type === 'streak' && completedAchievementIds.includes(a.id))
      .length;
      
    const progressiveAchievements = allAchievements
      .filter(a => a.type === 'progressive' && completedAchievementIds.includes(a.id))
      .length;
    
    // Find upcoming achievements (closest to completion)
    const upcomingAchievements = this.findUpcomingAchievements(
      allAchievements, 
      completedAchievementIds, 
      progressTrackingData
    );
    
    return {
      totalAchievements,
      completedAchievements,
      totalPoints,
      achievementsByType,
      completionRate: totalAchievements > 0 ? (completedAchievements / totalAchievements) * 100 : 0,
      streakAchievements,
      progressiveAchievements,
      upcomingAchievements
    };
  },
  
  /**
   * Find achievements that are closest to completion
   */
  findUpcomingAchievements(
    allAchievements: AchievementData[],
    completedAchievementIds: string[],
    progressTrackingData: Record<string, number>
  ): AchievementData[] {
    // Filter out completed achievements
    const incompleteAchievements = allAchievements.filter(
      a => !completedAchievementIds.includes(a.id)
    );
    
    // Score each achievement based on how close it is to completion
    const scoredAchievements = incompleteAchievements.map(achievement => {
      let completionScore = 0;
      
      switch (achievement.type) {
        case 'streak':
          if (achievement.streakDays) {
            const currentStreak = progressTrackingData.streakDays || 0;
            completionScore = currentStreak / achievement.streakDays;
          }
          break;
          
        case 'progressive':
        case 'milestone':
          if (achievement.progressThreshold && achievement.trackedValue) {
            const currentValue = progressTrackingData[achievement.trackedValue] || 0;
            completionScore = currentValue / achievement.progressThreshold;
          }
          break;
          
        default:
          // For discovery/completion types, we can't really calculate a score
          completionScore = 0.1; // Small default value
      }
      
      return {
        achievement,
        completionScore: Math.min(0.99, completionScore) // Cap at 0.99 to prioritize almost complete
      };
    });
    
    // Sort by completion score (highest first) and return top achievements
    return scoredAchievements
      .sort((a, b) => b.completionScore - a.completionScore)
      .slice(0, 3)
      .map(item => item.achievement);
  },
  
  /**
   * Calculate achievement growth rate over time
   */
  calculateGrowthRate(
    achievementHistory: Record<string, {awarded: boolean, timestamp: string}>,
    timeframe: number = 30 // days
  ): number {
    const now = new Date();
    const timeframeStart = new Date(now.setDate(now.getDate() - timeframe));
    
    // Count achievements in the timeframe
    const achievementsInTimeframe = Object.values(achievementHistory).filter(item => {
      if (!item.awarded) return false;
      const awardDate = new Date(item.timestamp);
      return awardDate >= timeframeStart;
    }).length;
    
    // Calculate daily rate
    return achievementsInTimeframe / timeframe;
  }
};
