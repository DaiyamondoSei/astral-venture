/**
 * Performance Monitoring Utility
 * 
 * Provides centralized performance monitoring for the application.
 */

import { ComponentMetrics, MetricType, PerformanceMetric, WebVitalMetric } from './types';

class PerformanceMonitor {
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private webVitals: WebVitalMetric[] = [];
  private metricsBuffer: PerformanceMetric[] = [];
  private bufferSize = 10;
  private flushInterval = 60000; // 1 minute
  private flushTimer: number | null = null;
  private metricsEnabled = true;

  constructor() {
    // Set up automatic flushing if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.flushTimer = window.setInterval(() => this.flushMetrics(), this.flushInterval);
    }
  }

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
    if (renderTime > 16) {
      metrics.slowRenderCount += 1;
    }
    
    // Store last 10 render times for analysis
    metrics.renderTimes.push(renderTime);
    if (metrics.renderTimes.length > 10) {
      metrics.renderTimes.shift();
    }
    
    // Recalculate average
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
    
    // Add to buffer for server reporting
    this.addToMetricsBuffer(metrics);
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
    
    this.webVitals.push({
      name,
      value,
      timestamp: Date.now(),
      category
    });
  }

  /**
   * Add a metric to the buffer for batch reporting
   */
  private addToMetricsBuffer(metrics: ComponentMetrics): void {
    // Create a metric record for the buffer
    const metricRecord: PerformanceMetric = {
      component_name: metrics.componentName,
      average_render_time: metrics.averageRenderTime,
      total_renders: metrics.renderCount,
      slow_renders: metrics.slowRenderCount,
      max_render_time: metrics.maxRenderTime,
      min_render_time: metrics.minRenderTime === Number.MAX_SAFE_INTEGER ? 0 : metrics.minRenderTime,
      metric_type: metrics.metricType || 'render',
      context: {
        lastRenderTime: metrics.lastRenderTime,
        recentRenders: metrics.renderTimes
      }
    };
    
    this.metricsBuffer.push(metricRecord);
    
    // Auto-flush if buffer is full
    if (this.metricsBuffer.length >= this.bufferSize) {
      this.flushMetrics();
    }
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
    this.metricsBuffer = [];
  }
  
  /**
   * Enable or disable metrics collection
   */
  public setMetricsEnabled(enabled: boolean): void {
    this.metricsEnabled = enabled;
  }
  
  /**
   * Flush metrics to the server
   */
  public async flushMetrics(): Promise<boolean> {
    if (this.metricsBuffer.length === 0) {
      return true;
    }
    
    try {
      // Prepare metrics batch for sending
      const metricsBatch = [...this.metricsBuffer];
      this.metricsBuffer = [];
      
      // Report metrics to server
      // This will be implemented by the metrics reporter
      // For now, just log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Flushing performance metrics:', metricsBatch);
      }
      
      return true;
    } catch (error) {
      console.error('Error flushing metrics:', error);
      
      // Return metrics to buffer to try again later
      // but only keep most recent metrics to avoid overflow
      if (this.metricsBuffer.length < this.bufferSize) {
        this.metricsBuffer = this.metricsBuffer.concat(this.metricsBuffer.slice(0, this.bufferSize - this.metricsBuffer.length));
      }
      
      return false;
    }
  }
  
  /**
   * Report metrics immediately (useful for critical paths)
   */
  public async reportNow(): Promise<boolean> {
    return this.flushMetrics();
  }
  
  /**
   * Clean up when the component is unmounted
   */
  public dispose(): void {
    if (this.flushTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Flush any remaining metrics
    this.flushMetrics().catch(error => {
      console.error('Error flushing metrics during disposal:', error);
    });
  }
}

// Create a singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
