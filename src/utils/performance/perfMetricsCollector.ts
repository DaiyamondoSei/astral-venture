/**
 * Performance Metrics Collector
 * 
 * A lightweight, efficient collection system for performance metrics
 * with automatic batching and sampling.
 */
import { DeviceInfo, ComponentMetrics, PerformanceMetric } from './types';
import { asyncResultify } from '../result/AsyncResult';
import { Result, success, failure } from '../result/Result';

// Singleton pattern for metrics collection
class PerfMetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private collectionEnabled: boolean = true;
  private batchSizeLimit: number = 100;
  private samplingRate: number = 1.0; // 100% by default
  private flushInterval: number | null = null;
  private sessionId: string;
  private deviceInfo: DeviceInfo | null = null;
  
  constructor() {
    // Generate a unique session ID
    this.sessionId = crypto.randomUUID();
    
    // Set default flush interval (30 seconds)
    this.setFlushInterval(30000);
  }
  
  /**
   * Enable or disable metrics collection
   */
  public setEnabled(enabled: boolean): void {
    this.collectionEnabled = enabled;
    
    // If disabling, flush any pending metrics
    if (!enabled && this.metrics.length > 0) {
      this.flush();
    }
  }
  
  /**
   * Configure sampling rate for metrics collection
   * @param rate A value between 0 and 1 (e.g., 0.1 = collect 10% of metrics)
   */
  public setSamplingRate(rate: number): void {
    this.samplingRate = Math.max(0, Math.min(1, rate));
  }
  
  /**
   * Set the batch size limit for metrics
   * @param size The maximum number of metrics to collect before flushing
   */
  public setBatchSizeLimit(size: number): void {
    this.batchSizeLimit = Math.max(1, size);
    
    // If current batch exceeds new limit, flush
    if (this.metrics.length >= this.batchSizeLimit) {
      this.flush();
    }
  }
  
  /**
   * Set the automatic flush interval
   * @param intervalMs The interval in milliseconds, or null to disable
   */
  public setFlushInterval(intervalMs: number | null): void {
    // Clear existing interval if any
    if (this.flushInterval !== null) {
      clearInterval(this.flushInterval as unknown as number);
      this.flushInterval = null;
    }
    
    // Set new interval if specified
    if (intervalMs !== null && intervalMs > 0) {
      this.flushInterval = setInterval(() => this.flush(), intervalMs) as unknown as number;
    }
  }
  
  /**
   * Collect device information
   */
  public collectDeviceInfo(): DeviceInfo {
    if (this.deviceInfo) {
      return this.deviceInfo;
    }
    
    const deviceInfo: DeviceInfo = {
      userAgent: navigator.userAgent,
      deviceCategory: this.detectDeviceCategory(),
    };
    
    // Add screen information if available
    if (typeof window !== 'undefined' && window.screen) {
      deviceInfo.screenWidth = window.screen.width;
      deviceInfo.screenHeight = window.screen.height;
      deviceInfo.devicePixelRatio = window.devicePixelRatio;
      deviceInfo.viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    
    // Add connection information if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        deviceInfo.connection = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
    }
    
    // Add memory information if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        deviceInfo.memory = {
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize
        };
      }
    }
    
    // Cache device info for this session
    this.deviceInfo = deviceInfo;
    
    return deviceInfo;
  }
  
  /**
   * Add a performance metric to the collection
   */
  public addMetric(metric: Omit<PerformanceMetric, 'session_id' | 'timestamp' | 'device_info'>): void {
    // Skip collection if disabled
    if (!this.collectionEnabled) {
      return;
    }
    
    // Apply sampling
    if (Math.random() > this.samplingRate) {
      return;
    }
    
    // Get current time
    const timestamp = new Date().toISOString();
    
    // Add to collection
    this.metrics.push({
      ...metric,
      session_id: this.sessionId,
      timestamp,
    });
    
    // Flush if batch size reached
    if (this.metrics.length >= this.batchSizeLimit) {
      this.flush();
    }
  }
  
  /**
   * Track component render performance
   */
  public trackComponentRender(
    componentName: string,
    renderTime: number,
    metadata?: Record<string, any>
  ): void {
    this.addMetric({
      component_name: componentName,
      metric_name: 'renderTime',
      value: renderTime,
      category: 'component',
      type: 'render',
      ...(metadata && { metadata })
    });
  }
  
  /**
   * Track interaction performance (clicks, form submissions, etc.)
   */
  public trackInteraction(
    name: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    this.addMetric({
      metric_name: name,
      value: duration,
      category: 'interaction',
      type: 'interaction',
      page_url: typeof window !== 'undefined' ? window.location.pathname : undefined,
      ...(metadata && { metadata })
    });
  }
  
  /**
   * Track web vital metric
   */
  public trackWebVital(
    name: string,
    value: number, 
    category: string,
    rating?: 'good' | 'needs-improvement' | 'poor'
  ): void {
    this.addMetric({
      metric_name: name,
      value,
      category,
      type: 'webVital',
      ...(rating && { rating })
    });
  }
  
  /**
   * Flush collected metrics to the backend
   */
  public async flush(): Promise<Result<void, Error>> {
    if (this.metrics.length === 0) {
      return success(undefined);
    }
    
    try {
      // Clone metrics and clear the collection
      const metricsToSend = [...this.metrics];
      this.metrics = [];
      
      // Use sendBeacon if available and page is unloading
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator && document.visibilityState === 'hidden') {
        this.sendWithBeacon(metricsToSend);
        return success(undefined);
      }
      
      // Otherwise use fetch
      return await this.sendWithFetch(metricsToSend);
    } catch (error) {
      console.error('Error flushing metrics:', error);
      
      // Add back to collection for retry on next flush
      if (this.collectionEnabled) {
        this.metrics = [...this.metrics, ...this.metrics];
      }
      
      return failure(error instanceof Error ? error : new Error('Unknown error flushing metrics'));
    }
  }
  
  /**
   * Send metrics using Beacon API (for unload events)
   */
  private sendWithBeacon(metrics: PerformanceMetric[]): boolean {
    if (typeof navigator === 'undefined' || !('sendBeacon' in navigator)) {
      return false;
    }
    
    try {
      const payload = {
        metrics,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        source: 'web',
        deviceInfo: this.collectDeviceInfo()
      };
      
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json'
      });
      
      return navigator.sendBeacon('/api/track-performance', blob);
    } catch (error) {
      console.error('Error using sendBeacon:', error);
      return false;
    }
  }
  
  /**
   * Send metrics using Fetch API
   */
  private async sendWithFetch(metrics: PerformanceMetric[]): Promise<Result<void, Error>> {
    try {
      // Call edge function if available
      if (typeof window !== 'undefined' && 'supabase' in window) {
        const { supabase } = await import('../../integrations/supabase/client');
        
        const { error } = await supabase.functions.invoke('track-performance', {
          body: {
            metrics,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            source: 'web',
            deviceInfo: this.collectDeviceInfo()
          }
        });
        
        if (error) {
          console.error('Error sending performance metrics:', error);
          return failure(new Error(`Failed to send metrics: ${error.message}`));
        }
        
        return success(undefined);
      }
      
      // Fallback to direct API call
      const response = await fetch('/api/track-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metrics,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
          deviceInfo: this.collectDeviceInfo()
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return failure(new Error(`Failed to send metrics: ${errorText}`));
      }
      
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to send metrics'));
    }
  }
  
  /**
   * Detect device category based on user agent and screen size
   */
  private detectDeviceCategory(): string {
    if (typeof navigator === 'undefined') {
      return 'unknown';
    }
    
    const ua = navigator.userAgent;
    
    // Check for mobile devices
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      if (typeof window !== 'undefined' && window.screen) {
        return window.screen.width < 768 ? 'mobile' : 'tablet';
      }
      return 'mobile';
    }
    
    // Check for desktop devices
    return 'desktop';
  }
}

// Create and export singleton instance
export const perfMetricsCollector = new PerfMetricsCollector();

// Create AsyncResult-wrapped version of flush method
export const flushMetricsAsync = asyncResultify(
  perfMetricsCollector.flush.bind(perfMetricsCollector)
);

export default perfMetricsCollector;
