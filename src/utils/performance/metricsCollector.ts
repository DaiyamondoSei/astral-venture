
/**
 * Performance Metrics Collector
 * 
 * A utility to collect, validate, and report performance metrics.
 */

import { 
  PerformanceMetric, 
  MetricType,
  WebVitalMetric,
  WebVitalCategory,
  WebVitalRating
} from './types';
import { performanceMetricValidator, webVitalValidator } from './validation';
import { ValidationError } from '../validation/ValidationError';
import { throttle } from '../throttle';

// Default collector configuration
const DEFAULT_COLLECTOR_CONFIG = {
  enabled: true,
  throttleInterval: 1000,
  batchSize: 10,
  maxQueueSize: 100,
  autoSendThreshold: 20,
  sendEndpoint: '/api/performance-metrics',
  debugLogging: false
};

/**
 * Performance metrics collector class
 */
class MetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitalMetric[] = [];
  private config = { ...DEFAULT_COLLECTOR_CONFIG };
  private queueProcessing = false;
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.collectThrottled = throttle(this.collectInternal, this.config.throttleInterval);
  }
  
  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Set collector configuration
   */
  public setConfig(config: Partial<typeof DEFAULT_COLLECTOR_CONFIG>): void {
    this.config = { ...this.config, ...config };
    // Re-create throttled function with new interval
    this.collectThrottled = throttle(this.collectInternal, this.config.throttleInterval);
  }
  
  /**
   * Enable or disable metrics collection
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }
  
  /**
   * Set throttle interval
   */
  public setThrottleInterval(interval: number): void {
    this.config.throttleInterval = interval;
    this.collectThrottled = throttle(this.collectInternal, interval);
  }
  
  /**
   * Throttled version of collectInternal
   * This is set in the constructor and when the throttle interval changes
   */
  private collectThrottled: (
    metricName: string,
    value: number,
    type: MetricType,
    metadata?: Record<string, any>,
    componentName?: string
  ) => void;
  
  /**
   * Internal implementation of metric collection
   */
  private collectInternal(
    metricName: string,
    value: number,
    type: MetricType,
    metadata?: Record<string, any>,
    componentName?: string
  ): void {
    if (!this.config.enabled) return;
    
    try {
      const metric: PerformanceMetric = {
        metric_name: metricName,
        value: value,
        type: type,
        category: componentName ? 'component' : type,
        timestamp: new Date().toISOString(),
        component_name: componentName,
        session_id: this.sessionId,
        metadata: metadata
      };
      
      // Validate metric before adding to queue
      const validation = performanceMetricValidator(metric);
      if (!validation.valid) {
        if (this.config.debugLogging) {
          console.error('Invalid metric:', metric, validation.errors || validation.error);
        }
        return;
      }
      
      this.metrics.push(metric as PerformanceMetric);
      
      if (this.config.debugLogging) {
        console.log('Collected metric:', metric);
      }
      
      // Auto-send if we hit the threshold
      if (this.metrics.length >= this.config.autoSendThreshold) {
        this.sendMetrics();
      }
    } catch (error) {
      if (this.config.debugLogging) {
        console.error('Error collecting metric:', error);
      }
    }
  }
  
  /**
   * Collect a performance metric
   */
  public collect(
    metricName: string,
    value: number,
    type: MetricType,
    metadata?: Record<string, any>,
    componentName?: string
  ): void {
    this.collectThrottled(metricName, value, type, metadata, componentName);
  }
  
  /**
   * Collect a web vital metric
   */
  public collectWebVital(
    name: string,
    value: number,
    category: WebVitalCategory,
    rating?: WebVitalRating
  ): void {
    if (!this.config.enabled) return;
    
    try {
      const vital: WebVitalMetric = {
        name,
        value,
        category,
        timestamp: Date.now(),
        rating
      };
      
      // Validate web vital before adding
      const validation = webVitalValidator(vital);
      if (!validation.valid) {
        if (this.config.debugLogging) {
          console.error('Invalid web vital:', vital, validation.errors || validation.error);
        }
        return;
      }
      
      this.webVitals.push(vital);
      
      if (this.config.debugLogging) {
        console.log('Collected web vital:', vital);
      }
    } catch (error) {
      if (this.config.debugLogging) {
        console.error('Error collecting web vital:', error);
      }
    }
  }
  
  /**
   * Send collected metrics to the server
   */
  public async sendMetrics(): Promise<boolean> {
    if (this.metrics.length === 0 && this.webVitals.length === 0) {
      return true;
    }
    
    if (this.queueProcessing) {
      return false;
    }
    
    try {
      this.queueProcessing = true;
      
      const metricsToSend = [...this.metrics];
      const vitalsToSend = [...this.webVitals];
      
      // Clear the queues
      this.metrics = [];
      this.webVitals = [];
      
      const payload = {
        metrics: metricsToSend,
        webVitals: vitalsToSend.length > 0 ? vitalsToSend : undefined,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        source: 'web',
        deviceInfo: this.getDeviceInfo()
      };
      
      if (this.config.debugLogging) {
        console.log('Sending metrics:', payload);
      }
      
      const response = await fetch(this.config.sendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send metrics: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (this.config.debugLogging) {
        console.log('Metrics sent successfully:', result);
      }
      
      return true;
    } catch (error) {
      if (this.config.debugLogging) {
        console.error('Error sending metrics:', error);
      }
      
      // Put metrics back in the queue
      this.metrics = [...this.metrics, ...this.metrics];
      this.webVitals = [...this.webVitals, ...this.webVitals];
      
      // Trim queues if they get too large
      if (this.metrics.length > this.config.maxQueueSize) {
        this.metrics = this.metrics.slice(-this.config.maxQueueSize);
      }
      
      if (this.webVitals.length > this.config.maxQueueSize) {
        this.webVitals = this.webVitals.slice(-this.config.maxQueueSize);
      }
      
      return false;
    } finally {
      this.queueProcessing = false;
    }
  }
  
  /**
   * Get current device information
   */
  private getDeviceInfo(): Record<string, any> {
    const info: Record<string, any> = {
      userAgent: navigator.userAgent,
      deviceCategory: this.getDeviceCategory(),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    };
    
    // Add connection information if available
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        info.connection = {
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData
        };
      }
    }
    
    // Add memory information if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        info.memory = {
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize
        };
      }
    }
    
    return info;
  }
  
  /**
   * Determine device category from user agent and screen size
   */
  private getDeviceCategory(): string {
    const userAgent = navigator.userAgent;
    const width = window.innerWidth;
    
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      if (width > 768) {
        return 'tablet';
      }
      return 'mobile';
    }
    
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }
  
  /**
   * Clear all collected metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.webVitals = [];
  }
  
  /**
   * Get currently queued metrics count
   */
  public getQueueSize(): { metrics: number; webVitals: number } {
    return {
      metrics: this.metrics.length,
      webVitals: this.webVitals.length
    };
  }
}

/**
 * Create and export a singleton instance
 */
export const metricsCollector = new MetricsCollector();

export default metricsCollector;
