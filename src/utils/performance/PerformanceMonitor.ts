
import type { ComponentMetrics, PerformanceEventType } from '@/types/performance';

/**
 * Subscription callback type
 */
export type PerformanceSubscriptionCallback = (metrics: ComponentMetrics[]) => void;

/**
 * Performance monitoring service for tracking component render times and metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics> = new Map();
  private readonly slowRenderThreshold: number = 16; // 1 frame at 60fps
  private subscribers: Set<PerformanceSubscriptionCallback> = new Set();
  private isMonitoring: boolean = false;

  /**
   * Start performance monitoring
   */
  public startMonitoring = (): void => {
    this.isMonitoring = true;
    console.log('Performance monitoring started');
  };

  /**
   * Stop performance monitoring
   */
  public stopMonitoring = (): void => {
    this.isMonitoring = false;
    console.log('Performance monitoring stopped');
  };

  /**
   * Check if monitoring is active
   */
  public isActive = (): boolean => {
    return this.isMonitoring;
  };

  /**
   * Reset all metrics
   */
  public resetMetrics = (): void => {
    this.metrics.clear();
    this.notifySubscribers();
    console.log('Performance metrics reset');
  };

  /**
   * Record a render event for a component
   * @param componentName Component name
   * @param renderTime Render time in milliseconds
   */
  public recordRender = (componentName: string, renderTime: number): void => {
    if (!this.isMonitoring) return;
    
    const metric = this.metrics.get(componentName) || {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      slowRenderCount: 0
    };

    // Set first render time on first render
    if (metric.renderCount === 0) {
      metric.firstRenderTime = renderTime;
    }

    metric.renderCount++;
    metric.totalRenderTime += renderTime;
    metric.averageRenderTime = metric.totalRenderTime / metric.renderCount;
    metric.lastRenderTime = renderTime;

    if (renderTime > this.slowRenderThreshold) {
      metric.slowRenderCount++;
    }

    this.metrics.set(componentName, metric);
    this.notifySubscribers();
  };

  /**
   * Record multiple render times for a component
   * @param componentName Component name
   * @param renderTimes Array of render times
   */
  public recordRenderBatch = (componentName: string, renderTimes: number[]): void => {
    if (!this.isMonitoring || renderTimes.length === 0) return;
    renderTimes.forEach(time => this.recordRender(componentName, time));
  };

  /**
   * Get metrics for a specific component
   * @param componentName Component name
   */
  public getComponentMetrics = (componentName: string): ComponentMetrics | undefined => {
    return this.metrics.get(componentName);
  };

  /**
   * Get all component metrics
   */
  public getAllMetrics = (): ComponentMetrics[] => {
    return Array.from(this.metrics.values());
  };

  /**
   * Get the slowest components
   * @param limit Maximum number of components to return
   */
  public getSlowestComponents = (limit: number = 5): ComponentMetrics[] => {
    return this.getAllMetrics()
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, limit);
  };

  /**
   * Clear all metrics
   */
  public clearMetrics = (): void => {
    this.metrics.clear();
    this.notifySubscribers();
  };

  /**
   * Report a slow render
   * @param componentName Component name
   * @param renderTime Render time in milliseconds
   */
  public reportSlowRender = (componentName: string, renderTime: number): void => {
    console.warn(
      `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
    );
  };

  /**
   * Record component unmount
   * @param componentName Component name
   */
  public recordUnmount = (componentName: string): void => {
    this.metrics.delete(componentName);
    this.notifySubscribers();
  };

  /**
   * Subscribe to metric updates
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  public subscribe = (callback: PerformanceSubscriptionCallback): () => void => {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  };

  /**
   * Notify all subscribers of metric updates
   */
  private notifySubscribers(): void {
    const metrics = this.getAllMetrics();
    this.subscribers.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('Error in performance subscriber:', error);
      }
    });
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Default export
export default performanceMonitor;
