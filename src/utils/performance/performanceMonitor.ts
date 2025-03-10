
/**
 * Performance Monitoring Utility
 * 
 * This module provides utilities for tracking component render times and user interactions.
 * It supports batched reporting to minimize performance impact.
 */

import { metricsCollector } from './metricsCollector';
import { metricsReporter } from './metricsReporter';
import type { MetricType, ComponentMetrics } from './types';

class PerformanceMonitor {
  private isEnabled: boolean = true;
  
  constructor() {
    // Initialize with default values
  }

  public reset(): void {
    metricsCollector.reset();
  }

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

  public addComponentMetric(
    componentName: string,
    renderTime: number,
    type: MetricType = 'render'
  ): void {
    if (!this.isEnabled) return;
    metricsCollector.addComponentMetric(componentName, renderTime, type);
  }

  public addWebVital(
    name: string,
    value: number,
    category: 'interaction' | 'loading' | 'visual_stability'
  ): void {
    if (!this.isEnabled) return;
    metricsCollector.addWebVital(name, value, category);
  }

  public getMetrics(): Map<string, ComponentMetrics> {
    return metricsCollector.getMetrics();
  }

  public getSlowestComponents(limit: number = 5): [string, ComponentMetrics][] {
    return metricsCollector.getSlowestComponents(limit);
  }

  public subscribe(callback: (metrics: Map<string, ComponentMetrics>) => void): () => void {
    return metricsCollector.subscribe(callback);
  }

  public async reportNow(): Promise<boolean> {
    return metricsReporter.reportNow();
  }
}

// Create a singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export the types for better type checking
export type { MetricType, ComponentMetrics };

// Default export for the singleton
export default performanceMonitor;
