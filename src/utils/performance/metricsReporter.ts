
/**
 * Performance Metrics Reporter
 * 
 * Handles reporting performance metrics to backend storage and analytics.
 */

import { metricsCollector } from './metricsCollector';
import { supabase } from '@/lib/supabaseClient';
import type { ComponentMetrics } from './types';

interface MetricsReporterConfig {
  batchSize?: number;
  reportInterval?: number;
  enabled?: boolean;
  autoReport?: boolean;
}

class MetricsReporter {
  private batchSize: number = 50;
  private reportInterval: number = 60000; // 1 minute
  private enabled: boolean = true;
  private autoReport: boolean = false;
  private intervalId: number | null = null;
  private lastReportTime: number = 0;
  private pendingReport: boolean = false;
  
  constructor() {
    // Start auto-reporting if configured
    this.setupAutoReporting();
  }
  
  /**
   * Configure the metrics reporter
   */
  public configure(config: MetricsReporterConfig): void {
    if (config.batchSize !== undefined) {
      this.batchSize = Math.max(1, config.batchSize);
    }
    
    if (config.reportInterval !== undefined) {
      this.reportInterval = Math.max(5000, config.reportInterval);
    }
    
    if (config.enabled !== undefined) {
      this.enabled = config.enabled;
    }
    
    if (config.autoReport !== undefined) {
      this.autoReport = config.autoReport;
      this.setupAutoReporting();
    }
  }
  
  /**
   * Set up automatic reporting based on configured interval
   */
  private setupAutoReporting(): void {
    // Clear any existing interval
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Set up new interval if auto-reporting is enabled
    if (this.autoReport && this.enabled) {
      this.intervalId = window.setInterval(() => {
        this.reportNow();
      }, this.reportInterval);
    }
  }
  
  /**
   * Report metrics to the backend immediately
   */
  public async reportNow(): Promise<boolean> {
    if (!this.enabled || this.pendingReport) {
      return false;
    }
    
    // Check if there are any metrics to report
    const metrics = metricsCollector.getMetrics();
    if (metrics.size === 0) {
      return false;
    }
    
    // Ensure performance metrics table exists
    await this.ensurePerformanceMetricsTable();
    
    this.pendingReport = true;
    
    try {
      // Gather metrics to report
      const metricsToReport = this.prepareMetricsForReporting(metrics);
      
      if (metricsToReport.length === 0) {
        this.pendingReport = false;
        return false;
      }
      
      // Send metrics in batches
      const result = await this.sendMetricsBatch(metricsToReport);
      
      this.lastReportTime = Date.now();
      this.pendingReport = false;
      
      return result;
    } catch (error) {
      console.error('Error reporting metrics:', error);
      this.pendingReport = false;
      return false;
    }
  }
  
  /**
   * Ensure the performance_metrics table exists in the database
   */
  private async ensurePerformanceMetricsTable(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc(
        'ensure_performance_metrics_table',
        {}
      );
      
      if (error) {
        console.error('Error ensuring performance metrics table:', error);
        return false;
      }
      
      return data as boolean;
    } catch (error) {
      console.error('Error calling ensure_performance_metrics_table:', error);
      return false;
    }
  }
  
  /**
   * Prepare metrics for reporting by converting to an array of records
   */
  private prepareMetricsForReporting(metrics: Map<string, ComponentMetrics>): any[] {
    const metricsArray: any[] = [];
    const userId = supabase.auth.getUser() || null;
    const now = new Date().toISOString();
    
    // Convert metrics map to array of records
    metrics.forEach(metric => {
      // Only report metrics with at least 5 renders
      if (metric.renderCount < 5) {
        return;
      }
      
      metricsArray.push({
        component_name: metric.componentName,
        average_render_time: metric.averageRenderTime,
        total_renders: metric.renderCount,
        slow_renders: metric.slowRenderCount,
        max_render_time: metric.maxRenderTime,
        min_render_time: metric.minRenderTime,
        collected_at: now,
        user_id: userId?.id || null,
        metric_type: metric.metricType || 'render',
        context: {
          last_render_time: metric.lastRenderTime,
          created_at: new Date(metric.createdAt).toISOString(),
          last_updated: new Date(metric.lastUpdated).toISOString(),
          environment: process.env.NODE_ENV || 'unknown',
          browser: navigator.userAgent
        }
      });
    });
    
    return metricsArray;
  }
  
  /**
   * Send a batch of metrics to the backend
   */
  private async sendMetricsBatch(metrics: any[]): Promise<boolean> {
    if (metrics.length === 0) {
      return false;
    }
    
    try {
      // Send metrics in batches to avoid large payloads
      const batches = [];
      for (let i = 0; i < metrics.length; i += this.batchSize) {
        const batch = metrics.slice(i, i + this.batchSize);
        batches.push(batch);
      }
      
      // Process each batch
      for (const batch of batches) {
        const { error } = await supabase
          .from('performance_metrics')
          .insert(batch);
        
        if (error) {
          console.error('Error inserting performance metrics:', error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error sending metrics batch:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const metricsReporter = new MetricsReporter();

// Export the singleton instance as the default export
export default metricsReporter;
