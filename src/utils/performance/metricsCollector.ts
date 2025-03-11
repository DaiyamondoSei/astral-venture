/**
 * Metrics Collector
 * 
 * Service for collecting and tracking performance metrics.
 */
import { PerformanceMetric, ComponentMetrics, MetricType } from '../performance/types';

class MetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics = new Map<string, ComponentMetrics>();
  private isEnabled: boolean = true;
  private throttleInterval: number = 1000;
  private throttleTimestamp: number = 0;

  /**
   * Track a component-specific metric
   */
  public trackComponentMetric(
    componentName: string, 
    metricName: string,
    value: number,
    type: MetricType = 'render'
  ): void {
    if (!this.isEnabled) return;

    const now = Date.now();
    if (now - this.throttleTimestamp < this.throttleInterval) {
      return;
    }
    this.throttleTimestamp = now;

    const metric: PerformanceMetric = {
      component_name: componentName,
      metric_name: metricName,
      value,
      timestamp: now,
      category: type,
      type
    };

    this.metrics.push(metric);
    this.updateComponentMetrics(componentName, value, type);
  }

  /**
   * Collect a general performance metric
   */
  public collect(
    metricName: string,
    value: number,
    type: MetricType = 'metric', 
    metadata?: Record<string, any>,
    componentName?: string
  ): void {
    if (!this.isEnabled) return;
    
    const metric: PerformanceMetric = {
      metric_name: metricName,
      value,
      timestamp: Date.now(),
      category: componentName ? 'component' : 'application',
      type,
      component_name: componentName,
      metadata
    };
    
    this.metrics.push(metric);
    
    if (componentName && type === 'render') {
      this.updateComponentMetrics(componentName, value, type);
    }
  }

  /**
   * Update component metrics for tracking
   */
  private updateComponentMetrics(
    componentName: string,
    renderTime: number,
    type: MetricType
  ): void {
    if (type !== 'render') return;

    const existing = this.componentMetrics.get(componentName) || {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      renderTimes: []
    };

    const updated: ComponentMetrics = {
      ...existing,
      renderCount: existing.renderCount + 1,
      totalRenderTime: existing.totalRenderTime + renderTime,
      lastRenderTime: renderTime,
      averageRenderTime: (existing.totalRenderTime + renderTime) / (existing.renderCount + 1),
      minRenderTime: Math.min(renderTime, existing.minRenderTime ?? renderTime),
      maxRenderTime: Math.max(renderTime, existing.maxRenderTime ?? renderTime),
      lastUpdated: Date.now()
    };

    // If first render, set first render time
    if (existing.renderCount === 0) {
      updated.firstRenderTime = renderTime;
    }

    // Keep track of render times history
    if (!existing.renderTimes) {
      updated.renderTimes = [renderTime];
    } else if (existing.renderTimes.length < 10) {
      updated.renderTimes = [...existing.renderTimes, renderTime];
    } else {
      updated.renderTimes = [...existing.renderTimes.slice(1), renderTime];
    }

    this.componentMetrics.set(componentName, updated);
  }

  /**
   * Get all collected metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get component metrics tracking data
   */
  public getComponentMetrics(): Map<string, ComponentMetrics> {
    return new Map(this.componentMetrics);
  }

  /**
   * Clear all tracked metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
  }

  /**
   * Enable or disable metrics collection
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set throttle interval for performance optimization
   */
  public setThrottleInterval(interval: number): void {
    this.throttleInterval = interval;
  }

  /**
   * Set auto-flush interval for the collector
   * (This method exists for backward compatibility)
   */
  public setAutoFlushInterval(interval: number): void {
    this.throttleInterval = interval;
  }
}

export const metricsCollector = new MetricsCollector();
export default metricsCollector;
