
/**
 * Render Analyzer
 * 
 * Analyzes component render patterns and frequencies to identify performance issues.
 */

import { performanceMonitor } from './performanceMonitor';
import { RenderFrequency } from './types';
import { RenderFrequencies } from './constants';

// Constants for render frequency thresholds
const RENDER_FREQUENCY_THRESHOLDS = {
  LOW: 1, // 1 render per second
  MEDIUM: 3, // 3 renders per second
  HIGH: 10, // 10 renders per second
  // Anything above HIGH is considered EXCESSIVE
};

// Time window to look back for render frequency analysis (in ms)
const ANALYSIS_WINDOW_MS = 5000; // 5 seconds

/**
 * Analyzes component render patterns and determines the frequency category
 */
export class RenderAnalyzer {
  private componentMetrics: Map<string, number[]> = new Map();
  private lastAnalysis: Map<string, { frequency: RenderFrequency, timestamp: number }> = new Map();
  
  /**
   * Record a render for a specific component
   */
  public recordRender(componentName: string, renderTime: number): void {
    const now = performance.now();
    
    if (!this.componentMetrics.has(componentName)) {
      this.componentMetrics.set(componentName, []);
    }
    
    // Store timestamp of the render
    this.componentMetrics.get(componentName)?.push(now);
    
    // Clean old data from the analysis window
    this.cleanOldData(componentName, now);
    
    // Report the render to the performance monitor
    performanceMonitor.addComponentMetric(componentName, renderTime);
  }
  
  /**
   * Analyze render frequency for a specific component
   */
  public analyzeComponent(componentName: string): RenderFrequency {
    const now = performance.now();
    const metrics = this.componentMetrics.get(componentName);
    
    // If no metrics or last analysis is recent, return the last result
    const lastAnalysis = this.lastAnalysis.get(componentName);
    if (!metrics || metrics.length === 0) {
      return RenderFrequencies.LOW;
    }
    
    if (lastAnalysis && (now - lastAnalysis.timestamp < 1000)) {
      return lastAnalysis.frequency;
    }
    
    // Count renders in the analysis window
    const rendersInWindow = metrics.filter(timestamp => now - timestamp <= ANALYSIS_WINDOW_MS).length;
    
    // Calculate renders per second
    const rendersPerSecond = (rendersInWindow / (ANALYSIS_WINDOW_MS / 1000));
    
    // Determine frequency category
    let frequency: RenderFrequency;
    if (rendersPerSecond <= RENDER_FREQUENCY_THRESHOLDS.LOW) {
      frequency = RenderFrequencies.LOW;
    } else if (rendersPerSecond <= RENDER_FREQUENCY_THRESHOLDS.MEDIUM) {
      frequency = RenderFrequencies.MEDIUM;
    } else if (rendersPerSecond <= RENDER_FREQUENCY_THRESHOLDS.HIGH) {
      frequency = RenderFrequencies.HIGH;
    } else {
      frequency = RenderFrequencies.EXCESSIVE;
    }
    
    // Store the analysis result
    this.lastAnalysis.set(componentName, { frequency, timestamp: now });
    
    return frequency;
  }
  
  /**
   * Remove old render data outside the analysis window
   */
  private cleanOldData(componentName: string, now: number): void {
    const metrics = this.componentMetrics.get(componentName);
    if (!metrics) return;
    
    const cutoffTime = now - ANALYSIS_WINDOW_MS;
    const newMetrics = metrics.filter(timestamp => timestamp >= cutoffTime);
    this.componentMetrics.set(componentName, newMetrics);
  }
  
  /**
   * Get render frequency for all components
   */
  public getAllComponentFrequencies(): Record<string, RenderFrequency> {
    const result: Record<string, RenderFrequency> = {};
    
    for (const componentName of this.componentMetrics.keys()) {
      result[componentName] = this.analyzeComponent(componentName);
    }
    
    return result;
  }
  
  /**
   * Reset all metrics
   */
  public reset(): void {
    this.componentMetrics.clear();
    this.lastAnalysis.clear();
  }
}

// Export a singleton instance
export const renderAnalyzer = new RenderAnalyzer();
