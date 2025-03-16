
/**
 * RenderAnalyzer
 * 
 * Analyzes component render performance and provides optimization suggestions
 */
import { ComponentMetrics } from '@/types/core/performance/types';
import { performanceMonitor } from './performanceMonitor';

export interface RenderAnalysis {
  componentName: string;
  renderTime: number;
  renderCount: number;
  isPerformanceCritical: boolean;
  possibleIssues: string[];
  possibleOptimizations: string[];
}

export class RenderAnalyzer {
  private static instance: RenderAnalyzer;
  private slowRenderThreshold: number = 16; // ms
  private reRenderThreshold: number = 3; // consecutive renders

  private constructor() {
    // Initialize as a singleton
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): RenderAnalyzer {
    if (!RenderAnalyzer.instance) {
      RenderAnalyzer.instance = new RenderAnalyzer();
    }
    return RenderAnalyzer.instance;
  }

  /**
   * Set the slow render threshold
   */
  public setSlowRenderThreshold(thresholdMs: number): void {
    this.slowRenderThreshold = thresholdMs;
  }

  /**
   * Set the re-render threshold
   */
  public setReRenderThreshold(count: number): void {
    this.reRenderThreshold = count;
  }

  /**
   * Analyze component render metrics
   */
  public analyzeComponent(metrics: { 
    componentName: string; 
    renderTime: number;
    renderCount: number;
  }): RenderAnalysis {
    const { componentName, renderTime, renderCount } = metrics;
    
    const isPerformanceCritical = renderTime > this.slowRenderThreshold;
    const issues: string[] = [];
    const optimizations: string[] = [];

    // Identify possible issues
    if (renderTime > this.slowRenderThreshold) {
      issues.push(`Slow render time (${renderTime.toFixed(2)}ms > ${this.slowRenderThreshold}ms threshold)`);
    }

    if (renderCount > this.reRenderThreshold) {
      issues.push(`Excessive re-renders (${renderCount} renders)`);
    }

    // Suggest optimizations
    if (renderTime > this.slowRenderThreshold) {
      optimizations.push('Consider using React.memo to prevent unnecessary re-renders');
      optimizations.push('Check for expensive calculations that could be memoized');
    }

    if (renderCount > this.reRenderThreshold) {
      optimizations.push('Verify dependency arrays in useEffect, useMemo, and useCallback');
      optimizations.push('Check for object/array literals in props that cause re-renders');
    }

    // Add general optimization suggestions
    if (isPerformanceCritical) {
      optimizations.push('Consider code splitting or lazy loading');
      optimizations.push('Optimize expensive DOM operations');
    }

    return {
      componentName,
      renderTime,
      renderCount,
      isPerformanceCritical,
      possibleIssues: issues,
      possibleOptimizations: optimizations
    };
  }

  /**
   * Get metrics for a component
   */
  public getComponentMetrics(componentName: string): ComponentMetrics | null {
    return performanceMonitor.getComponentMetrics(componentName);
  }

  /**
   * Get all components sorted by render time
   */
  public getSlowestComponents(limit: number = 5): ComponentMetrics[] {
    return performanceMonitor.getSortedComponents('lastRenderTime', limit);
  }

  /**
   * Get the most frequently rendering components
   */
  public getMostFrequentlyRenderingComponents(limit: number = 5): ComponentMetrics[] {
    return performanceMonitor.getSortedComponents('renderCount', limit);
  }
}
