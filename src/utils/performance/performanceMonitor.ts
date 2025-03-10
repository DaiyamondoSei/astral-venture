
/**
 * Performance Monitoring Utility
 * 
 * Provides centralized performance monitoring for the application.
 */

import { ComponentMetrics, MetricType, PerformanceMetric, WebVitalMetric } from './types';
import metricsReporter from './metricsReporter';

class PerformanceMonitor {
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private webVitals: WebVitalMetric[] = [];
  private metricsEnabled = true;
  private slowRenderThreshold = 16; // milliseconds (1 frame at 60fps)

  /**
   * Add a component performance metric
   */
  public addComponentMetric(
    componentName: string, 
    renderTime: number,
    type: MetricType = 'render'
  ): void {
    if (!this.metricsEnabled) return;
    
    // Get or create component metrics
    let metrics = this.componentMetrics.get(componentName);
    
    if (!metrics) {
      metrics = {
        componentName,
        totalRenderTime: 0,
        renderCount: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        slowRenderCount: 0,
        maxRenderTime: 0,
        minRenderTime: Number.MAX_SAFE_INTEGER,
        renderTimes: [],
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        metricType: type
      };
      this.componentMetrics.set(componentName, metrics);
    }
    
    // Update metrics
    metrics.totalRenderTime += renderTime;
    metrics.renderCount += 1;
    metrics.lastRenderTime = renderTime;
    metrics.lastUpdated = Date.now();
    
    // Update min/max times
    if (renderTime > metrics.maxRenderTime) {
      metrics.maxRenderTime = renderTime;
    }
    if (renderTime < metrics.minRenderTime) {
      metrics.minRenderTime = renderTime;
    }
    
    // Check if this is a slow render (> 16ms)
    if (renderTime > this.slowRenderThreshold) {
      metrics.slowRenderCount += 1;
    }
    
    // Store last 10 render times for analysis
    metrics.renderTimes.push(renderTime);
    if (metrics.renderTimes.length > 10) {
      metrics.renderTimes.shift();
    }
    
    // Recalculate average
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
    
    // Report metrics to the server
    metricsReporter.addComponentMetric(metrics);
  }

  /**
   * Add a Web Vital metric
   */
  public addWebVital(
    name: string,
    value: number,
    category: 'interaction' | 'loading' | 'visual_stability'
  ): void {
    if (!this.metricsEnabled) return;
    
    const webVital: WebVitalMetric = {
      name,
      value,
      timestamp: Date.now(),
      category
    };
    
    this.webVitals.push(webVital);
    
    // Report to metrics reporter
    metricsReporter.addWebVital(webVital);
  }

  /**
   * Get all component metrics
   */
  public getComponentMetrics(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values());
  }
  
  /**
   * Get metrics for a specific component
   */
  public getComponentMetricsByName(componentName: string): ComponentMetrics | undefined {
    return this.componentMetrics.get(componentName);
  }
  
  /**
   * Get all Web Vitals metrics
   */
  public getWebVitals(): WebVitalMetric[] {
    return this.webVitals;
  }
  
  /**
   * Clear metrics for testing or on user logout
   */
  public clearMetrics(): void {
    this.componentMetrics.clear();
    this.webVitals = [];
  }
  
  /**
   * Enable or disable metrics collection
   */
  public setMetricsEnabled(enabled: boolean): void {
    this.metricsEnabled = enabled;
    metricsReporter.setEnabled(enabled);
  }
  
  /**
   * Report metrics immediately (useful for critical paths)
   */
  public async reportNow(): Promise<boolean> {
    return metricsReporter.reportMetrics();
  }
  
  /**
   * Clean up when the component is unmounted
   */
  public dispose(): void {
    metricsReporter.dispose();
  }
}

// Create a singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
