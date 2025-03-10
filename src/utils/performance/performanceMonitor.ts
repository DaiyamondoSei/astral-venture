
/**
 * Performance Monitor
 * 
 * Centralized performance monitoring system that tracks
 * component render times, web vitals, and other performance metrics.
 */

import { ComponentMetrics, MetricType, WebVitalCategory, WebVitalMetric, PerformanceMetric } from './types';
import { invokeEdgeFunction } from '../edgeFunctionHelper';
import { supabase } from '@/lib/supabaseClient';

class PerformanceMonitor {
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private webVitals: Map<string, WebVitalMetric> = new Map();
  private metricsQueue: PerformanceMetric[] = [];
  private lastReportTime: number = Date.now();
  private flushInterval: number = 60000; // 1 minute default
  private reportInProgress: boolean = false;
  private isEnabled: boolean = true;
  private slowThreshold: number = 16; // 16ms is ~60fps

  constructor() {
    // Set up periodic flushing of metrics
    if (typeof window !== 'undefined') {
      setInterval(() => this.flushMetricsQueue(), this.flushInterval);
      
      // Flush metrics when page is hidden
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flushMetricsQueue();
        }
      });
      
      // Flush metrics before page unload
      window.addEventListener('beforeunload', () => {
        this.flushMetricsQueue(true);
      });
    }
  }

  /**
   * Add a component render metric
   */
  public addComponentMetric(
    componentName: string, 
    renderTime: number, 
    type: MetricType = 'render'
  ): void {
    if (!this.isEnabled) return;
    
    // Skip if render time is abnormally high (likely a measurement error)
    if (renderTime > 10000) return;

    const existingMetrics = this.componentMetrics.get(componentName) || {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      slowRenders: 0,
      lastRenderTime: 0,
      timestamps: []
    };

    const updatedMetrics: ComponentMetrics = {
      ...existingMetrics,
      renderCount: existingMetrics.renderCount + 1,
      totalRenderTime: existingMetrics.totalRenderTime + renderTime,
      lastRenderTime: renderTime,
      slowRenders: 
        renderTime > this.slowThreshold 
          ? existingMetrics.slowRenders + 1 
          : existingMetrics.slowRenders
    };
    
    updatedMetrics.averageRenderTime = 
      updatedMetrics.totalRenderTime / updatedMetrics.renderCount;
    
    // Store limited number of timestamps for analysis
    if (updatedMetrics.timestamps) {
      updatedMetrics.timestamps.push(Date.now());
      if (updatedMetrics.timestamps.length > 50) {
        updatedMetrics.timestamps.shift();
      }
    }
    
    this.componentMetrics.set(componentName, updatedMetrics);
    
    // Queue metric for reporting
    this.queueMetric({
      component_name: componentName,
      metric_name: type === 'render' ? 'render_time' : `${type}_time`,
      value: renderTime,
      category: type,
      timestamp: new Date().toISOString(),
      type: 'component',
      page_url: typeof window !== 'undefined' ? window.location.pathname : undefined
    });
  }

  /**
   * Add a web vital metric
   */
  public addWebVital(
    name: string, 
    value: number, 
    category: WebVitalCategory
  ): void {
    if (!this.isEnabled) return;
    
    const metric: WebVitalMetric = {
      name,
      value,
      timestamp: Date.now(),
      category
    };
    
    this.webVitals.set(name, metric);
    
    // Queue metric for reporting
    this.queueMetric({
      metric_name: name,
      value,
      category,
      timestamp: new Date().toISOString(),
      type: 'web_vital',
      page_url: typeof window !== 'undefined' ? window.location.pathname : undefined
    });
  }

  /**
   * Get all component metrics
   */
  public getComponentMetrics(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values());
  }

  /**
   * Get all web vitals metrics
   */
  public getWebVitals(): Map<string, WebVitalMetric> {
    return this.webVitals;
  }

  /**
   * Get specific component metrics
   */
  public getComponentMetricsByName(componentName: string): ComponentMetrics | undefined {
    return this.componentMetrics.get(componentName);
  }

  /**
   * Clear all metrics (useful for testing or after navigation)
   */
  public clearMetrics(): void {
    this.componentMetrics.clear();
    this.webVitals.clear();
    this.metricsQueue = [];
  }

  /**
   * Enable or disable performance monitoring
   */
  public setEnabled(isEnabled: boolean): void {
    this.isEnabled = isEnabled;
  }

  /**
   * Set slow render threshold in milliseconds
   */
  public setSlowThreshold(threshold: number): void {
    this.slowThreshold = threshold;
  }

  /**
   * Set how often metrics are automatically reported
   */
  public setFlushInterval(intervalMs: number): void {
    this.flushInterval = intervalMs;
  }
  
  /**
   * Get current performance summary
   */
  public getPerformanceSummary() {
    const webVitals = this.getWebVitalsObject();
    const components = this.getComponentMetricsObject();
    
    return {
      webVitals,
      components,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Queue a metric for reporting to the server
   */
  private queueMetric(metric: PerformanceMetric): void {
    this.metricsQueue.push(metric);
    
    // Flush if queue exceeds threshold
    if (this.metricsQueue.length > 100) {
      this.flushMetricsQueue();
    }
  }
  
  /**
   * Send metrics to the server
   */
  public async flushMetricsQueue(immediate: boolean = false): Promise<void> {
    if (this.reportInProgress || this.metricsQueue.length === 0) return;
    
    // Don't report if reported recently (unless immediate is true)
    const timeSinceLastReport = Date.now() - this.lastReportTime;
    if (!immediate && timeSinceLastReport < 10000) {
      return;
    }
    
    this.reportInProgress = true;
    const metricsToSend = [...this.metricsQueue];
    this.metricsQueue = [];
    
    try {
      await this.reportMetrics(metricsToSend);
      this.lastReportTime = Date.now();
    } catch (error) {
      console.error('Error reporting performance metrics:', error);
      
      // Put the metrics back in the queue
      this.metricsQueue = [...metricsToSend, ...this.metricsQueue];
    } finally {
      this.reportInProgress = false;
    }
  }
  
  /**
   * Report metrics to the server
   */
  private async reportMetrics(metrics: PerformanceMetric[]): Promise<void> {
    try {
      if (metrics.length === 0) return;
      
      // Try to use the edge function
      await invokeEdgeFunction('track-performance', { 
        metrics,
        summary: this.getPerformanceSummary()
      });
    } catch (error) {
      // Fallback to direct database insert if supported
      if (supabase) {
        try {
          const { error: insertError } = await supabase
            .from('performance_metrics')
            .insert(metrics);
            
          if (insertError) {
            throw insertError;
          }
        } catch (dbError) {
          console.error('Error reporting metrics to database:', dbError);
          throw dbError;
        }
      } else {
        console.error('Performance metrics reporting failed:', error);
        throw error;
      }
    }
  }
  
  /**
   * Report metrics immediately
   */
  public async reportNow(): Promise<boolean> {
    try {
      await this.flushMetricsQueue(true);
      return true;
    } catch (error) {
      console.error('Failed to report metrics:', error);
      return false;
    }
  }
  
  /**
   * Get Web Vitals in object format
   */
  private getWebVitalsObject() {
    return {
      fcp: this.webVitals.get('FCP')?.value || 0,
      lcp: this.webVitals.get('LCP')?.value || 0,
      cls: this.webVitals.get('CLS')?.value || 0,
      fid: this.webVitals.get('FID')?.value || 0,
      ttfb: this.webVitals.get('TTFB')?.value || 0,
      inp: this.webVitals.get('INP')?.value || 0
    };
  }
  
  /**
   * Get Component Metrics in object format
   */
  private getComponentMetricsObject() {
    const metrics = Array.from(this.componentMetrics.values());
    
    // Calculate overall component metrics
    const totalComponents = metrics.length;
    const totalRenderTime = metrics.reduce((sum, m) => sum + m.totalRenderTime, 0);
    const totalRenders = metrics.reduce((sum, m) => sum + m.renderCount, 0);
    const slowComponents = metrics.filter(m => m.slowRenders > 0).length;
    
    return {
      totalComponents,
      avgRenderTime: totalRenders > 0 ? totalRenderTime / totalRenders : 0,
      slowComponents,
      totalRenders
    };
  }
}

// Export singleton instance
export default new PerformanceMonitor();
