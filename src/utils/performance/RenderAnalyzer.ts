
/**
 * Render Analyzer Utility
 * 
 * Tracks and analyzes component rendering patterns
 */

import { performanceMonitor } from './performanceMonitor';

// Analysis result interface
export interface RenderAnalysis {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  maxRenderTime: number;
  recentRenderTimes: number[];
  renderFrequency: 'low' | 'medium' | 'high' | 'excessive';
  possibleOptimizations: string[];
  suggestions?: string[]; // Add missing suggestions property
  lastUpdated: number;
}

class RenderAnalyzer {
  private renderHistory: Record<string, {
    timestamps: number[],
    durations: number[]
  }> = {};
  
  /**
   * Initialize the analyzer
   */
  constructor() {
    // Subscribe to performance monitor updates
    performanceMonitor.subscribe(this.handleMetricsUpdate);
  }
  
  /**
   * Handle metrics updates from performance monitor
   */
  private handleMetricsUpdate = (metrics: Record<string, any>): void => {
    // Process each component's metrics
    Object.keys(metrics).forEach(componentName => {
      const componentMetrics = metrics[componentName];
      
      if (!componentMetrics.renderTimes || !componentMetrics.renderTimes.length) {
        return;
      }
      
      // Update render history
      if (!this.renderHistory[componentName]) {
        this.renderHistory[componentName] = {
          timestamps: [],
          durations: []
        };
      }
      
      const history = this.renderHistory[componentName];
      
      // Add timestamp of latest render
      history.timestamps.push(Date.now());
      
      // Add latest render duration
      history.durations.push(componentMetrics.lastRenderTime);
      
      // Limit history size
      if (history.timestamps.length > 100) {
        history.timestamps.shift();
        history.durations.shift();
      }
      
      // Analyze the component's render patterns
      this.analyzeComponent(componentName);
    });
  };
  
  /**
   * Analyze component render patterns
   */
  private analyzeComponent(componentName: string): void {
    const history = this.renderHistory[componentName];
    if (!history || history.timestamps.length < 2) return;
    
    // Calculate render frequency
    const renderFrequency = this.calculateRenderFrequency(history.timestamps);
    
    // Calculate average and max render times
    const averageRenderTime = 
      history.durations.reduce((sum, time) => sum + time, 0) / history.durations.length;
    
    const maxRenderTime = Math.max(...history.durations);
    
    // Determine possible optimizations
    const optimizations = this.determinePossibleOptimizations(
      componentName,
      renderFrequency,
      averageRenderTime,
      maxRenderTime
    );
    
    // Add insights to performance monitor if needed
    if (optimizations.length > 0 && renderFrequency !== 'low') {
      performanceMonitor.addInsight(
        componentName,
        `Possible optimizations: ${optimizations.join(', ')}`
      );
    }
  }
  
  /**
   * Calculate render frequency category
   */
  private calculateRenderFrequency(timestamps: number[]): 'low' | 'medium' | 'high' | 'excessive' {
    if (timestamps.length < 2) return 'low';
    
    // Get time differences between renders
    const timeDiffs: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      timeDiffs.push(timestamps[i] - timestamps[i - 1]);
    }
    
    // Calculate average time between renders (in ms)
    const avgTimeBetweenRenders = 
      timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
    
    // Categorize frequency
    if (avgTimeBetweenRenders > 5000) return 'low';
    if (avgTimeBetweenRenders > 1000) return 'medium';
    if (avgTimeBetweenRenders > 100) return 'high';
    return 'excessive';
  }
  
  /**
   * Determine possible optimizations based on render patterns
   */
  private determinePossibleOptimizations(
    componentName: string,
    frequency: 'low' | 'medium' | 'high' | 'excessive',
    avgTime: number,
    maxTime: number
  ): string[] {
    const optimizations: string[] = [];
    
    // Add optimization suggestions based on render frequency and times
    if (frequency === 'excessive') {
      optimizations.push('Use React.memo to prevent unnecessary re-renders');
      optimizations.push('Check for missing dependency arrays in useEffect hooks');
    }
    
    if (frequency === 'high' || frequency === 'excessive') {
      optimizations.push('Consider extracting frequently changing parts to separate components');
    }
    
    if (avgTime > 16) { // 60fps threshold
      optimizations.push('Component render time exceeds 16ms (60fps), optimize rendering logic');
    }
    
    if (maxTime > 100) {
      optimizations.push('Some renders are taking >100ms, check for expensive operations');
    }
    
    return optimizations;
  }
  
  /**
   * Get analysis for a specific component
   */
  public getComponentAnalysis(componentName: string): RenderAnalysis | null {
    const history = this.renderHistory[componentName];
    if (!history || history.timestamps.length === 0) return null;
    
    const renderCount = history.timestamps.length;
    const averageRenderTime = 
      history.durations.reduce((sum, time) => sum + time, 0) / history.durations.length;
    const maxRenderTime = Math.max(...history.durations);
    const recentRenderTimes = history.durations.slice(-5);
    const renderFrequency = this.calculateRenderFrequency(history.timestamps);
    const possibleOptimizations = this.determinePossibleOptimizations(
      componentName,
      renderFrequency,
      averageRenderTime,
      maxRenderTime
    );
    
    return {
      componentName,
      renderCount,
      averageRenderTime,
      maxRenderTime,
      recentRenderTimes,
      renderFrequency,
      possibleOptimizations,
      suggestions: possibleOptimizations, // Add suggestions property with the same value as possibleOptimizations
      lastUpdated: history.timestamps[history.timestamps.length - 1]
    };
  }
  
  /**
   * Get all components analysis
   */
  public getAllComponentsAnalysis(): Record<string, RenderAnalysis> {
    const result: Record<string, RenderAnalysis> = {};
    
    Object.keys(this.renderHistory).forEach(componentName => {
      const analysis = this.getComponentAnalysis(componentName);
      if (analysis) {
        result[componentName] = analysis;
      }
    });
    
    return result;
  }
  
  /**
   * Find components with performance issues
   */
  public findComponentsWithPerformanceIssues(): RenderAnalysis[] {
    const issues: RenderAnalysis[] = [];
    
    Object.keys(this.renderHistory).forEach(componentName => {
      const analysis = this.getComponentAnalysis(componentName);
      if (analysis && (
        analysis.renderFrequency === 'high' || 
        analysis.renderFrequency === 'excessive' ||
        analysis.averageRenderTime > 16 ||
        analysis.maxRenderTime > 100
      )) {
        issues.push(analysis);
      }
    });
    
    return issues;
  }
  
  /**
   * Clear render history for all components
   */
  public clearHistory(): void {
    this.renderHistory = {};
  }
}

// Export singleton instance
export const renderAnalyzer = new RenderAnalyzer();
