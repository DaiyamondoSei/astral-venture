/**
 * Performance Metrics Collector
 * 
 * Collects and organizes performance metrics for components and web vitals.
 */

import type { MetricType, ComponentMetrics, WebVitalMetric } from './types';

interface MetricsSubscription {
  callback: (metrics: Map<string, ComponentMetrics>) => void;
  id: string;
}

class MetricsCollector {
  private metrics: Map<string, ComponentMetrics> = new Map();
  private webVitals: WebVitalMetric[] = [];
  private slowThreshold: number = 16; // 16ms = 1 frame at 60fps
  private subscribers: MetricsSubscription[] = [];
  private nextSubscriberId: number = 1;
  
  /**
   * Add or update a component metric
   */
  public addComponentMetric(
    componentName: string,
    renderTime: number,
    type: MetricType = 'render'
  ): void {
    const existingMetric = this.metrics.get(componentName);
    
    if (existingMetric) {
      // Update existing metric
      existingMetric.totalRenderTime += renderTime;
      existingMetric.renderCount += 1;
      existingMetric.averageRenderTime = existingMetric.totalRenderTime / existingMetric.renderCount;
      existingMetric.lastRenderTime = renderTime;
      
      if (renderTime > this.slowThreshold) {
        existingMetric.slowRenderCount += 1;
      }
      
      if (renderTime > existingMetric.maxRenderTime) {
        existingMetric.maxRenderTime = renderTime;
      }
      
      if (renderTime < existingMetric.minRenderTime || existingMetric.minRenderTime === 0) {
        existingMetric.minRenderTime = renderTime;
      }
      
      existingMetric.renderTimes.push(renderTime);
      // Keep only the last 100 render times
      if (existingMetric.renderTimes.length > 100) {
        existingMetric.renderTimes.shift();
      }
      
      // Update last updated timestamp
      existingMetric.lastUpdated = Date.now();
    } else {
      // Create new metric
      this.metrics.set(componentName, {
        componentName,
        totalRenderTime: renderTime,
        renderCount: 1,
        averageRenderTime: renderTime,
        lastRenderTime: renderTime,
        slowRenderCount: renderTime > this.slowThreshold ? 1 : 0,
        maxRenderTime: renderTime,
        minRenderTime: renderTime,
        renderTimes: [renderTime],
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        metricType: type
      });
    }
    
    // Notify subscribers
    this.notifySubscribers();
  }
  
  /**
   * Add a web vital metric
   */
  public addWebVital(
    name: string,
    value: number,
    category: 'interaction' | 'loading' | 'visual_stability'
  ): void {
    this.webVitals.push({
      name,
      value,
      timestamp: Date.now(),
      category
    });
    
    // Limit the number of stored web vitals to prevent memory issues
    if (this.webVitals.length > 500) {
      this.webVitals.shift();
    }
  }
  
  /**
   * Get all metrics
   */
  public getMetrics(): Map<string, ComponentMetrics> {
    return new Map(this.metrics);
  }
  
  /**
   * Get web vitals metrics
   */
  public getWebVitals(): WebVitalMetric[] {
    return [...this.webVitals];
  }
  
  /**
   * Set the threshold for slow renders
   */
  public setSlowThreshold(thresholdMs: number): void {
    this.slowThreshold = thresholdMs;
    
    // Recalculate slow render counts for all metrics
    this.metrics.forEach(metric => {
      metric.slowRenderCount = metric.renderTimes.filter(time => time > thresholdMs).length;
    });
  }
  
  /**
   * Get the current slow threshold
   */
  public getSlowThreshold(): number {
    return this.slowThreshold;
  }
  
  /**
   * Reset all collected metrics
   */
  public reset(): void {
    this.metrics.clear();
    this.webVitals = [];
    this.notifySubscribers();
  }
  
  /**
   * Get the components with the slowest average render times
   */
  public getSlowestComponents(limit: number = 5): [string, ComponentMetrics][] {
    return Array.from(this.metrics.entries())
      .sort((a, b) => b[1].averageRenderTime - a[1].averageRenderTime)
      .slice(0, limit);
  }
  
  /**
   * Get components with the most renders
   */
  public getMostRenderedComponents(limit: number = 5): [string, ComponentMetrics][] {
    return Array.from(this.metrics.entries())
      .sort((a, b) => b[1].renderCount - a[1].renderCount)
      .slice(0, limit);
  }
  
  /**
   * Subscribe to metrics updates
   */
  public subscribe(callback: (metrics: Map<string, ComponentMetrics>) => void): () => void {
    const id = `sub_${this.nextSubscriberId++}`;
    
    this.subscribers.push({
      callback,
      id
    });
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub.id !== id);
    };
  }
  
  /**
   * Notify all subscribers of metrics updates
   */
  private notifySubscribers(): void {
    if (this.subscribers.length === 0) return;
    
    const metrics = this.getMetrics();
    this.subscribers.forEach(sub => {
      try {
        sub.callback(metrics);
      } catch (error) {
        console.error('Error in metrics subscriber:', error);
      }
    });
  }
}

// Create a singleton instance
export const metricsCollector = new MetricsCollector();

// Export the singleton instance as the default export
export default metricsCollector;
