/**
 * Performance Metrics Collector
 * 
 * This module handles the collection of performance metrics from components.
 */

import type { ComponentMetric, ComponentMetrics, MetricType, MetricsSubscriber, WebVitalMetric } from './types';

export class MetricsCollector {
  private metrics: Map<string, ComponentMetrics> = new Map();
  private webVitals: WebVitalMetric[] = [];
  private slowThreshold: number = 16; // 16ms = 60fps
  private subscribers: Set<MetricsSubscriber> = new Set();

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.metrics = new Map();
    this.webVitals = [];
  }

  public setSlowThreshold(threshold: number): void {
    this.slowThreshold = threshold;
  }

  public addComponentMetric(
    componentName: string,
    renderTime: number,
    type: MetricType = 'render'
  ): void {
    const timestamp = Date.now();
    const metric: ComponentMetric = {
      componentName,
      renderTime,
      timestamp,
      type
    };

    const existingMetrics = this.metrics.get(componentName) || {
      totalRenders: 0,
      slowRenders: 0,
      totalRenderTime: 0,
      firstRenderTime: null,
      lastRenderTime: timestamp,
      metrics: []
    };

    existingMetrics.totalRenders += 1;
    existingMetrics.totalRenderTime += renderTime;
    existingMetrics.lastRenderTime = timestamp;
    
    if (renderTime > this.slowThreshold) {
      existingMetrics.slowRenders += 1;
    }
    
    if (existingMetrics.firstRenderTime === null) {
      existingMetrics.firstRenderTime = renderTime;
    }
    
    existingMetrics.metrics.push(metric);
    
    // Keep only the most recent metrics to avoid memory leaks
    if (existingMetrics.metrics.length > 20) {
      existingMetrics.metrics = existingMetrics.metrics.slice(-20);
    }
    
    this.metrics.set(componentName, existingMetrics);
    
    // Notify subscribers
    this.notifySubscribers();
  }

  public addWebVital(
    name: string,
    value: number,
    category: 'interaction' | 'loading' | 'visual_stability'
  ): void {
    this.webVitals.push({
      name,
      value,
      category,
      timestamp: Date.now()
    });
    
    // Keep only recent web vitals
    if (this.webVitals.length > 50) {
      this.webVitals = this.webVitals.slice(-50);
    }
  }

  public getMetrics(): Map<string, ComponentMetrics> {
    return new Map(this.metrics);
  }

  public getWebVitals(): WebVitalMetric[] {
    return [...this.webVitals];
  }

  public getSlowestComponents(limit: number = 5): [string, ComponentMetrics][] {
    const metricsArray = Array.from(this.metrics.entries());
    return metricsArray
      .sort((a, b) => {
        const aAvg = a[1].totalRenderTime / a[1].totalRenders;
        const bAvg = b[1].totalRenderTime / b[1].totalRenders;
        return bAvg - aAvg;
      })
      .slice(0, limit);
  }

  public subscribe(callback: MetricsSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(this.metrics);
      } catch (error) {
        console.error('Error in performance metrics subscriber:', error);
      }
    }
  }
}

// Create a singleton instance
export const metricsCollector = new MetricsCollector();

export default metricsCollector;
