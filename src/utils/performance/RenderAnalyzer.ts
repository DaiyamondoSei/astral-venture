import { performanceMonitor } from './performanceMonitor';

export interface RenderAnalysis {
  component: string;
  renderCount: number;
  averageRenderTime: number;
  maxRenderTime: number;
  renderFrequency: 'low' | 'medium' | 'high' | 'excessive';
  possibleOptimizations: string[];
  suggestions: Array<{
    type: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

/**
 * Utility for analyzing component render behavior and suggesting optimizations
 */
class RenderAnalyzer {
  private renderStats: Map<string, {
    count: number;
    totalTime: number;
    maxTime: number;
    lastRenderTimestamp: number;
    renderTimes: number[];
    renderIntervals: number[];
  }> = new Map();

  /**
   * Record a component render
   */
  public recordRender(component: string, duration: number): void {
    const now = Date.now();
    const stats = this.renderStats.get(component) || {
      count: 0,
      totalTime: 0,
      maxTime: 0,
      lastRenderTimestamp: 0,
      renderTimes: [],
      renderIntervals: []
    };

    // Calculate interval if not the first render
    if (stats.lastRenderTimestamp > 0) {
      const interval = now - stats.lastRenderTimestamp;
      stats.renderIntervals.push(interval);
      
      // Keep only last 100 intervals
      if (stats.renderIntervals.length > 100) {
        stats.renderIntervals.shift();
      }
    }

    // Update stats
    stats.count++;
    stats.totalTime += duration;
    stats.maxTime = Math.max(stats.maxTime, duration);
    stats.lastRenderTimestamp = now;
    stats.renderTimes.push(duration);

    // Keep only last 100 render times
    if (stats.renderTimes.length > 100) {
      stats.renderTimes.shift();
    }

    this.renderStats.set(component, stats);
  }

  /**
   * Get frequency category based on render intervals
   */
  private getRenderFrequency(intervals: number[]): 'low' | 'medium' | 'high' | 'excessive' {
    if (intervals.length === 0) return 'low';

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    if (avgInterval < 100) return 'excessive';
    if (avgInterval < 500) return 'high';
    if (avgInterval < 2000) return 'medium';
    return 'low';
  }

  /**
   * Generate optimization suggestions based on render stats
   */
  private generateSuggestions(component: string, stats: any): Array<{
    type: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const suggestions: Array<{
      type: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
    }> = [];

    // Check for high render count
    if (stats.count > 50) {
      suggestions.push({
        type: 'memo',
        description: `${component} has rendered ${stats.count} times. Consider using React.memo or useMemo.`,
        priority: stats.count > 100 ? 'critical' : 'high'
      });
    }

    // Check for slow renders
    const avgRenderTime = stats.totalTime / stats.count;
    if (avgRenderTime > 16) {
      suggestions.push({
        type: 'complexity',
        description: `${component} takes an average of ${avgRenderTime.toFixed(2)}ms to render. Consider simplifying or code-splitting.`,
        priority: avgRenderTime > 50 ? 'critical' : 'high'
      });
    }

    // Check for rapid re-renders
    if (stats.renderIntervals.length > 0) {
      const rapidRenders = stats.renderIntervals.filter(interval => interval < 100).length;
      const rapidRenderPercentage = (rapidRenders / stats.renderIntervals.length) * 100;
      
      if (rapidRenderPercentage > 20) {
        suggestions.push({
          type: 'state',
          description: `${component} re-renders frequently (${rapidRenderPercentage.toFixed(1)}% of renders occur within 100ms). Check for unnecessary state updates.`,
          priority: rapidRenderPercentage > 50 ? 'critical' : 'high'
        });
      }
    }

    // Add other suggestions based on component metrics
    const componentMetrics = performanceMonitor.getComponentMetrics(component);
    if (componentMetrics && componentMetrics.insights && componentMetrics.insights.length > 0) {
      for (const insight of componentMetrics.insights) {
        suggestions.push({
          type: 'insight',
          description: insight,
          priority: 'medium'
        });
      }
    }

    return suggestions;
  }

  /**
   * Find components with performance issues
   */
  public findComponentsWithPerformanceIssues(): RenderAnalysis[] {
    const result: RenderAnalysis[] = [];

    for (const [component, stats] of this.renderStats.entries()) {
      // Skip components with very few renders
      if (stats.count < 3) continue;

      const suggestions = this.generateSuggestions(component, stats);
      
      // Only include components with suggestions
      if (suggestions.length > 0) {
        result.push({
          component,
          renderCount: stats.count,
          averageRenderTime: stats.totalTime / stats.count,
          maxRenderTime: stats.maxTime,
          renderFrequency: this.getRenderFrequency(stats.renderIntervals),
          possibleOptimizations: suggestions.map(s => s.description),
          suggestions
        });
      }
    }

    // Sort by highest priority
    return result.sort((a, b) => {
      const priorityOrder = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3
      };
      
      const aPriority = Math.min(...a.suggestions.map(s => priorityOrder[s.priority]));
      const bPriority = Math.min(...b.suggestions.map(s => priorityOrder[s.priority]));
      
      return aPriority - bPriority;
    });
  }

  /**
   * Get analysis for a specific component
   */
  public getComponentAnalysis(component: string): RenderAnalysis | null {
    const stats = this.renderStats.get(component);
    if (!stats || stats.count < 2) return null;

    const suggestions = this.generateSuggestions(component, stats);
    
    return {
      component,
      renderCount: stats.count,
      averageRenderTime: stats.totalTime / stats.count,
      maxRenderTime: stats.maxTime,
      renderFrequency: this.getRenderFrequency(stats.renderIntervals),
      possibleOptimizations: suggestions.map(s => s.description),
      suggestions
    };
  }

  /**
   * Get components with slow renders
   */
  public getComponentsWithSlowRenders(): RenderAnalysis[] {
    return this.findComponentsWithPerformanceIssues().filter(
      analysis => analysis.averageRenderTime > 16
    );
  }

  /**
   * Get components with high impact on performance
   */
  public getHighImpactComponents(): RenderAnalysis[] {
    return this.findComponentsWithPerformanceIssues().filter(
      analysis => analysis.suggestions.some(s => 
        s.priority === 'critical' || s.priority === 'high'
      )
    );
  }

  /**
   * Reset all tracked stats
   */
  public reset(): void {
    this.renderStats.clear();
  }
}

// Export a singleton instance
export const renderAnalyzer = new RenderAnalyzer();
