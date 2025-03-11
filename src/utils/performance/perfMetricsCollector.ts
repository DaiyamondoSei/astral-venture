
/**
 * Performance Metrics Collector
 * 
 * Collects, processes, and manages performance metrics throughout the application
 */
import { ComponentMetrics, PerformanceMetric, WebVitalMetric } from './types';

interface CollectorOptions {
  enabled: boolean;
  samplingRate: number;
  maxMetricsPerBatch: number;
  flushInterval: number;
  debugMode: boolean;
}

const DEFAULT_OPTIONS: CollectorOptions = {
  enabled: true,
  samplingRate: 0.1, // Sample 10% of metrics by default
  maxMetricsPerBatch: 50,
  flushInterval: 10000, // 10 seconds
  debugMode: false,
};

/**
 * Performance metrics collector for the application
 */
class PerfMetricsCollector {
  private options: CollectorOptions;
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private metricsBatch: PerformanceMetric[] = [];
  private webVitals: Map<string, WebVitalMetric> = new Map();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushCallbacks: Array<(metrics: PerformanceMetric[]) => void> = [];
  private sessionId: string;

  constructor(options: Partial<CollectorOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.sessionId = this.generateSessionId();
    this.setupAutomaticFlushing();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Set up automatic flushing of metrics
   */
  private setupAutomaticFlushing(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    if (this.options.enabled) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.options.flushInterval);
    }
  }

  /**
   * Register a callback to be called when metrics are flushed
   */
  public onFlush(callback: (metrics: PerformanceMetric[]) => void): () => void {
    this.flushCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.flushCallbacks.indexOf(callback);
      if (index !== -1) {
        this.flushCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Record a component metric
   */
  public trackComponentMetric(
    componentName: string,
    metricName: string,
    value: number,
    metadata: Record<string, any> = {}
  ): void {
    if (!this.options.enabled) return;
    
    // Apply sampling if enabled
    if (Math.random() > this.options.samplingRate) return;

    // Create metric object
    const metric: PerformanceMetric = {
      component_name: componentName,
      metric_name: metricName,
      value,
      timestamp: Date.now(),
      category: 'component',
      type: 'render',
      metadata
    };

    // Add to batch
    this.metricsBatch.push(metric);
    
    // Auto-flush if batch is large enough
    if (this.metricsBatch.length >= this.options.maxMetricsPerBatch) {
      this.flush();
    }

    // Update component metrics map
    this.updateComponentMetrics(componentName, metricName, value, metadata);
  }

  /**
   * Track a web vital metric
   */
  public trackWebVital(
    name: string,
    value: number,
    category: 'loading' | 'interaction' | 'visual_stability'
  ): void {
    if (!this.options.enabled) return;

    const webVital: WebVitalMetric = {
      name: name as WebVitalMetric['name'],
      value,
      category,
      timestamp: Date.now()
    };
    
    this.webVitals.set(name, webVital);
    
    // Create metric object for batch
    const metric: PerformanceMetric = {
      metric_name: name,
      value,
      timestamp: Date.now(),
      category,
      type: 'webVital',
    };
    
    // Add to batch
    this.metricsBatch.push(metric);
  }

  /**
   * Update the component metrics map with new data
   */
  private updateComponentMetrics(
    componentName: string,
    metricName: string,
    value: number,
    metadata: Record<string, any> = {}
  ): void {
    // Get or create component metrics
    let metrics = this.componentMetrics.get(componentName);
    
    if (!metrics) {
      metrics = {
        componentName,
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        slowRenderCount: 0,
        minRenderTime: Infinity,
        maxRenderTime: 0,
        renderTimes: [],
        lastUpdated: Date.now(),
        metricType: 'render'
      };
    }
    
    // Update based on metric name
    if (metricName === 'renderTime') {
      metrics.renderCount += 1;
      metrics.totalRenderTime += value;
      metrics.lastRenderTime = value;
      metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
      
      // Track render times (limited history)
      if (!metrics.renderTimes) {
        metrics.renderTimes = [];
      }
      
      if (metrics.renderTimes.length >= 10) {
        metrics.renderTimes.shift();
      }
      metrics.renderTimes.push(value);
      
      // Update min/max render times
      if (value < metrics.minRenderTime || metrics.minRenderTime === undefined) {
        metrics.minRenderTime = value;
      }
      
      if (value > metrics.maxRenderTime || metrics.maxRenderTime === undefined) {
        metrics.maxRenderTime = value;
      }
      
      // Track slow renders
      if (value > 16) { // 60fps threshold (16.67ms)
        metrics.slowRenderCount = (metrics.slowRenderCount || 0) + 1;
      }
    }
    
    // Update timestamp
    metrics.lastUpdated = Date.now();
    
    // Save updated metrics
    this.componentMetrics.set(componentName, metrics);
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
  public getAllComponentMetrics(): Record<string, ComponentMetrics> {
    const result: Record<string, ComponentMetrics> = {};
    this.componentMetrics.forEach((value, key) => {
      result[key] = { ...value };
    });
    return result;
  }

  /**
   * Get all web vital metrics
   */
  public getWebVitals(): Record<string, WebVitalMetric> {
    const result: Record<string, WebVitalMetric> = {};
    this.webVitals.forEach((value, key) => {
      result[key] = { ...value };
    });
    return result;
  }

  /**
   * Flush collected metrics and call registered callbacks
   */
  public async flush(): Promise<void> {
    if (this.metricsBatch.length === 0) return;
    
    // Create a copy of the current batch
    const metrics = [...this.metricsBatch];
    
    // Clear the batch
    this.metricsBatch = [];
    
    // Call registered callbacks
    for (const callback of this.flushCallbacks) {
      try {
        callback(metrics);
      } catch (error) {
        console.error('Error in metrics flush callback:', error);
      }
    }
  }

  /**
   * Reset all collected metrics
   */
  public reset(): void {
    this.componentMetrics.clear();
    this.webVitals.clear();
    this.metricsBatch = [];
    
    if (this.options.debugMode) {
      console.log('Performance metrics collector reset');
    }
  }

  /**
   * Update collector options
   */
  public configure(options: Partial<CollectorOptions>): void {
    const previousEnabled = this.options.enabled;
    const previousInterval = this.options.flushInterval;
    
    this.options = { ...this.options, ...options };
    
    // If enabled state or interval changed, update the timer
    if (previousEnabled !== this.options.enabled || 
        previousInterval !== this.options.flushInterval) {
      this.setupAutomaticFlushing();
    }
  }
}

// Create a singleton instance
export const perfMetricsCollector = new PerfMetricsCollector();

// Export the class for testing or custom instances
export default perfMetricsCollector;
