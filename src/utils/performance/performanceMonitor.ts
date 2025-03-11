
/**
 * Performance Monitoring System
 * 
 * Centralized system for tracking component and application performance metrics.
 */

import { 
  MetricType, 
  WebVitalName, 
  WebVitalCategory,
  ComponentMetrics, 
  WebVitalMetric, 
  PerformanceMetric 
} from './types';

class PerformanceMonitor {
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private webVitals: Map<string, WebVitalMetric> = new Map();
  private isEnabled: boolean = true;
  private metricsCollectionEnabled: boolean = true;
  private slowRenderThreshold: number = 16; // 60fps threshold
  private subscribers: ((metrics: Map<string, ComponentMetrics>) => void)[] = [];
  
  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    this.isEnabled = true;
    console.log('Performance monitoring started');
  }
  
  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    this.isEnabled = false;
    console.log('Performance monitoring stopped');
  }
  
  /**
   * Record component render
   * 
   * @param componentName Name of the component 
   * @param renderTime Time it took to render
   * @param type Type of metric
   */
  public recordRender(
    componentName: string,
    renderTime: number,
    type: MetricType = 'render'
  ): ComponentMetrics {
    return this.addComponentMetric(componentName, renderTime, type);
  }
  
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
    
    // Notify subscribers
    this.notifySubscribers();
    
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
    this.notifySubscribers();
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
   * Subscribe to metrics updates
   * 
   * @param callback Function to call when metrics change
   * @returns Unsubscribe function
   */
  public subscribe(callback: (metrics: Map<string, ComponentMetrics>) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notify all subscribers of metrics changes
   */
  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(this.componentMetrics);
      } catch (error) {
        console.error('Error in performance metrics subscriber:', error);
      }
    }
  }
  
  /**
   * Get slowest components based on average render time
   * 
   * @param limit Maximum number of components to return
   * @returns Array of slowest components
   */
  public getSlowestComponents(limit: number = 5): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values())
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, limit);
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
  
  /**
   * Clear metrics for testing
   */
  public clearMetrics(): void {
    this.resetMetrics();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export the singleton instance as both default and named export
export { performanceMonitor };
export default performanceMonitor;

// For backward compatibility with existing code
export * from './types';
