
/**
 * RenderAnalyzer
 * Analyzes component render performance and suggests optimizations
 */

import { performanceMonitor } from './performanceMonitor';

// Render frequency categories
export type RenderFrequency = 'low' | 'medium' | 'high' | 'extreme';

// Analysis result from render patterns
export interface RenderAnalysis {
  componentName: string;
  renderCount: number;
  renderFrequency: RenderFrequency;
  averageRenderTime: number;
  maxRenderTime: number;
  possibleOptimizations: string[];
  isProblematic: boolean;
}

/**
 * Class that provides render analysis functionality
 */
class RenderAnalyzer {
  // Threshold for render counts that indicate potential problems
  private static HIGH_RENDER_COUNT_THRESHOLD = 15;
  private static EXTREME_RENDER_COUNT_THRESHOLD = 30;
  
  // Threshold for render times that indicate performance problems (in ms)
  private static SLOW_RENDER_THRESHOLD = 16; // Below 60fps
  private static VERY_SLOW_RENDER_THRESHOLD = 50;
  
  // Cache for analysis results
  private cachedAnalysis: RenderAnalysis[] = [];
  private lastAnalysisTime = 0;
  private analysisThrottleMs = 2000; // Only analyze every 2 seconds
  
  constructor() {
    // Initialize with empty analysis
    this.cachedAnalysis = [];
  }
  
  /**
   * Analyze component render patterns and suggest optimizations
   * @returns Array of render analysis results
   */
  analyzeRenders = (): RenderAnalysis[] => {
    const now = Date.now();
    
    // Return cached results if within throttle window
    if (now - this.lastAnalysisTime < this.analysisThrottleMs && this.cachedAnalysis.length > 0) {
      return this.cachedAnalysis;
    }
    
    // Get metrics from performance monitor
    const metrics = performanceMonitor.getAllMetrics();
    
    // Skip if not enough data
    if (!metrics || metrics.length === 0) {
      return [];
    }
    
    // Create analysis for each component
    const analysis: RenderAnalysis[] = metrics.map(metric => {
      // Determine render frequency
      const renderFrequency = this.calculateRenderFrequency(metric);
      
      // Generate optimization suggestions
      const optimizations = this.suggestOptimizations(metric, renderFrequency);
      
      return {
        componentName: metric.componentName,
        renderCount: metric.renderCount,
        renderFrequency,
        averageRenderTime: metric.averageRenderTime,
        maxRenderTime: metric.maxRenderTime,
        possibleOptimizations: optimizations,
        isProblematic: optimizations.length > 0
      };
    });
    
    // Sort by problematic first, then by render count
    analysis.sort((a, b) => {
      if (a.isProblematic !== b.isProblematic) {
        return a.isProblematic ? -1 : 1;
      }
      return b.renderCount - a.renderCount;
    });
    
    // Update cache
    this.cachedAnalysis = analysis;
    this.lastAnalysisTime = now;
    
    return analysis;
  };
  
  /**
   * Calculate render frequency category
   */
  private calculateRenderFrequency(metric: any): RenderFrequency {
    const { renderCount, renderTimestamps = [] } = metric;
    
    // Not enough data
    if (renderTimestamps.length < 2) {
      return renderCount > RenderAnalyzer.HIGH_RENDER_COUNT_THRESHOLD ? 'high' : 'low';
    }
    
    // Calculate time between renders
    const timestamps = [...renderTimestamps].sort((a: number, b: number) => a - b);
    let totalDelta = 0;
    
    for (let i = 1; i < timestamps.length; i++) {
      totalDelta += timestamps[i] - timestamps[i - 1];
    }
    
    const avgTimeBetweenRenders = totalDelta / (timestamps.length - 1);
    
    // Determine frequency category
    if (avgTimeBetweenRenders < 100) return 'extreme';
    if (avgTimeBetweenRenders < 500) return 'high'; 
    if (avgTimeBetweenRenders < 2000) return 'medium';
    return 'low';
  }
  
  /**
   * Suggest optimizations based on render metrics
   */
  private suggestOptimizations(metric: any, frequency: RenderFrequency): string[] {
    const suggestions: string[] = [];
    
    // For high frequency renders
    if ((frequency === 'high' || frequency === 'extreme') && metric.renderCount > 10) {
      suggestions.push('Use React.memo or useMemo to prevent unnecessary rerenders');
      suggestions.push('Check for rapidly changing props or context values');
    }
    
    // For slow renders
    if (metric.averageRenderTime > RenderAnalyzer.SLOW_RENDER_THRESHOLD) {
      suggestions.push('Component has slow render times (>16ms), optimize render logic');
      
      if (metric.averageRenderTime > RenderAnalyzer.VERY_SLOW_RENDER_THRESHOLD) {
        suggestions.push('Consider code splitting or lazy loading this component');
      }
    }
    
    // For components with high render count
    if (metric.renderCount > RenderAnalyzer.HIGH_RENDER_COUNT_THRESHOLD) {
      suggestions.push('Use useCallback for event handlers to prevent recreation');
    }
    
    if (metric.renderCount > RenderAnalyzer.EXTREME_RENDER_COUNT_THRESHOLD) {
      suggestions.push('This component is rendering excessively, check for state updates in effects');
    }
    
    return suggestions;
  }
}

// Export the analyzer
export const renderAnalyzer = new RenderAnalyzer();
export { RenderAnalysis };
