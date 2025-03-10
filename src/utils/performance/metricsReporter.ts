
/**
 * Performance Metrics Reporter
 * 
 * Handles reporting and persisting performance metrics to the server.
 */

import { supabase } from '@/lib/supabaseClient';
import { ComponentMetrics, WebVitalMetric, PerformanceMetric, DeviceInfo } from './types';

/**
 * Configuration for the metrics reporter
 */
interface MetricsReporterConfig {
  /** Whether metrics collection is enabled */
  enabled: boolean;
  
  /** How frequently to report batched metrics (in ms) */
  reportInterval: number;
  
  /** Maximum number of metrics to batch before sending */
  batchSize: number;
  
  /** Sampling rate for metrics (0.0 to 1.0) */
  samplingRate: number;
}

/**
 * Class for reporting performance metrics to the server
 */
class MetricsReporter {
  private config: MetricsReporterConfig;
  private isReporting: boolean = false;
  private pendingMetrics: PerformanceMetric[] = [];
  private pendingVitals: WebVitalMetric[] = [];
  private reportTimer: NodeJS.Timeout | null = null;
  private deviceInfo: DeviceInfo;
  
  constructor(config?: Partial<MetricsReporterConfig>) {
    // Default configuration
    this.config = {
      enabled: true,
      reportInterval: 60000, // 1 minute
      batchSize: 10,
      samplingRate: 0.1, // Only record 10% of metrics
      ...config
    };
    
    // Get device info
    this.deviceInfo = this.getDeviceInfo();
    
    // Start reporting timer if enabled
    if (this.config.enabled) {
      this.startReportingTimer();
    }
  }
  
  /**
   * Add a component metric to the queue
   */
  public addComponentMetric(metric: ComponentMetrics): void {
    if (!this.config.enabled || !this.shouldSample()) {
      return;
    }
    
    // Transform ComponentMetrics to PerformanceMetric
    const performanceMetric: PerformanceMetric = {
      component_name: metric.componentName,
      average_render_time: metric.averageRenderTime,
      total_renders: metric.renderCount,
      slow_renders: metric.slowRenderCount,
      created_at: new Date().toISOString(),
      metric_type: metric.metricType,
      device_info: this.deviceInfo,
      metric_data: {
        renderTimes: metric.renderTimes,
        maxRenderTime: metric.maxRenderTime,
        minRenderTime: metric.minRenderTime,
        lastRenderTime: metric.lastRenderTime
      }
    };
    
    // Add to pending metrics
    this.pendingMetrics.push(performanceMetric);
    
    // Report immediately if batch size is reached
    if (this.pendingMetrics.length >= this.config.batchSize) {
      this.reportMetrics();
    }
  }
  
  /**
   * Add a Web Vitals metric to the queue
   */
  public addWebVital(metric: WebVitalMetric): void {
    if (!this.config.enabled) {
      return;
    }
    
    // Always report Core Web Vitals
    this.pendingVitals.push(metric);
    
    // Report immediately if batch size is reached
    if (this.pendingVitals.length >= this.config.batchSize) {
      this.reportWebVitals();
    }
  }
  
  /**
   * Report all pending metrics to the server
   */
  public async reportMetrics(): Promise<boolean> {
    if (this.isReporting || this.pendingMetrics.length === 0) {
      return false;
    }
    
    this.isReporting = true;
    
    try {
      // Get metrics to report
      const metricsToReport = [...this.pendingMetrics];
      this.pendingMetrics = [];
      
      // Get user ID if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      // Add user ID to metrics if available
      if (userId) {
        metricsToReport.forEach(metric => metric.user_id = userId);
      }
      
      // Insert into database
      const { error } = await supabase
        .from('performance_metrics')
        .insert(metricsToReport);
      
      if (error) {
        console.error('Error reporting metrics:', error);
        // Put metrics back in queue
        this.pendingMetrics = [...metricsToReport, ...this.pendingMetrics];
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in reportMetrics:', error);
      return false;
    } finally {
      this.isReporting = false;
    }
  }
  
  /**
   * Report all pending Web Vitals to the server
   */
  private async reportWebVitals(): Promise<boolean> {
    if (this.pendingVitals.length === 0) {
      return false;
    }
    
    try {
      // Get vitals to report
      const vitalsToReport = [...this.pendingVitals];
      this.pendingVitals = [];
      
      // Get user ID if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      // Create payload
      const webVitalsToInsert = vitalsToReport.map(vital => ({
        name: vital.name,
        value: vital.value,
        category: vital.category,
        timestamp: new Date(vital.timestamp).toISOString(),
        user_id: userId || null,
        device_info: this.deviceInfo
      }));
      
      // Insert into database
      const { error } = await supabase
        .from('web_vitals')
        .insert(webVitalsToInsert);
      
      if (error) {
        console.error('Error reporting web vitals:', error);
        // Put vitals back in queue
        this.pendingVitals = [...vitalsToReport, ...this.pendingVitals];
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in reportWebVitals:', error);
      return false;
    }
  }
  
  /**
   * Enable or disable metrics collection
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    
    if (enabled && !this.reportTimer) {
      this.startReportingTimer();
    } else if (!enabled && this.reportTimer) {
      this.stopReportingTimer();
    }
  }
  
  /**
   * Start the reporting timer
   */
  private startReportingTimer(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }
    
    this.reportTimer = setInterval(() => {
      this.reportMetrics();
      this.reportWebVitals();
    }, this.config.reportInterval);
  }
  
  /**
   * Stop the reporting timer
   */
  private stopReportingTimer(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
  }
  
  /**
   * Clean up when the component is unmounted
   */
  public dispose(): void {
    this.stopReportingTimer();
    
    // Report any remaining metrics
    if (this.pendingMetrics.length > 0 || this.pendingVitals.length > 0) {
      this.reportMetrics();
      this.reportWebVitals();
    }
  }
  
  /**
   * Determine if we should sample this metric based on sampling rate
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.samplingRate;
  }
  
  /**
   * Get information about the user's device
   */
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    let deviceCategory: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';
    
    // Simple device detection
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      if (/iPad|TabletPC/i.test(userAgent) || 
          (navigator.maxTouchPoints > 0 && screen.width > 768)) {
        deviceCategory = 'tablet';
      } else {
        deviceCategory = 'mobile';
      }
    } else {
      deviceCategory = 'desktop';
    }
    
    return {
      userAgent,
      deviceCategory
    };
  }
}

// Create a singleton instance
const metricsReporter = new MetricsReporter();

export default metricsReporter;
