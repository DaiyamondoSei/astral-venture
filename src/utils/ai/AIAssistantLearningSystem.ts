
/**
 * AI Assistant Learning System
 * 
 * Tracks user interactions with suggestions and recommendations
 * to improve future suggestions based on what was helpful
 */

export interface LearningEvent {
  id: string;
  type: 'suggestion_accepted' | 'suggestion_rejected' | 'recommendation_applied' | 'pattern_detected';
  data: any;
  timestamp: Date;
}

interface PatternFrequency {
  patternId: string;
  occurrences: number;
  acceptanceRate: number;
}

interface UserBehaviorPattern {
  name: string;
  frequency: number;
  lastObserved: Date;
}

class AIAssistantLearningSystem {
  private static instance: AIAssistantLearningSystem;
  private events: LearningEvent[] = [];
  private patternStats: Map<string, PatternFrequency> = new Map();
  private userBehaviorPatterns: UserBehaviorPattern[] = [];
  private sessionEvents: LearningEvent[] = [];
  
  // Only allow singleton instance
  private constructor() {
    // Initialize learning system
    this.loadStoredLearning();
  }
  
  public static getInstance(): AIAssistantLearningSystem {
    if (!AIAssistantLearningSystem.instance) {
      AIAssistantLearningSystem.instance = new AIAssistantLearningSystem();
    }
    return AIAssistantLearningSystem.instance;
  }
  
  /**
   * Load previously stored learning data
   */
  private loadStoredLearning(): void {
    try {
      const storedData = localStorage.getItem('ai_learning_system');
      if (storedData) {
        const data = JSON.parse(storedData);
        this.events = data.events || [];
        
        // Convert stored pattern stats back to Map
        if (data.patternStats) {
          this.patternStats = new Map(Object.entries(data.patternStats));
        }
        
        this.userBehaviorPatterns = data.userBehaviorPatterns || [];
      }
    } catch (error) {
      console.error("Error loading AI learning data:", error);
    }
  }
  
  /**
   * Save current learning data to persistent storage
   */
  private saveCurrentLearning(): void {
    try {
      // Convert Map to object for storage
      const patternStatsObj = Object.fromEntries(this.patternStats.entries());
      
      localStorage.setItem('ai_learning_system', JSON.stringify({
        events: this.events.slice(-100), // Only store the most recent 100 events
        patternStats: patternStatsObj,
        userBehaviorPatterns: this.userBehaviorPatterns
      }));
    } catch (error) {
      console.error("Error saving AI learning data:", error);
    }
  }
  
  /**
   * Record a learning event from user interaction
   */
  public recordEvent(type: LearningEvent['type'], data: any): string {
    const id = `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const event: LearningEvent = {
      id,
      type,
      data,
      timestamp: new Date()
    };
    
    this.events.push(event);
    this.sessionEvents.push(event);
    
    // Update pattern statistics if applicable
    if (data.patternId) {
      this.updatePatternStats(data.patternId, type);
    }
    
    // Analyze session behavior patterns
    if (this.sessionEvents.length >= 5) {
      this.analyzeSessionBehavior();
    }
    
    // Persist learning data
    this.saveCurrentLearning();
    
    console.log(`AI Assistant Learning: Recorded ${type} event`);
    return id;
  }
  
  /**
   * Update the statistics for a pattern
   */
  private updatePatternStats(patternId: string, eventType: LearningEvent['type']): void {
    const stats = this.patternStats.get(patternId) || {
      patternId,
      occurrences: 0,
      acceptanceRate: 0
    };
    
    stats.occurrences++;
    
    // Calculate acceptance rate
    const acceptedEvents = this.events.filter(e => 
      e.data.patternId === patternId && 
      (e.type === 'suggestion_accepted' || e.type === 'recommendation_applied')
    ).length;
    
    const totalEvents = this.events.filter(e => 
      e.data.patternId === patternId
    ).length;
    
    stats.acceptanceRate = totalEvents > 0 ? acceptedEvents / totalEvents : 0;
    
    this.patternStats.set(patternId, stats);
  }
  
  /**
   * Analyze current session behavior to detect patterns
   */
  private analyzeSessionBehavior(): void {
    // Reset session events
    this.sessionEvents = [];
    
    // In a real implementation, this would use more sophisticated analysis
    // to detect patterns in user behavior
  }
  
  /**
   * Get patterns sorted by effectiveness
   */
  public getEffectivePatterns(): PatternFrequency[] {
    return Array.from(this.patternStats.values())
      .sort((a, b) => b.acceptanceRate - a.acceptanceRate);
  }
  
  /**
   * Get recent learning events
   */
  public getRecentEvents(limit: number = 10): LearningEvent[] {
    return [...this.events]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  /**
   * Get stats for a specific pattern
   */
  public getPatternStats(patternId: string): PatternFrequency | undefined {
    return this.patternStats.get(patternId);
  }
  
  /**
   * Check if a pattern has been effective
   */
  public isPatternEffective(patternId: string): boolean {
    const stats = this.patternStats.get(patternId);
    if (!stats || stats.occurrences < 3) return true; // Default to true if not enough data
    
    return stats.acceptanceRate > 0.5; // Consider effective if >50% acceptance
  }
  
  /**
   * Reset learning data (for testing)
   */
  public reset(): void {
    this.events = [];
    this.patternStats.clear();
    this.userBehaviorPatterns = [];
    this.sessionEvents = [];
    localStorage.removeItem('ai_learning_system');
  }
  
  /**
   * Get summary statistics
   */
  public getSummaryStats(): {
    totalEvents: number;
    acceptanceRate: number;
    mostEffectivePatterns: PatternFrequency[];
    userBehaviorInsights: string[];
  } {
    const totalEvents = this.events.length;
    
    const acceptedEvents = this.events.filter(e => 
      e.type === 'suggestion_accepted' || e.type === 'recommendation_applied'
    ).length;
    
    const acceptanceRate = totalEvents > 0 ? acceptedEvents / totalEvents : 0;
    
    const mostEffectivePatterns = this.getEffectivePatterns()
      .filter(p => p.occurrences >= 3 && p.acceptanceRate > 0.7)
      .slice(0, 5);
    
    // Generate insights about user behavior
    const userBehaviorInsights = this.generateUserBehaviorInsights();
    
    return {
      totalEvents,
      acceptanceRate,
      mostEffectivePatterns,
      userBehaviorInsights
    };
  }
  
  /**
   * Generate insights about user behavior
   */
  private generateUserBehaviorInsights(): string[] {
    const insights: string[] = [];
    
    // Simple example of generating insights
    if (this.events.length > 10) {
      const recentEvents = this.getRecentEvents(10);
      
      // Check if user frequently rejects performance suggestions
      const performanceRejections = recentEvents.filter(e => 
        e.type === 'suggestion_rejected' && 
        e.data.category === 'performance'
      ).length;
      
      if (performanceRejections >= 3) {
        insights.push("User tends to reject performance-related suggestions");
      }
      
      // Check if user accepts architectural suggestions
      const architectureAcceptances = recentEvents.filter(e => 
        e.type === 'suggestion_accepted' && 
        e.data.category === 'architecture'
      ).length;
      
      if (architectureAcceptances >= 3) {
        insights.push("User frequently implements architectural improvements");
      }
    }
    
    return insights;
  }
}

// Export singleton instance
export const aiLearningSystem = AIAssistantLearningSystem.getInstance();
