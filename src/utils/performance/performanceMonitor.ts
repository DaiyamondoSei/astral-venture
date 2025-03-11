
/**
 * Performance Monitoring System
 * 
 * Centralized system for tracking component and application performance metrics.
 */

import { MetricType, WebVitalName, WebVitalCategory } from './types';
import { ComponentMetrics, WebVitalMetric, PerformanceMetric } from './types';

class PerformanceMonitor {
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private webVitals: Map<string, WebVitalMetric> = new Map();
  private isEnabled: boolean = true;
  private metricsCollectionEnabled: boolean = true;
  private slowRenderThreshold: number = 16; // 60fps threshold
  
  /**
   * Add or update component metrics
   * 
   * @param componentName Name of the component
   * @param renderTime Time taken to render in ms
   * @param type Type of metric (render, load, interaction)
   * @returns Updated metrics for the component
   */
  public addComponentMetric(
    componentName: string,
    renderTime: number,
    type: MetricType = 'render'
  ): ComponentMetrics {
    if (!this.isEnabled) {
      return {
        componentName,
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        memoryUsage: 0,
        renderSizes: []
      };
    }
    
    // Get existing metrics or create new ones
    const metrics = this.componentMetrics.get(componentName) || {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      memoryUsage: 0,
      renderSizes: []
    };
    
    // Update metrics
    metrics.renderCount += 1;
    metrics.totalRenderTime += renderTime;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
    metrics.lastRenderTime = renderTime;
    
    // Store updated metrics
    this.componentMetrics.set(componentName, metrics);
    
    // If render time exceeds threshold, log warning
    if (type === 'render' && renderTime > this.slowRenderThreshold) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
    
    return metrics;
  }
  
  /**
   * Add web vital metric
   * 
   * @param name Web vital name (e.g., FCP, LCP)
   * @param value Metric value
   * @param category Metric category
   */
  public addWebVital(
    name: WebVitalName,
    value: number,
    category: WebVitalCategory
  ): void {
    if (!this.isEnabled) return;
    
    const timestamp = Date.now();
    
    this.webVitals.set(name, {
      name,
      value,
      category,
      timestamp
    });
    
    // Log web vital for monitoring
    console.info(`Web Vital: ${name} = ${value}ms (${category})`);
  }
  
  /**
   * Get metrics for a specific component
   * 
   * @param componentName Name of the component
   * @returns Metrics for the component or null if not found
   */
  public getComponentMetrics(componentName: string): ComponentMetrics | null {
    return this.componentMetrics.get(componentName) || null;
  }
  
  /**
   * Get all component metrics
   * 
   * @returns Array of component metrics
   */
  public getAllComponentMetrics(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values());
  }
  
  /**
   * Get a specific web vital metric
   * 
   * @param name Web vital name
   * @returns Web vital metric or null if not found
   */
  public getWebVital(name: WebVitalName): WebVitalMetric | null {
    return this.webVitals.get(name) || null;
  }
  
  /**
   * Get all web vital metrics
   * 
   * @returns Object mapping web vital names to metrics
   */
  public getAllWebVitals(): Record<string, WebVitalMetric> {
    return Object.fromEntries(this.webVitals.entries());
  }
  
  /**
   * Reset all metrics
   */
  public resetMetrics(): void {
    this.componentMetrics.clear();
    this.webVitals.clear();
  }
  
  /**
   * Enable or disable metrics collection
   * 
   * @param enabled Whether metrics should be collected
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set whether metrics should be sent to server
   * 
   * @param enabled Whether metrics should be sent to server
   */
  public setMetricsEnabled(enabled: boolean): void {
    this.metricsCollectionEnabled = enabled;
  }
  
  /**
   * Set the threshold for slow render warnings
   * 
   * @param threshold Threshold in milliseconds
   */
  public setSlowRenderThreshold(threshold: number): void {
    this.slowRenderThreshold = threshold;
  }
  
  /**
   * Get performance summary
   * 
   * @returns Object with performance summary
   */
  public getPerformanceSummary(): Record<string, any> {
    const componentCount = this.componentMetrics.size;
    const slowRenderComponents = Array.from(this.componentMetrics.values())
      .filter(m => m.lastRenderTime > this.slowRenderThreshold);
    
    return {
      trackedComponents: componentCount,
      slowRenderComponents: slowRenderComponents.length,
      webVitalsCount: this.webVitals.size,
      totalRenderTime: Array.from(this.componentMetrics.values())
        .reduce((sum, metric) => sum + metric.totalRenderTime, 0),
      averageRenderTime: Array.from(this.componentMetrics.values())
        .reduce((sum, metric) => sum + metric.averageRenderTime, 0) / 
        Math.max(1, componentCount)
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export the singleton instance as both default and named export
export { performanceMonitor };
export default performanceMonitor;

// For backward compatibility with existing code
export * from './types';
