
/**
 * Performance Monitoring System
 * 
 * Centralized performance monitoring infrastructure for tracking
 * component rendering, interactions, and web vitals.
 */

import { 
  ComponentMetrics, 
  WebVitalMetric, 
  PerformanceMonitorConfig,
  WebVitalName,
  WebVitalCategory,
  MetricType,
  PerformanceMetric,
  DeviceInfo
} from './types';

/**
 * Default performance monitoring configuration
 */
export const defaultConfig: PerformanceMonitorConfig = {
  enabled: true,
  metricsEnabled: true,
  slowRenderThreshold: 16, // 60fps threshold
  samplingRate: 0.1, // Sample 10% of metrics by default
  debugMode: false
};

/**
 * Performance monitoring system for the application
 */
class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private componentMetrics: Map<string, ComponentMetrics>;
  private webVitals: Map<string, WebVitalMetric>;
  private generalMetrics: PerformanceMetric[];
  private subscribers: Set<(metrics: Map<string, ComponentMetrics>) => void>;
  private isEnabled: boolean;
  private lastReportTime: number;

  constructor(initialConfig: Partial<PerformanceMonitorConfig> = {}) {
    this.config = { ...defaultConfig, ...initialConfig };
    this.componentMetrics = new Map();
    this.webVitals = new Map();
    this.generalMetrics = [];
    this.subscribers = new Set();
    this.isEnabled = this.config.enabled;
    this.lastReportTime = Date.now();
  }

  /**
   * Enable or disable the performance monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (this.config.debugMode) {
      console.log(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Update configuration settings
   */
  public configure(config: Partial<PerformanceMonitorConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.debugMode) {
      console.log('Performance monitor configuration updated:', this.config);
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): PerformanceMonitorConfig {
    return { ...this.config };
  }

  /**
   * Record a component render event
   */
  public addComponentMetric(
    componentName: string, 
    renderTime: number,
    type: MetricType = 'render'
  ): void {
    if (!this.isEnabled || !this.config.metricsEnabled) return;

    // Apply sampling if configured
    if (Math.random() > this.config.samplingRate) return;

    const existingMetric = this.componentMetrics.get(componentName);
    
    if (existingMetric) {
      existingMetric.renderCount += 1;
      existingMetric.totalRenderTime += renderTime;
      existingMetric.lastRenderTime = renderTime;
      existingMetric.averageRenderTime = existingMetric.totalRenderTime / existingMetric.renderCount;
      
      // Track memory if available
      if (window.performance && window.performance.memory) {
        existingMetric.memoryUsage = window.performance.memory.usedJSHeapSize;
      }
      
      this.componentMetrics.set(componentName, existingMetric);
    } else {
      const newMetric: ComponentMetrics = {
        componentName,
        renderCount: 1,
        totalRenderTime: renderTime,
        averageRenderTime: renderTime,
        lastRenderTime: renderTime,
        memoryUsage: window.performance && window.performance.memory 
          ? window.performance.memory.usedJSHeapSize 
          : 0,
        renderSizes: []
      };
      
      this.componentMetrics.set(componentName, newMetric);
    }

    // Notify subscribers
    this.notifySubscribers();
  }

  /**
   * Record a web vital metric
   */
  public addWebVital(
    name: WebVitalName | string,
    value: number,
    category: WebVitalCategory
  ): void {
    if (!this.isEnabled || !this.config.metricsEnabled) return;

    // Normalize web vital name
    const normalizedName = name.toLowerCase() as WebVitalName;
    
    const webVital: WebVitalMetric = {
      name: normalizedName as WebVitalName,
      value,
      category,
      timestamp: Date.now()
    };
    
    this.webVitals.set(normalizedName, webVital);
    
    if (this.config.debugMode) {
      console.log(`Web vital recorded: ${name} = ${value}`);
    }
  }

  /**
   * Get metrics for a specific component
   */
  public getComponentMetrics(componentName: string): ComponentMetrics | null {
    return this.componentMetrics.get(componentName) || null;
  }

  /**
   * Get all component metrics
   */
  public getAllComponentMetrics(): Map<string, ComponentMetrics> {
    return new Map(this.componentMetrics);
  }

  /**
   * Get web vital metrics
   */
  public getWebVitals(): Record<WebVitalName, number> {
    const result: Partial<Record<WebVitalName, number>> = {};
    
    this.webVitals.forEach((vital, name) => {
      result[name as WebVitalName] = vital.value;
    });
    
    return result as Record<WebVitalName, number>;
  }

  /**
   * Reset all collected metrics
   */
  public resetMetrics(): void {
    this.componentMetrics.clear();
    this.webVitals.clear();
    this.generalMetrics = [];
    this.lastReportTime = Date.now();
    
    if (this.config.debugMode) {
      console.log('Performance metrics reset');
    }
  }

  /**
   * Subscribe to metrics updates
   */
  public subscribe(callback: (metrics: Map<string, ComponentMetrics>) => void): () => void {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify subscribers of metrics updates
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(this.componentMetrics);
      } catch (error) {
        console.error('Error in performance metrics subscriber:', error);
      }
    });
  }

  /**
   * Report metrics to monitoring service if configured
   */
  public async reportNow(): Promise<boolean> {
    if (!this.isEnabled || !this.config.reportingEndpoint) {
      return false;
    }
    
    try {
      const metrics: PerformanceMetric[] = [];
      
      // Convert component metrics to reportable format
      this.componentMetrics.forEach((metric) => {
        metrics.push({
          componentName: metric.componentName,
          metricName: 'renderTime',
          value: metric.averageRenderTime,
          timestamp: Date.now(),
          category: 'component',
          type: 'render'
        });
        
        metrics.push({
          componentName: metric.componentName,
          metricName: 'renderCount',
          value: metric.renderCount,
          timestamp: Date.now(),
          category: 'component',
          type: 'render'
        });
      });
      
      // Add web vitals
      this.webVitals.forEach((vital) => {
        metrics.push({
          metricName: vital.name,
          value: vital.value,
          timestamp: vital.timestamp,
          category: vital.category,
          type: 'webVital'
        });
      });
      
      // Add general metrics
      metrics.push(...this.generalMetrics);
      
      // Create payload
      const payload: Record<string, any> = {
        timestamp: Date.now(),
        metrics
      };
      
      // Device info if available
      if (navigator) {
        payload.device = {
          userAgent: navigator.userAgent,
          deviceCategory: this.getDeviceCategory()
        };
      }
      
      // Report metrics
      const response = await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      this.lastReportTime = Date.now();
      
      return response.ok;
    } catch (error) {
      console.error('Failed to report performance metrics:', error);
      return false;
    }
  }
  
  /**
   * Determine device category based on user agent
   */
  private getDeviceCategory(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipod|windows phone/i.test(userAgent)) {
      return 'mobile';
    }
    
    if (/ipad|tablet/i.test(userAgent)) {
      return 'tablet';
    }
    
    return 'desktop';
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export class for testing or custom instances
export default PerformanceMonitor;
