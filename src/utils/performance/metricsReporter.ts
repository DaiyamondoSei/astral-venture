
/**
 * Performance Metrics Reporter
 * 
 * Collects and reports performance metrics to the server
 */

import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import type { 
  ComponentMetrics, 
  PerformanceMetric, 
  WebVitalMetric,
  DeviceInfo
} from './types';

class MetricsReporter {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitalMetric[] = [];
  private deviceInfo: Partial<DeviceInfo> = {};
  private bufferSize = 10;
  private autoReportInterval = 60000; // 1 minute
  private intervalId: number | null = null;
  private lastReportTime = 0;
  private reportInProgress = false;
  private enabled = true;
  private immediateReportThreshold = 20; // Report immediately if we have this many metrics

  constructor() {
    this.initDeviceInfo();
    this.startAutoReporting();
  }

  /**
   * Initialize device info data
   */
  private initDeviceInfo() {
    if (typeof window === 'undefined') return;

    try {
      // Get browser and OS information
      const userAgent = navigator.userAgent;
      let deviceType = 'unknown';
      
      if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
        deviceType = 'mobile';
      } else if (/Tablet|iPad/i.test(userAgent)) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop';
      }

      // Get additional device info
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const connectionType = (navigator as any).connection?.effectiveType || 'unknown';

      // Store device info
      this.deviceInfo = {
        deviceType,
        screenResolution: `${screenWidth}x${screenHeight}`,
        connectionType,
        browser: this.getBrowserInfo(userAgent),
        os: this.getOSInfo(userAgent)
      };
    } catch (error) {
      console.error('Error collecting device info:', error);
    }
  }

  /**
   * Determine browser info from user agent
   */
  private getBrowserInfo(userAgent: string): string {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'IE';
    return 'Other';
  }

  /**
   * Determine OS info from user agent
   */
  private getOSInfo(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Other';
  }

  /**
   * Start the auto-reporting interval
   */
  private startAutoReporting() {
    if (typeof window === 'undefined') return;
    
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => {
      this.reportMetrics();
    }, this.autoReportInterval);
  }

  /**
   * Add a component metrics record to the buffer
   */
  public addComponentMetric(metric: ComponentMetrics): void {
    if (!this.enabled) return;

    const performanceMetric: PerformanceMetric = {
      component_name: metric.componentName,
      average_render_time: metric.averageRenderTime,
      total_renders: metric.renderCount,
      slow_renders: metric.slowRenderCount,
      max_render_time: metric.maxRenderTime,
      min_render_time: metric.minRenderTime === Number.MAX_SAFE_INTEGER ? 0 : metric.minRenderTime,
      metric_type: metric.metricType || 'render',
      context: {
        lastRenderTime: metric.lastRenderTime,
        recentRenders: metric.renderTimes
      }
    };

    this.metrics.push(performanceMetric);

    // Auto-report if buffer is reaching capacity
    if (this.metrics.length >= this.immediateReportThreshold) {
      this.reportMetrics();
    }
  }

  /**
   * Add a web vital metric
   */
  public addWebVital(vital: WebVitalMetric): void {
    if (!this.enabled) return;
    this.webVitals.push(vital);
  }

  /**
   * Report metrics to the server
   */
  public async reportMetrics(): Promise<boolean> {
    if (!this.enabled || this.reportInProgress || (this.metrics.length === 0 && this.webVitals.length === 0)) {
      return false;
    }

    // Avoid reporting too frequently
    const now = Date.now();
    if (now - this.lastReportTime < 5000) {
      return false;
    }

    this.reportInProgress = true;
    this.lastReportTime = now;

    try {
      // Prepare payload
      const metricsToSend = [...this.metrics];
      const webVitalsToSend = [...this.webVitals];
      
      // Clear buffers
      this.metrics = [];
      this.webVitals = [];

      // Only send if we have data
      if (metricsToSend.length === 0 && webVitalsToSend.length === 0) {
        this.reportInProgress = false;
        return true;
      }

      // Send metrics to server
      const { data, error } = await supabase.functions.invoke('performance-metrics', {
        body: {
          metrics: metricsToSend,
          webVitals: webVitalsToSend,
          deviceInfo: this.deviceInfo
        }
      });

      // Handle errors
      if (error) {
        console.error('Error reporting metrics:', error);
        
        // Put metrics back in the buffer for next attempt
        this.metrics = [...metricsToSend, ...this.metrics];
        this.webVitals = [...webVitalsToSend, ...this.webVitals];
        
        // Trim if over capacity
        if (this.metrics.length > this.bufferSize * 2) {
          this.metrics = this.metrics.slice(-this.bufferSize);
        }
        
        this.reportInProgress = false;
        return false;
      }

      // Success
      if (process.env.NODE_ENV !== 'production') {
        console.log('Metrics reported successfully:', {
          metricsCount: metricsToSend.length,
          webVitalsCount: webVitalsToSend.length
        });
      }

      this.reportInProgress = false;
      return true;
    } catch (error) {
      console.error('Unexpected error reporting metrics:', error);
      
      // Put metrics back in the buffer
      this.metrics = [...this.metrics];
      
      this.reportInProgress = false;
      return false;
    }
  }

  /**
   * Enable or disable metrics reporting
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    // If enabling, restart auto-reporting
    if (enabled && this.intervalId === null) {
      this.startAutoReporting();
    }
    
    // If disabling, stop auto-reporting
    if (!enabled && this.intervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Clean up when done
   */
  public dispose(): void {
    if (this.intervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Report any remaining metrics
    this.reportMetrics().catch(error => {
      console.error('Error reporting metrics during disposal:', error);
    });
  }
}

// Create singleton instance
const metricsReporter = new MetricsReporter();

export default metricsReporter;
