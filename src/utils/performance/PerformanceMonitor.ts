
import { ComponentMetric, ComponentMetrics, WebVitalMetric } from '@/types/performance';

/**
 * PerformanceMonitor class
 * Singleton class for tracking component render performance and web vitals
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: ComponentMetrics = {};
  private webVitals: WebVitalMetric[] = [];
  private sessionId: string;
  private subscribers: Array<(metrics: ComponentMetrics) => void> = [];
  private isReporting = false;
  private lastReportTime = 0;
  private reportIntervalMs = 30000; // 30 seconds
  private enabledTracking = true;
  private samplingRate = 100; // percentage
  private isRunningInBackground = false;
  
  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupBackgroundDetection();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Record a component render
   * @param componentName Name of the component
   * @param renderTime Time in milliseconds
   * @param renderType Type of render (default: update)
   */
  public recordRender(
    componentName: string, 
    renderTime: number,
    renderType: 'initial' | 'update' | 'effect' = 'update'
  ): void {
    // Skip if tracking is disabled or fails sampling rate check
    if (!this.enabledTracking || Math.random() * 100 > this.samplingRate) {
      return;
    }
    
    // Skip if throttling in background
    if (this.isRunningInBackground && renderType === 'update') {
      return;
    }
    
    try {
      // Initialize component metrics if not exist
      if (!this.metrics[componentName]) {
        this.metrics[componentName] = {
          componentName,
          renderCount: 0,
          averageRenderTime: 0,
          minRenderTime: Infinity,
          maxRenderTime: 0,
          lastRenderTime: 0,
          totalRenderTime: 0,
          slowRenders: 0,
          timestamp: Date.now()
        };
      }
      
      const metric = this.metrics[componentName];
      
      // Update metrics
      metric.renderCount++;
      metric.lastRenderTime = renderTime;
      metric.totalRenderTime += renderTime;
      metric.averageRenderTime = metric.totalRenderTime / metric.renderCount;
      metric.minRenderTime = Math.min(metric.minRenderTime, renderTime);
      metric.maxRenderTime = Math.max(metric.maxRenderTime, renderTime);
      
      // Check for slow renders (threshold could be configurable)
      if (renderTime > 16.67) { // Approximately 60fps threshold
        metric.slowRenders++;
      }
      
      // Notify subscribers
      this.notifySubscribers();
      
      // Auto-report if enough time has passed
      this.checkAutoReport();
    } catch (error) {
      console.error(`Error recording render for ${componentName}:`, error);
    }
  }
  
  /**
   * Record a web vital metric
   * @param name Metric name
   * @param value Metric value
   * @param category Metric category
   */
  public recordWebVital(
    name: string,
    value: number,
    category: 'loading' | 'interaction' | 'visual_stability'
  ): void {
    if (!this.enabledTracking) return;
    
    try {
      this.webVitals.push({
        name,
        value,
        category,
        timestamp: Date.now()
      });
      
      // Limit array size to prevent memory issues
      if (this.webVitals.length > 100) {
        this.webVitals.shift();
      }
      
      // Auto-report if enough time has passed
      this.checkAutoReport();
    } catch (error) {
      console.error(`Error recording web vital ${name}:`, error);
    }
  }
  
  /**
   * Subscribe to metric updates
   * @param callback Function to call when metrics change
   * @returns Unsubscribe function
   */
  public subscribe(callback: (metrics: ComponentMetrics) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notify subscribers of metrics update
   */
  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(this.metrics);
      } catch (error) {
        console.error("Error in performance monitor subscriber:", error);
      }
    }
  }
  
  /**
   * Check if it's time to auto-report metrics
   */
  private checkAutoReport(): void {
    const now = Date.now();
    
    // Check if enough time has passed since last report
    if (!this.isReporting && now - this.lastReportTime > this.reportIntervalMs) {
      this.reportMetrics();
    }
  }
  
  /**
   * Report metrics to server
   */
  public async reportMetrics(): Promise<boolean> {
    if (this.isReporting) return false;
    
    try {
      this.isReporting = true;
      
      // Skip if no metrics to report
      if (Object.keys(this.metrics).length === 0 && this.webVitals.length === 0) {
        this.isReporting = false;
        return false;
      }
      
      // Format metrics for reporting
      const metricsArray = Object.values(this.metrics).map(metric => ({
        componentName: metric.componentName,
        renderTime: metric.averageRenderTime,
        renderCount: metric.renderCount,
        slowRenders: metric.slowRenders
      }));
      
      // Create payload
      const payload = {
        sessionId: this.sessionId,
        metrics: metricsArray,
        webVitals: this.webVitals,
        timestamp: Date.now(),
        deviceInfo: this.getDeviceInfo()
      };
      
      // Send metrics to server
      const response = await fetch('/api/track-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        // Clear reported metrics and update last report time
        this.metrics = {};
        this.webVitals = [];
        this.lastReportTime = Date.now();
        this.isReporting = false;
        return true;
      } else {
        console.error('Failed to report metrics:', await response.text());
        this.isReporting = false;
        return false;
      }
    } catch (error) {
      console.error('Error reporting metrics:', error);
      this.isReporting = false;
      return false;
    }
  }
  
  /**
   * Get device information
   */
  private getDeviceInfo() {
    try {
      const navigatorInfo = navigator as any;
      
      return {
        userAgent: navigator.userAgent,
        deviceCategory: this.getDeviceCategory(),
        deviceMemory: navigatorInfo.deviceMemory || 'unknown',
        hardwareConcurrency: navigatorInfo.hardwareConcurrency || 'unknown',
        connectionType: navigatorInfo.connection ? navigatorInfo.connection.effectiveType : 'unknown',
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return {
        userAgent: 'unknown',
        deviceCategory: 'unknown'
      };
    }
  }
  
  /**
   * Categorize device capabilities
   */
  private getDeviceCategory(): string {
    const navigatorInfo = navigator as any;
    
    if (navigatorInfo.deviceMemory < 2 || navigatorInfo.hardwareConcurrency < 4) {
      return 'low-end';
    } else if (navigatorInfo.deviceMemory >= 4 && navigatorInfo.hardwareConcurrency >= 8) {
      return 'high-end';
    } else {
      return 'mid-range';
    }
  }
  
  /**
   * Setup background detection
   */
  private setupBackgroundDetection(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isRunningInBackground = document.visibilityState === 'hidden';
      });
    }
  }
  
  /**
   * Configure the performance monitor
   */
  public configure(options: {
    enabledTracking?: boolean;
    samplingRate?: number;
    reportIntervalMs?: number;
  }): void {
    if (options.enabledTracking !== undefined) {
      this.enabledTracking = options.enabledTracking;
    }
    
    if (options.samplingRate !== undefined) {
      this.samplingRate = Math.max(0, Math.min(100, options.samplingRate));
    }
    
    if (options.reportIntervalMs !== undefined) {
      this.reportIntervalMs = options.reportIntervalMs;
    }
  }
  
  /**
   * Get current metrics
   */
  public getMetrics(): ComponentMetrics {
    return this.metrics;
  }
  
  /**
   * Get web vitals metrics
   */
  public getWebVitals(): WebVitalMetric[] {
    return this.webVitals;
  }
  
  /**
   * Reset performance monitor
   */
  public reset(): void {
    this.metrics = {};
    this.webVitals = [];
    this.lastReportTime = 0;
    this.sessionId = this.generateSessionId();
  }
}

// Export singleton instance
export default PerformanceMonitor.getInstance();
