
import { PerformanceMetric, ComponentMetrics } from '../performance/core/types';

class MetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics = new Map<string, ComponentMetrics>();
  private isEnabled: boolean = true;

  public trackComponentMetric(
    componentName: string, 
    metricName: string,
    value: number,
    type: 'render' | 'interaction' = 'render'
  ): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      component_name: componentName,
      metric_name: metricName,
      value,
      timestamp: Date.now(),
      category: type,
      type: type
    };

    this.metrics.push(metric);
    this.updateComponentMetrics(componentName, value, type);
  }

  private updateComponentMetrics(
    componentName: string,
    renderTime: number,
    type: 'render' | 'interaction'
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
      renderTimes: [...existing.renderTimes, renderTime],
      averageRenderTime: (existing.totalRenderTime + renderTime) / (existing.renderCount + 1),
      minRenderTime: Math.min(renderTime, existing.minRenderTime ?? renderTime),
      maxRenderTime: Math.max(renderTime, existing.maxRenderTime ?? renderTime)
    };

    this.componentMetrics.set(componentName, updated);
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getComponentMetrics(): Map<string, ComponentMetrics> {
    return new Map(this.componentMetrics);
  }

  public clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
  }
}

export const metricsCollector = new MetricsCollector();
export default metricsCollector;
