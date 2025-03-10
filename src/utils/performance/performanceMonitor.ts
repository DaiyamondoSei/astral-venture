
/**
 * Performance Monitoring Utility
 * 
 * This module provides utilities for tracking component render times and user interactions.
 * It supports batched reporting to minimize performance impact.
 */

import { metricsCollector } from './metricsCollector';
import { metricsReporter } from './metricsReporter';
import type { MetricType, ComponentMetrics } from './types';

/**
 * Centralized performance monitoring utility
 */
class PerformanceMonitor {
  private isEnabled: boolean = true;
  
  constructor() {
    // Initialize with default values
  }

  /**
   * Reset all collected metrics
   */
  public reset(): void {
    metricsCollector.reset();
  }

  /**
   * Configure performance monitoring settings
   */
  public configure(options: {
    batchSize?: number;
    slowThreshold?: number;
    enabled?: boolean;
  }): void {
    if (options.slowThreshold !== undefined) {
      metricsCollector.setSlowThreshold(options.slowThreshold);
    }
    
    if (options.enabled !== undefined) {
      this.isEnabled = options.enabled;
    }
    
    metricsReporter.configure({
      batchSize: options.batchSize,
      enabled: options.enabled
    });
  }

  /**
   * Add a component performance metric
   */
  public addComponentMetric(
    componentName: string,
    renderTime: number,
    type: MetricType = 'render'
  ): void {
    if (!this.isEnabled) return;
    metricsCollector.addComponentMetric(componentName, renderTime, type);
  }

  /**
   * Add a web vital metric
   */
  public addWebVital(
    name: string,
    value: number,
    category: 'interaction' | 'loading' | 'visual_stability'
  ): void {
    if (!this.isEnabled) return;
    metricsCollector.addWebVital(name, value, category);
  }

  /**
   * Get all collected metrics
   */
  public getMetrics(): Map<string, ComponentMetrics> {
    return metricsCollector.getMetrics();
  }

  /**
   * Get the slowest components
   */
  public getSlowestComponents(limit: number = 5): [string, ComponentMetrics][] {
    return metricsCollector.getSlowestComponents(limit);
  }

  /**
   * Subscribe to metrics updates
   */
  public subscribe(callback: (metrics: Map<string, ComponentMetrics>) => void): () => void {
    return metricsCollector.subscribe(callback);
  }

  /**
   * Report metrics immediately
   */
  public async reportNow(): Promise<boolean> {
    return metricsReporter.reportNow();
  }
}

// Create a singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export the singleton instance as the default export
export default performanceMonitor;

// Re-export the types for better type checking
export type { MetricType, ComponentMetrics };
