
import { AchievementEventType } from '@/components/onboarding/hooks/achievement/types';

/**
 * Service for analyzing achievement data and generating insights
 */
export class AchievementAnalytics {
  /**
   * Analyze user's achievement progress and generate insights
   * @param userId The user ID to analyze
   * @param achievementHistory The user's achievement history
   * @param progressTracking The user's progress tracking data
   * @returns Analytics insights object
   */
  analyzeProgress(
    userId: string,
    achievementHistory: Record<string, any>,
    progressTracking: Record<string, number>
  ): Record<string, any> {
    // Skip if no data
    if (!userId || !achievementHistory || !progressTracking) {
      return { hasData: false };
    }
    
    // Get achievement events from local storage
    const events = this.getAchievementEvents(userId);
    
    // Calculate basic metrics
    const totalAchievements = Object.keys(achievementHistory).filter(
      id => achievementHistory[id].awarded
    ).length;
    
    const recentEvents = events.filter(
      event => new Date(event.timestamp) > this.getPastDate(30)
    );
    
    const activityByDay = this.groupEventsByDay(events);
    const activityByType = this.groupEventsByType(events);
    
    // Calculate streaks and patterns
    const { currentStreak, longestStreak } = this.calculateStreaks(activityByDay);
    
    // Identify strongest and weakest areas
    const strengths = this.identifyStrengths(progressTracking);
    const growthAreas = this.identifyGrowthAreas(progressTracking);
    
    // Calculate progress velocity and trend
    const velocityByWeek = this.calculateVelocity(events);
    const projections = this.calculateProjections(progressTracking, events);
    
    return {
      hasData: true,
      overview: {
        totalAchievements,
        recentEventCount: recentEvents.length,
        currentStreak,
        longestStreak,
      },
      strengths,
      growthAreas,
      activityByDay,
      activityByType,
      velocityByWeek,
      projections,
      lastUpdated: new Date().toISOString()
    };
  }
  
  /**
   * Get achievement events from local storage
   */
  private getAchievementEvents(userId: string): any[] {
    try {
      const eventsKey = `achievement-events-${userId}`;
      return JSON.parse(localStorage.getItem(eventsKey) || '[]');
    } catch (error) {
      console.error('Error retrieving achievement events:', error);
      return [];
    }
  }
  
  /**
   * Group events by day for streak calculation
   */
  private groupEventsByDay(events: any[]): Record<string, any[]> {
    const groupedByDay: Record<string, any[]> = {};
    
    events.forEach(event => {
      const date = event.timestamp.split('T')[0];
      if (!groupedByDay[date]) {
        groupedByDay[date] = [];
      }
      groupedByDay[date].push(event);
    });
    
    return groupedByDay;
  }
  
  /**
   * Group events by type for activity analysis
   */
  private groupEventsByType(events: any[]): Record<string, any[]> {
    const groupedByType: Record<string, any[]> = {};
    
    events.forEach(event => {
      const type = event.eventType;
      if (!groupedByType[type]) {
        groupedByType[type] = [];
      }
      groupedByType[type].push(event);
    });
    
    return groupedByType;
  }
  
  /**
   * Calculate user streaks from daily activity
   */
  private calculateStreaks(activityByDay: Record<string, any[]>): { currentStreak: number, longestStreak: number } {
    const dates = Object.keys(activityByDay).sort();
    if (dates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;
    
    // Calculate current streak (from most recent day backward)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = this.getPastDate(1).toISOString().split('T')[0];
    
    if (activityByDay[today] || activityByDay[yesterday]) {
      let checkDate = today;
      if (!activityByDay[today] && activityByDay[yesterday]) {
        checkDate = yesterday;
      }
      
      while (true) {
        if (activityByDay[checkDate]) {
          currentStreak++;
          checkDate = this.getPreviousDay(checkDate);
        } else {
          break;
        }
      }
    }
    
    // Calculate longest streak
    for (let i = 0; i < dates.length; i++) {
      const currentDate = dates[i];
      const previousDate = i > 0 ? dates[i - 1] : null;
      
      if (previousDate) {
        const dayDiff = this.getDayDifference(previousDate, currentDate);
        if (dayDiff === 1) {
          streak++;
        } else {
          streak = 1;
        }
      } else {
        streak = 1;
      }
      
      longestStreak = Math.max(longestStreak, streak);
    }
    
    return { currentStreak, longestStreak };
  }
  
  /**
   * Identify user's strengths based on progress data
   */
  private identifyStrengths(progressTracking: Record<string, number>): string[] {
    const strengths: string[] = [];
    
    // Look for high values in progress tracking
    if (progressTracking.reflections > 10) {
      strengths.push('reflection');
    }
    
    if (progressTracking.meditation_minutes > 120) {
      strengths.push('meditation');
    }
    
    if (progressTracking.streakDays > 7) {
      strengths.push('consistency');
    }
    
    if (progressTracking.unique_chakras_activated >= 4) {
      strengths.push('chakra-activation');
    }
    
    return strengths;
  }
  
  /**
   * Identify areas for growth based on progress data
   */
  private identifyGrowthAreas(progressTracking: Record<string, number>): string[] {
    const growthAreas: string[] = [];
    
    // Look for low values or missing values in progress tracking
    if (!progressTracking.reflections || progressTracking.reflections < 3) {
      growthAreas.push('reflection');
    }
    
    if (!progressTracking.meditation_minutes || progressTracking.meditation_minutes < 30) {
      growthAreas.push('meditation');
    }
    
    if (!progressTracking.streakDays || progressTracking.streakDays < 3) {
      growthAreas.push('consistency');
    }
    
    if (!progressTracking.unique_chakras_activated || progressTracking.unique_chakras_activated < 3) {
      growthAreas.push('chakra-exploration');
    }
    
    return growthAreas;
  }
  
  /**
   * Calculate velocity of progress over time
   */
  private calculateVelocity(events: any[]): Record<string, number> {
    const weeklyProgress: Record<string, number> = {};
    const now = new Date();
    
    // Group events by week
    events.forEach(event => {
      const eventDate = new Date(event.timestamp);
      const weekDiff = this.getWeekDifference(eventDate, now);
      const weekKey = `week_${weekDiff}`;
      
      if (!weeklyProgress[weekKey]) {
        weeklyProgress[weekKey] = 0;
      }
      
      weeklyProgress[weekKey]++;
    });
    
    return weeklyProgress;
  }
  
  /**
   * Calculate projections for future achievements
   */
  private calculateProjections(
    progressTracking: Record<string, number>,
    events: any[]
  ): Record<string, any> {
    // Skip if not enough data
    if (events.length < 5) {
      return { hasProjections: false };
    }
    
    // Calculate daily rate for key metrics
    const recentEvents = events.filter(
      event => new Date(event.timestamp) > this.getPastDate(30)
    );
    
    const dailyRate: Record<string, number> = {};
    
    // Calculate rate for reflections
    const reflectionEvents = recentEvents.filter(
      event => event.eventType === AchievementEventType.REFLECTION_COMPLETED
    );
    dailyRate.reflections = reflectionEvents.length / 30;
    
    // Calculate rate for meditation
    const meditationEvents = recentEvents.filter(
      event => event.eventType === AchievementEventType.MEDITATION_COMPLETED
    );
    const totalMeditationMinutes = meditationEvents.reduce(
      (total, event) => total + (event.duration || 0),
      0
    );
    dailyRate.meditation_minutes = totalMeditationMinutes / 30;
    
    // Project future achievements
    const daysToNextStreak = progressTracking.streakDays >= 3 && progressTracking.streakDays < 7
      ? 7 - progressTracking.streakDays
      : progressTracking.streakDays >= 7 && progressTracking.streakDays < 14
        ? 14 - progressTracking.streakDays
        : progressTracking.streakDays >= 14 && progressTracking.streakDays < 30
          ? 30 - progressTracking.streakDays
          : null;
    
    return {
      hasProjections: true,
      dailyRate,
      daysToNextStreak,
      daysToReflectionMilestone: dailyRate.reflections > 0
        ? Math.ceil((5 - (progressTracking.reflections % 5)) / dailyRate.reflections)
        : null,
      daysToMeditationMilestone: dailyRate.meditation_minutes > 0
        ? Math.ceil((60 - (progressTracking.meditation_minutes % 60)) / dailyRate.meditation_minutes)
        : null
    };
  }
  
  /**
   * Helper to get date N days in the past
   */
  private getPastDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }
  
  /**
   * Helper to get previous day in ISO format
   */
  private getPreviousDay(dateString: string): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Helper to calculate difference in days between two dates
   */
  private getDayDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Helper to calculate difference in weeks between two dates
   */
  private getWeekDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  }
}

// Create a singleton instance for global use
export const achievementAnalytics = new AchievementAnalytics();

export default achievementAnalytics;
