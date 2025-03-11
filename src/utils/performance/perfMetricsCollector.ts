
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
   * Enable or disable metrics collection
   */
  public setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
    this.setupAutomaticFlushing();
    
    if (this.options.debugMode) {
      console.log(`Performance metrics collection ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Set the sampling rate for metrics collection
   */
  public setSamplingRate(rate: number): void {
    this.options.samplingRate = Math.max(0, Math.min(1, rate));
    
    if (this.options.debugMode) {
      console.log(`Performance metrics sampling rate set to ${this.options.samplingRate}`);
    }
  }

  /**
   * Record a component metric
   */
  public trackComponentMetric(
    componentName: string,
    metricName: string,
    value: number,
    category: string = 'component',
    metadata?: Record<string, any>
  ): void {
    if (!this.options.enabled || Math.random() > this.options.samplingRate) {
      return;
    }

    // Store in component metrics for analysis
    this.updateComponentMetrics(componentName, metricName, value);

    // Add to batch for reporting
    this.addToBatch({
      component_name: componentName,
      metric_name: metricName,
      value,
      timestamp: new Date().toISOString(),
      category,
      type: 'render',
      session_id: this.sessionId,
      page_url: typeof window !== 'undefined' ? window.location.pathname : undefined,
      metadata
    });

    if (this.options.debugMode) {
      console.log(`[Performance] ${componentName}.${metricName}: ${value}`);
    }
  }

  /**
   * Update component metrics
   */
  private updateComponentMetrics(
    componentName: string,
    metricName: string,
    value: number
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
        renderTimes: [],
        slowRenderCount: 0,
        lastUpdated: Date.now()
      };
      this.componentMetrics.set(componentName, metrics);
    }

    // Update metrics based on metric name
    if (metricName === 'renderTime') {
      metrics.renderCount += 1;
      metrics.totalRenderTime += value;
      metrics.lastRenderTime = value;
      metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
      
      // Track slow renders
      if (value > 16) { // 16ms threshold (60fps)
        metrics.slowRenderCount = (metrics.slowRenderCount || 0) + 1;
      }
      
      // Update min/max render times
      if (!metrics.minRenderTime || value < metrics.minRenderTime) {
        metrics.minRenderTime = value;
      }
      if (!metrics.maxRenderTime || value > metrics.maxRenderTime) {
        metrics.maxRenderTime = value;
      }
      
      // Store render times history
      if (!metrics.renderTimes) {
        metrics.renderTimes = [];
      }
      
      if (metrics.renderTimes.length < 10) {
        metrics.renderTimes.push(value);
      } else {
        metrics.renderTimes.shift();
        metrics.renderTimes.push(value);
      }
    } else if (metricName === 'mountTime' && !metrics.firstRenderTime) {
      metrics.firstRenderTime = value;
    }
    
    metrics.lastUpdated = Date.now();
    this.componentMetrics.set(componentName, metrics);
  }

  /**
   * Add a metric to the batch for reporting
   */
  private addToBatch(metric: PerformanceMetric): void {
    this.metricsBatch.push(metric);
    
    if (this.metricsBatch.length >= this.options.maxMetricsPerBatch) {
      this.flush();
    }
  }

  /**
   * Flush metrics to registered callbacks
   */
  public flush(): void {
    if (this.metricsBatch.length === 0) {
      return;
    }

    // Create a copy of the batch
    const metrics = [...this.metricsBatch];
    this.metricsBatch = [];

    // Call registered callbacks with the metrics
    this.flushCallbacks.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('Error in performance metrics flush callback:', error);
      }
    });

    if (this.options.debugMode) {
      console.log(`[Performance] Flushed ${metrics.length} metrics`);
    }
  }

  /**
   * Get component metrics
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
   * Register a callback for metrics flushing
   */
  public onFlush(callback: (metrics: PerformanceMetric[]) => void): () => void {
    this.flushCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.flushCallbacks = this.flushCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Clear all collected metrics
   */
  public clear(): void {
    this.componentMetrics.clear();
    this.metricsBatch = [];
    this.webVitals.clear();
  }
}

// Create a singleton instance
export const perfMetricsCollector = new PerfMetricsCollector();

// Export class for testing or custom instances
export default PerfMetricsCollector;
