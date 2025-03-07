
/**
 * Analytics service for achievement tracking
 */
export class AchievementAnalytics {
  /**
   * Track achievement progress
   * @param userId User ID
   * @param achievementId Achievement ID
   * @param progress Progress value (0-100)
   */
  trackProgress(userId: string, achievementId: string, progress: number): void {
    if (!userId || !achievementId) {
      console.warn('Missing required parameters for achievement tracking');
      return;
    }
    
    // Log tracking event
    console.log(`Achievement progress tracked: ${achievementId} - ${progress}%`, {
      userId,
      achievementId,
      progress,
      timestamp: new Date().toISOString()
    });
    
    // Store analytics data in local storage
    this.storeAnalyticsEvent(userId, {
      type: 'progress',
      achievementId,
      progress,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Track achievement earned
   * @param userId User ID
   * @param achievementId Achievement ID
   * @param achievementData Additional achievement data
   */
  trackAchievementEarned(userId: string, achievementId: string, achievementData?: Record<string, any>): void {
    if (!userId || !achievementId) {
      console.warn('Missing required parameters for achievement earned event');
      return;
    }
    
    // Log earned event
    console.log(`Achievement earned: ${achievementId}`, {
      userId,
      achievementId,
      ...achievementData,
      timestamp: new Date().toISOString()
    });
    
    // Store analytics data in local storage
    this.storeAnalyticsEvent(userId, {
      type: 'earned',
      achievementId,
      data: achievementData,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Track streak milestone
   * @param userId User ID
   * @param streakDays Number of streak days
   */
  trackStreakMilestone(userId: string, streakDays: number): void {
    if (!userId) return;
    
    // Log streak milestone
    console.log(`Streak milestone reached: ${streakDays} days`, {
      userId,
      streakDays,
      timestamp: new Date().toISOString()
    });
    
    // Store analytics data in local storage
    this.storeAnalyticsEvent(userId, {
      type: 'streak_milestone',
      streakDays,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Get achievement analytics data for a user
   * @param userId User ID
   * @returns Array of analytics events
   */
  getUserAnalytics(userId: string): any[] {
    if (!userId) return [];
    
    try {
      const key = `achievement-analytics-${userId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving achievement analytics:', error);
      return [];
    }
  }
  
  /**
   * Get achievement completion rate
   * @param userId User ID
   * @returns Completion rate object
   */
  getCompletionRate(userId: string): { total: number; completed: number; rate: number } {
    const analytics = this.getUserAnalytics(userId);
    
    // Count earned achievements
    const earnedEvents = analytics.filter(event => event.type === 'earned');
    const earnedIds = new Set(earnedEvents.map(event => event.achievementId));
    
    const total = 20; // Placeholder: would ideally come from a total count of available achievements
    const completed = earnedIds.size;
    const rate = total > 0 ? (completed / total) * 100 : 0;
    
    return { total, completed, rate };
  }
  
  /**
   * Store analytics event in local storage
   * @private
   */
  private storeAnalyticsEvent(userId: string, event: Record<string, any>): void {
    if (!userId) return;
    
    try {
      const key = `achievement-analytics-${userId}`;
      const existingData = localStorage.getItem(key);
      const events = existingData ? JSON.parse(existingData) : [];
      
      // Add new event and limit stored events to prevent excessive storage use
      events.push(event);
      const limitedEvents = events.slice(-500); // Keep only the most recent 500 events
      
      localStorage.setItem(key, JSON.stringify(limitedEvents));
    } catch (error) {
      console.error('Error storing achievement analytics event:', error);
    }
  }
}

// Create a singleton instance for global use
export const achievementAnalytics = new AchievementAnalytics();

export default achievementAnalytics;
