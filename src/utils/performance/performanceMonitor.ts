
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
  debugMode: false,
  
  // Extended configuration with defaults
  optimizationLevel: 'auto',
  throttleInterval: 1000,
  maxTrackedComponents: 100,
  
  // Feature flags
  enablePerformanceTracking: true,
  enableRenderTracking: true,
  enableValidation: true,
  enablePropTracking: false,
  enableDebugLogging: false,
  
  // Advanced features
  intelligentProfiling: false,
  inactiveTabThrottling: true,
  batchUpdates: true
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
  private isMonitoring: boolean = false;

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
   * Start performance monitoring
   */
  public startMonitoring(): void {
    this.isMonitoring = true;
    if (this.config.debugMode) {
      console.log('Performance monitoring started');
    }
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.config.debugMode) {
      console.log('Performance monitoring stopped');
    }
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
   * Enable or disable metrics collection
   */
  public setMetricsEnabled(enabled: boolean): void {
    this.config.metricsEnabled = enabled;
    
    if (this.config.debugMode) {
      console.log(`Performance metrics collection ${enabled ? 'enabled' : 'disabled'}`);
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
    if (!this.isEnabled || !this.config.metricsEnabled || !this.config.enablePerformanceTracking) return;

    // Apply sampling if configured
    if (Math.random() > this.config.samplingRate) return;

    const existingMetric = this.componentMetrics.get(componentName);
    
    if (existingMetric) {
      existingMetric.renderCount += 1;
      existingMetric.totalRenderTime += renderTime;
      existingMetric.lastRenderTime = renderTime;
      existingMetric.averageRenderTime = existingMetric.totalRenderTime / existingMetric.renderCount;
      
      // Track slow renders
      if (renderTime > this.config.slowRenderThreshold) {
        existingMetric.slowRenderCount = (existingMetric.slowRenderCount || 0) + 1;
      }
      
      // Track min/max render times
      if (!existingMetric.maxRenderTime || renderTime > existingMetric.maxRenderTime) {
        existingMetric.maxRenderTime = renderTime;
      }
      
      if (!existingMetric.minRenderTime || renderTime < existingMetric.minRenderTime) {
        existingMetric.minRenderTime = renderTime;
      }
      
      // Store render times history if available
      if (!existingMetric.renderTimes) {
        existingMetric.renderTimes = [];
      }
      
      if (existingMetric.renderTimes.length < 10) {
        existingMetric.renderTimes.push(renderTime);
      } else {
        existingMetric.renderTimes.shift();
        existingMetric.renderTimes.push(renderTime);
      }
      
      // Track memory if available
      if (window.performance && 'memory' in window.performance) {
        existingMetric.memoryUsage = (window.performance as any).memory.usedJSHeapSize;
      }
      
      existingMetric.lastUpdated = Date.now();
      existingMetric.metricType = type;
      
      this.componentMetrics.set(componentName, existingMetric);
    } else {
      // Initialize render times array
      const renderTimes = [renderTime];
      
      const newMetric: ComponentMetrics = {
        componentName,
        renderCount: 1,
        totalRenderTime: renderTime,
        averageRenderTime: renderTime,
        lastRenderTime: renderTime,
        memoryUsage: window.performance && 'memory' in window.performance
          ? (window.performance as any).memory.usedJSHeapSize 
          : 0,
        renderSizes: [],
        
        // Extended metrics
        slowRenderCount: renderTime > this.config.slowRenderThreshold ? 1 : 0,
        minRenderTime: renderTime,
        maxRenderTime: renderTime,
        renderTimes,
        lastUpdated: Date.now(),
        metricType: type
      };
      
      this.componentMetrics.set(componentName, newMetric);
    }

    // Notify subscribers
    this.notifySubscribers();
  }

  /**
   * Record a component render for performance tracking
   */
  public recordRender(
    componentName: string,
    renderTime: number,
    type: MetricType = 'render'
  ): void {
    // Alias for addComponentMetric for backward compatibility
    this.addComponentMetric(componentName, renderTime, type);
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
   * Get all metrics in a flattened format
   */
  public getAllMetrics(): Record<string, ComponentMetrics> {
    const metrics: Record<string, ComponentMetrics> = {};
    this.componentMetrics.forEach((value, key) => {
      metrics[key] = { ...value };
    });
    return metrics;
  }

  /**
   * Get the slowest components by render time
   */
  public getSlowestComponents(limit: number = 5): ComponentMetrics[] {
    const metrics = Array.from(this.componentMetrics.values());
    return metrics
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, limit);
  }

  /**
   * Get web vital metrics
   */
  public getWebVitals(): Record<string, number> {
    const result: Record<string, number> = {};
    
    this.webVitals.forEach((vital, name) => {
      result[name] = vital.value;
    });
    
    return result;
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
   * Clear metrics (alias for resetMetrics for backward compatibility)
   */
  public clearMetrics(): void {
    this.resetMetrics();
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
          component_name: metric.componentName, // For backward compatibility
          metricName: 'renderTime',
          metric_name: 'renderTime', // For backward compatibility
          value: metric.averageRenderTime,
          timestamp: Date.now(),
          category: 'component',
          type: 'render'
        });
        
        metrics.push({
          componentName: metric.componentName,
          component_name: metric.componentName, // For backward compatibility
          metricName: 'renderCount',
          metric_name: 'renderCount', // For backward compatibility
          value: metric.renderCount,
          timestamp: Date.now(),
          category: 'component',
          type: 'render'
        });
        
        if (metric.slowRenderCount) {
          metrics.push({
            componentName: metric.componentName,
            component_name: metric.componentName,
            metricName: 'slowRenderCount',
            metric_name: 'slowRenderCount',
            value: metric.slowRenderCount,
            timestamp: Date.now(),
            category: 'component', 
            type: 'render'
          });
        }
      });
      
      // Add web vitals
      this.webVitals.forEach((vital) => {
        metrics.push({
          metricName: vital.name,
          metric_name: vital.name, // For backward compatibility
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
export default performanceMonitor;
