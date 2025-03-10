
import type { ComponentMetrics } from '@/services/ai/types';

/**
 * Interface for component performance metrics
 */
export interface IComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowRenderCount: number;
}

/**
 * Performance monitoring service for tracking component render times and metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, IComponentMetrics> = new Map();
  private readonly slowRenderThreshold: number = 16; // 1 frame at 60fps

  recordRender(componentName: string, renderTime: number): void {
    const metric = this.metrics.get(componentName) || {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      slowRenderCount: 0
    };

    metric.renderCount++;
    metric.totalRenderTime += renderTime;
    metric.averageRenderTime = metric.totalRenderTime / metric.renderCount;
    metric.lastRenderTime = renderTime;

    if (renderTime > this.slowRenderThreshold) {
      metric.slowRenderCount++;
    }

    this.metrics.set(componentName, metric);
  }

  recordRenderBatch(componentName: string, renderTimes: number[]): void {
    renderTimes.forEach(time => this.recordRender(componentName, time));
  }

  getComponentMetrics(componentName: string): IComponentMetrics | undefined {
    return this.metrics.get(componentName);
  }

  getAllMetrics(): IComponentMetrics[] {
    return Array.from(this.metrics.values());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  reportSlowRender(componentName: string, renderTime: number): void {
    console.warn(
      `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
    );
  }

  recordUnmount(componentName: string): void {
    this.metrics.delete(componentName);
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Default export
export default performanceMonitor;
