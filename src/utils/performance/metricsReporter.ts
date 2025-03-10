
/**
 * Performance Metrics Reporter
 * 
 * Reports performance metrics to the server for analytics
 */

import { ComponentMetrics, DeviceInfo, PerformanceReportPayload, WebVitalMetric } from './types';
import { supabase } from '@/lib/supabaseClient';

/**
 * Determines device category based on user agent
 */
function getDeviceCategory(userAgent: string): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  const ua = userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return 'mobile';
  }
  
  if (/Macintosh|Windows|Linux|Mac OS|X11/.test(ua)) {
    return 'desktop';
  }
  
  return 'unknown';
}

/**
 * Gets device information
 */
function getDeviceInfo(): DeviceInfo {
  if (typeof navigator === 'undefined') {
    return {
      userAgent: 'unknown',
      deviceCategory: 'unknown'
    };
  }
  
  const userAgent = navigator.userAgent;
  const deviceCategory = getDeviceCategory(userAgent);
  
  return {
    userAgent,
    deviceCategory
  };
}

class MetricsReporter {
  private componentMetricsQueue: ComponentMetrics[] = [];
  private webVitalsQueue: WebVitalMetric[] = [];
  private enabled = true;
  private debounceTimeout: number | null = null;
  private lastReportTime = 0;
  private reportInterval = 30000; // 30 seconds
  
  constructor() {
    if (typeof window !== 'undefined') {
      // Report metrics when the page is about to unload
      window.addEventListener('beforeunload', () => {
        if (this.enabled && (this.componentMetricsQueue.length > 0 || this.webVitalsQueue.length > 0)) {
          this.reportMetrics();
        }
      });
      
      // Set up periodic reporting
      setInterval(() => {
        if (this.enabled && (this.componentMetricsQueue.length > 0 || this.webVitalsQueue.length > 0)) {
          this.reportMetrics();
        }
      }, this.reportInterval);
    }
  }
  
  /**
   * Add a component metric to the queue
   */
  public addComponentMetric(metric: ComponentMetrics): void {
    if (!this.enabled) return;
    
    this.componentMetricsQueue.push(metric);
    this.debouncedReport();
  }
  
  /**
   * Add a Web Vital metric to the queue
   */
  public addWebVital(
    name: string,
    value: number,
    category: 'interaction' | 'loading' | 'visual_stability'
  ): void {
    if (!this.enabled) return;
    
    const webVital: WebVitalMetric = {
      name,
      value,
      timestamp: Date.now(),
      category
    };
    
    this.webVitalsQueue.push(webVital);
    this.debouncedReport();
  }
  
  /**
   * Set whether metrics collection is enabled
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Debounce the report to avoid too many requests
   */
  private debouncedReport(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    this.debounceTimeout = window.setTimeout(() => {
      this.reportMetrics();
    }, 5000); // Debounce for 5 seconds
  }
  
  /**
   * Report metrics to the server
   */
  public async reportMetrics(): Promise<boolean> {
    if (!this.enabled) return false;
    
    // Skip if no metrics to report
    if (this.componentMetricsQueue.length === 0 && this.webVitalsQueue.length === 0) {
      return false;
    }
    
    // Skip if we reported recently
    const now = Date.now();
    if (now - this.lastReportTime < 5000) {
      return false; // Throttle to once every 5 seconds
    }
    
    this.lastReportTime = now;
    
    try {
      const userId = supabase.auth.getUser()
        .then(response => response?.data?.user?.id)
        .catch(() => null);
      
      const payload: PerformanceReportPayload = {
        componentMetrics: [...this.componentMetricsQueue],
        webVitals: [...this.webVitalsQueue],
        deviceInfo: getDeviceInfo(),
        timestamp: new Date().toISOString(),
        userId: await userId
      };
      
      // Empty the queues
      this.componentMetricsQueue = [];
      this.webVitalsQueue = [];
      
      // Submit metrics to Supabase
      for (const metric of payload.componentMetrics) {
        await supabase.from('performance_metrics').insert({
          component_name: metric.componentName,
          average_render_time: metric.averageRenderTime,
          total_renders: metric.renderCount,
          slow_renders: metric.slowRenderCount,
          metric_type: metric.metricType,
          user_id: payload.userId,
          metric_data: {
            maxRenderTime: metric.maxRenderTime,
            minRenderTime: metric.minRenderTime,
            renderTimes: metric.renderTimes,
            lastRenderTime: metric.lastRenderTime
          },
          device_info: payload.deviceInfo
        });
      }
      
      // Submit web vitals to Supabase
      for (const vital of payload.webVitals) {
        await supabase.from('web_vitals').insert({
          name: vital.name,
          value: vital.value,
          category: vital.category,
          user_id: payload.userId,
          device_info: payload.deviceInfo
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to report performance metrics:', error);
      
      // Put the metrics back in the queue for next time
      this.componentMetricsQueue = [...payload.componentMetrics, ...this.componentMetricsQueue];
      this.webVitalsQueue = [...payload.webVitals, ...this.webVitalsQueue];
      
      return false;
    }
  }
  
  /**
   * Clean up any resources
   */
  public dispose(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    // Attempt to report any remaining metrics
    if (this.componentMetricsQueue.length > 0 || this.webVitalsQueue.length > 0) {
      this.reportMetrics();
    }
  }
}

// Create a singleton instance
const metricsReporter = new MetricsReporter();

export default metricsReporter;
