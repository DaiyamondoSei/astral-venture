
/**
 * Performance Metrics Reporter
 * 
 * This module handles reporting collected metrics to the server.
 */

import { supabase } from '@/lib/supabaseClient';
import type { ComponentMetrics, PerformanceReportPayload } from './types';
import { metricsCollector } from './metricsCollector';

export class MetricsReporter {
  private isEnabled: boolean = true;
  private batchSize: number = 10;

  constructor() {}

  public configure(options: {
    batchSize?: number;
    enabled?: boolean;
  }): void {
    if (options.batchSize !== undefined) this.batchSize = options.batchSize;
    if (options.enabled !== undefined) this.isEnabled = options.enabled;
  }

  public async reportNow(): Promise<boolean> {
    if (!this.isEnabled) return false;
    
    const metrics = metricsCollector.getMetrics();
    const webVitals = metricsCollector.getWebVitals();
    
    if (metrics.size === 0 && webVitals.length === 0) return false;
    
    try {
      // Create metrics data for server
      const payload: PerformanceReportPayload = {
        metrics: Array.from(metrics.entries())
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
          })
      };
      
      // Include web vitals if available
      if (webVitals.length > 0) {
        payload.web_vitals = webVitals.map(vital => ({
          name: vital.name,
          value: vital.value,
          category: vital.category,
          client_timestamp: new Date(vital.timestamp).toISOString()
        }));
      }
      
      // Call RPC function to ensure the performance_metrics table exists
      try {
        await supabase.rpc('ensure_performance_metrics_table');
      } catch (err) {
        console.warn('Performance metrics table initialization skipped:', err);
        // Continue even if RPC fails, the table might already exist
      }
      
      // Call the edge function to track performance data
      const { error } = await supabase.functions.invoke('track-performance', {
        body: payload
      });
      
      if (error) {
        console.error('Error reporting performance metrics:', error);
        return false;
      }
      
      // Clear reported web vitals
      // Note: We don't clear component metrics since they accumulate
      metricsCollector.getWebVitals().length = 0;
      
      return true;
    } catch (error) {
      console.error('Failed to report performance metrics:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const metricsReporter = new MetricsReporter();

export default metricsReporter;
