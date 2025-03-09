
/**
 * Analyzer for component render performance
 */
import { RenderFrequency } from '../performanceUtils';
import { performanceMonitor } from './performanceMonitor';

// Types
export interface RenderMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRenderTime?: number;
}

export interface RenderAnalysis {
  componentName: string;
  averageRenderTime: number;
  renderCount: number;
  lastRenderTime?: number;
  renderFrequency: RenderFrequency;
  isSlowRender: boolean;
  possibleOptimizations: string[];
}

export class RenderAnalyzer {
  private static instance: RenderAnalyzer;
  
  // Thresholds (in ms)
  private RENDER_TIME_WARNING = 16; // 60fps threshold
  private RENDER_TIME_CRITICAL = 50;
  private RENDER_COUNT_WARNING = 5; // per second
  private RENDER_COUNT_CRITICAL = 20; // per second

  private constructor() {}

  public static getInstance(): RenderAnalyzer {
    if (!RenderAnalyzer.instance) {
      RenderAnalyzer.instance = new RenderAnalyzer();
    }
    return RenderAnalyzer.instance;
  }

  /**
   * Analyze component render metrics
   */
  public analyzeComponent(metrics: Partial<RenderMetrics>): RenderAnalysis {
    const safeMetrics = {
      componentName: metrics.componentName || 'unknown',
      renderTime: metrics.renderTime || 0,
      renderCount: metrics.renderCount || 0,
      lastRenderTime: metrics.lastRenderTime || 0
    };
    
    // Get rendering frequency classification
    const renderFrequency = this.classifyRenderFrequency(safeMetrics);
    
    // Determine if this is a slow render
    const isSlowRender = safeMetrics.renderTime > this.RENDER_TIME_WARNING;
    
    // Generate optimization suggestions
    const possibleOptimizations = this.generateOptimizationSuggestions(safeMetrics, renderFrequency);
    
    return {
      componentName: safeMetrics.componentName,
      averageRenderTime: safeMetrics.renderTime,
      renderCount: safeMetrics.renderCount,
      lastRenderTime: safeMetrics.lastRenderTime,
      renderFrequency,
      isSlowRender,
      possibleOptimizations
    };
  }

  /**
   * Analyze component metrics by name
   */
  public analyzeComponentByName(componentName: string): RenderAnalysis | null {
    const metrics = performanceMonitor.getComponentMetrics(componentName);
    
    if (!metrics) return null;
    
    // Convert performanceMonitor metrics to RenderMetrics format
    const renderMetrics: Partial<RenderMetrics> = {
      componentName: componentName,
      renderTime: metrics.averageRenderTime || 0,
      renderCount: metrics.renderCount || 0,
      lastRenderTime: metrics.lastRenderTime || 0
    };
    
    return this.analyzeComponent(renderMetrics);
  }
  
  /**
   * Analyze all components
   */
  public analyzeAllComponents(): RenderAnalysis[] {
    const allMetrics = performanceMonitor.getAllMetrics();
    const results: RenderAnalysis[] = [];
    
    for (const componentName in allMetrics) {
      const analysis = this.analyzeComponentByName(componentName);
      if (analysis) {
        results.push(analysis);
      }
    }
    
    return results;
  }
  
  /**
   * Get slow-rendering components
   */
  public getSlowRenderingComponents(): RenderAnalysis[] {
    return this.analyzeAllComponents()
      .filter(analysis => analysis.isSlowRender)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }
  
  /**
   * Get frequently-rendering components
   */
  public getFrequentlyRenderingComponents(): RenderAnalysis[] {
    return this.analyzeAllComponents()
      .filter(analysis => analysis.renderFrequency !== RenderFrequency.NORMAL)
      .sort((a, b) => b.renderCount - a.renderCount);
  }

  /**
   * Classify render frequency
   */
  private classifyRenderFrequency(metrics: RenderMetrics): RenderFrequency {
    if (metrics.renderCount > this.RENDER_COUNT_CRITICAL) {
      return RenderFrequency.EXCESSIVE;
    } else if (metrics.renderCount > this.RENDER_COUNT_WARNING) {
      return RenderFrequency.FREQUENT;
    } else {
      return RenderFrequency.NORMAL;
    }
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(
    metrics: RenderMetrics, 
    frequency: RenderFrequency
  ): string[] {
    const suggestions: string[] = [];
    
    if (metrics.renderTime > this.RENDER_TIME_CRITICAL) {
      suggestions.push('This component has critical render performance issues and should be optimized immediately.');
      suggestions.push('Consider splitting this component into smaller, more focused components.');
    } else if (metrics.renderTime > this.RENDER_TIME_WARNING) {
      suggestions.push('Component renders slower than the 60fps threshold (16ms). Consider optimizing.');
    }
    
    if (frequency === RenderFrequency.EXCESSIVE) {
      suggestions.push('Component is rendering excessively. Use React.memo() or implement shouldComponentUpdate.');
      suggestions.push('Check for missing dependency arrays in useEffect, useMemo, or useCallback hooks.');
    } else if (frequency === RenderFrequency.FREQUENT) {
      suggestions.push('Component renders frequently. Consider using memoization techniques.');
    }
    
    // Add general optimization suggestions
    if (suggestions.length > 0) {
      suggestions.push('Avoid expensive calculations during render.');
      suggestions.push('Move complex logic to useMemo or useCallback hooks with proper dependency arrays.');
    }
    
    return suggestions;
  }
}
