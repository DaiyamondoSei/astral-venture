
/**
 * Performance Monitoring Utility
 * 
 * This module provides utilities for tracking component render times and user interactions.
 * It supports batched reporting to minimize performance impact.
 */

import { supabase } from '@/lib/supabaseClient';

export type MetricType = 'render' | 'load' | 'interaction';

export interface ComponentMetric {
  componentName: string;
  renderTime: number;
  timestamp: number;
  type: MetricType;
}

export interface ComponentMetrics {
  totalRenders: number;
  slowRenders: number;
  totalRenderTime: number;
  firstRenderTime: number | null;
  lastRenderTime: number;
  metrics: ComponentMetric[];
}

export interface WebVitalMetric {
  name: string;
  value: number;
  category: 'interaction' | 'loading' | 'visual_stability';
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics> = new Map();
  private webVitals: WebVitalMetric[] = [];
  private batchSize: number = 10;
  private slowThreshold: number = 16; // 16ms = 60fps
  private isEnabled: boolean = true;
  private subscribers: Set<(metrics: Map<string, ComponentMetrics>) => void> = new Set();

  constructor() {
    // Initialize with default values
    this.reset();
  }

  public reset(): void {
    this.metrics = new Map();
    this.webVitals = [];
  }

  public configure(options: {
    batchSize?: number;
    slowThreshold?: number;
    enabled?: boolean;
  }): void {
    if (options.batchSize !== undefined) this.batchSize = options.batchSize;
    if (options.slowThreshold !== undefined) this.slowThreshold = options.slowThreshold;
    if (options.enabled !== undefined) this.isEnabled = options.enabled;
  }

  public addComponentMetric(
    componentName: string,
    renderTime: number,
    type: MetricType = 'render'
  ): void {
    if (!this.isEnabled) return;

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
    if (!this.isEnabled) return;
    
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

  public subscribe(callback: (metrics: Map<string, ComponentMetrics>) => void): () => void {
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

  public async reportNow(): Promise<boolean> {
    if (!this.isEnabled || this.metrics.size === 0) return false;
    
    try {
      // Create metrics data for server
      const componentsToReport = Array.from(this.metrics.entries())
        .map(([componentName, metrics]) => {
          const averageRenderTime = metrics.totalRenderTime / metrics.totalRenders;
          
          return {
            component_name: componentName,
            average_render_time: averageRenderTime,
            total_renders: metrics.totalRenders,
            slow_renders: metrics.slowRenders,
            first_render_time: metrics.firstRenderTime,
            client_timestamp: new Date().toISOString()
          };
        });
      
      // Call RPC function to ensure the performance_metrics table exists
      try {
        await supabase.rpc('ensure_performance_metrics_table');
      } catch (err) {
        console.warn('Performance metrics table initialization skipped:', err);
        // Continue even if RPC fails, the table might already exist
      }
      
      // Call the edge function to track performance data
      const { error } = await supabase.functions.invoke('track-performance', {
        body: { metrics: componentsToReport }
      });
      
      if (error) {
        console.error('Error reporting performance metrics:', error);
        return false;
      }
      
      // Report web vitals if available
      if (this.webVitals.length > 0) {
        const vitalsToReport = this.webVitals.map(vital => ({
          name: vital.name,
          value: vital.value,
          category: vital.category,
          client_timestamp: new Date(vital.timestamp).toISOString()
        }));
        
        await supabase.functions.invoke('track-performance', {
          body: { web_vitals: vitalsToReport }
        });
        
        // Clear reported web vitals
        this.webVitals = [];
      }
      
      return true;
    } catch (error) {
      console.error('Failed to report performance metrics:', error);
      return false;
    }
  }
}

// Create a singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
