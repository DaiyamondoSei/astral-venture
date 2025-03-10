
import type { ComponentMetrics } from '@/services/ai/types';

/**
 * Interface for component metrics tracked by the performance monitor
 */
export interface IComponentMetrics {
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  total_render_time: number;
  max_render_time: number;
  last_render_time: number;
  created_at: string;
}

/**
 * Performance Monitor class that tracks component render times and performance metrics
 */
export class PerformanceMonitor {
  private componentMetrics: Map<string, IComponentMetrics> = new Map();
  private slowThreshold: number = 16; // 60fps frame time in ms
  private reportsEnabled: boolean = true;
  private collectors: Array<(metrics: Map<string, IComponentMetrics>) => void> = [];
  private monitoring: boolean = false;

  /**
   * Start monitoring component performance
   */
  startMonitoring(): void {
    this.monitoring = true;
    console.log('Performance monitoring started');
  }

  /**
   * Stop monitoring component performance
   */
  stopMonitoring(): void {
    this.monitoring = false;
    console.log('Performance monitoring stopped');
  }

  /**
   * Record a component render time
   * 
   * @param componentName Name of the component being rendered
   * @param renderTime Time taken to render the component in ms
   */
  recordRender(componentName: string, renderTime: number): void {
    if (!this.monitoring || !componentName) return;
    
    const existingMetrics = this.componentMetrics.get(componentName) || {
      component_name: componentName,
      average_render_time: 0,
      total_renders: 0,
      slow_renders: 0,
      total_render_time: 0,
      max_render_time: 0,
      last_render_time: 0,
      created_at: new Date().toISOString()
    };
    
    // Update the metrics
    const newTotalRenders = existingMetrics.total_renders + 1;
    const newTotalRenderTime = existingMetrics.total_render_time + renderTime;
    
    this.componentMetrics.set(componentName, {
      ...existingMetrics,
      total_renders: newTotalRenders,
      total_render_time: newTotalRenderTime,
      average_render_time: newTotalRenderTime / newTotalRenders,
      slow_renders: renderTime > this.slowThreshold ? 
        (existingMetrics.slow_renders + 1) : existingMetrics.slow_renders,
      max_render_time: Math.max(renderTime, existingMetrics.max_render_time || 0),
      last_render_time: renderTime
    });

    // Notify any collectors
    if (this.collectors.length > 0) {
      this.collectors.forEach(collector => {
        try {
          collector(this.componentMetrics);
        } catch (e) {
          console.error('Error in performance metrics collector:', e);
        }
      });
    }
  }

  /**
   * Record multiple component render times in a batch
   * 
   * @param componentName Name of the component being rendered
   * @param renderTimes Array of render times in ms
   */
  recordRenderBatch(componentName: string, renderTimes: number[]): void {
    if (!this.monitoring || !componentName || !renderTimes.length) return;
    
    const totalTime = renderTimes.reduce((sum, time) => sum + time, 0);
    const avgTime = totalTime / renderTimes.length;
    const maxTime = Math.max(...renderTimes);
    const slowRenders = renderTimes.filter(time => time > this.slowThreshold).length;
    
    const existingMetrics = this.componentMetrics.get(componentName) || {
      component_name: componentName,
      average_render_time: 0,
      total_renders: 0,
      slow_renders: 0,
      total_render_time: 0,
      max_render_time: 0,
      last_render_time: 0,
      created_at: new Date().toISOString()
    };
    
    // Update the metrics
    const newTotalRenders = existingMetrics.total_renders + renderTimes.length;
    const newTotalRenderTime = existingMetrics.total_render_time + totalTime;
    
    this.componentMetrics.set(componentName, {
      ...existingMetrics,
      total_renders: newTotalRenders,
      total_render_time: newTotalRenderTime,
      average_render_time: newTotalRenderTime / newTotalRenders,
      slow_renders: existingMetrics.slow_renders + slowRenders,
      max_render_time: Math.max(maxTime, existingMetrics.max_render_time || 0),
      last_render_time: renderTimes[renderTimes.length - 1]
    });
  }

  /**
   * Record a component unmount event
   * 
   * @param componentName Name of the component being unmounted
   */
  recordUnmount(componentName: string): void {
    // Currently a no-op, but could be used to track component lifecycle
  }

  /**
   * Get metrics for a specific component
   * 
   * @param componentName Name of the component
   * @returns Component metrics or undefined if not found
   */
  getComponentMetrics(componentName: string): IComponentMetrics | undefined {
    return this.componentMetrics.get(componentName);
  }

  /**
   * Get all component metrics
   * 
   * @returns Map of all component metrics
   */
  getAllMetrics(): Map<string, IComponentMetrics> {
    return this.componentMetrics;
  }

  /**
   * Get the slowest components based on average render time
   * 
   * @param limit Maximum number of components to return
   * @returns Array of component metrics sorted by average render time (descending)
   */
  getSlowestComponents(limit: number = 5): IComponentMetrics[] {
    const metricsList = Array.from(this.componentMetrics.values());
    return metricsList
      .filter(metrics => metrics.total_renders > 2) // Require at least 3 renders for meaningful data
      .sort((a, b) => b.average_render_time - a.average_render_time)
      .slice(0, limit);
  }

  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.componentMetrics.clear();
  }

  /**
   * Clear metrics and reset performance monitoring
   */
  clearMetrics(): void {
    this.resetMetrics();
    console.log('Performance metrics cleared');
  }

  /**
   * Enable or disable performance reporting
   * 
   * @param enabled Whether reporting is enabled
   */
  setReportingEnabled(enabled: boolean): void {
    this.reportsEnabled = enabled;
  }

  /**
   * Subscribe to performance metrics updates
   * 
   * @param collector Function to call with updated metrics
   * @returns Unsubscribe function
   */
  subscribe(collector: (metrics: Map<string, IComponentMetrics>) => void): () => void {
    this.collectors.push(collector);
    return () => {
      const index = this.collectors.indexOf(collector);
      if (index > -1) {
        this.collectors.splice(index, 1);
      }
    };
  }

  /**
   * Report a slow render to analytics
   * 
   * @param componentName Component that rendered slowly
   * @param renderTime Render time in ms
   */
  reportSlowRender(componentName: string, renderTime: number): void {
    if (!this.reportsEnabled) return;
    
    // In a real app, this would send data to an analytics service
    console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms to render`);
  }
}

// Create and export a singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Also export the IComponentMetrics type to resolve type errors
export type { ComponentMetrics };
