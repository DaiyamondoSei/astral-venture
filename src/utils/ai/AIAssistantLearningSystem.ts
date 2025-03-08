
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

class AIAssistantLearningSystem {
  private static instance: AIAssistantLearningSystem;
  private events: LearningEvent[] = [];
  private patternStats: Map<string, PatternFrequency> = new Map();
  
  // Only allow singleton instance
  private constructor() {}
  
  public static getInstance(): AIAssistantLearningSystem {
    if (!AIAssistantLearningSystem.instance) {
      AIAssistantLearningSystem.instance = new AIAssistantLearningSystem();
    }
    return AIAssistantLearningSystem.instance;
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
    
    // Update pattern statistics if applicable
    if (data.patternId) {
      this.updatePatternStats(data.patternId, type);
    }
    
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
  }
  
  /**
   * Get summary statistics
   */
  public getSummaryStats(): {
    totalEvents: number;
    acceptanceRate: number;
    mostEffectivePatterns: PatternFrequency[];
  } {
    const totalEvents = this.events.length;
    
    const acceptedEvents = this.events.filter(e => 
      e.type === 'suggestion_accepted' || e.type === 'recommendation_applied'
    ).length;
    
    const acceptanceRate = totalEvents > 0 ? acceptedEvents / totalEvents : 0;
    
    const mostEffectivePatterns = this.getEffectivePatterns()
      .filter(p => p.occurrences >= 3 && p.acceptanceRate > 0.7)
      .slice(0, 5);
    
    return {
      totalEvents,
      acceptanceRate,
      mostEffectivePatterns
    };
  }
}

// Export singleton instance
export const aiLearningSystem = AIAssistantLearningSystem.getInstance();
