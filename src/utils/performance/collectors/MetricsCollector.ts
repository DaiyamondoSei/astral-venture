
/**
 * Metrics Collector
 * 
 * Service for collecting and buffering performance metrics.
 */
import { DeviceCapability } from '@/utils/performanceUtils';

// Define metric types
export type MetricType = 
  | 'render' 
  | 'interaction' 
  | 'load' 
  | 'memory' 
  | 'network' 
  | 'resource' 
  | 'javascript' 
  | 'css' 
  | 'animation' 
  | 'metric' 
  | 'summary' 
  | 'performance' 
  | 'webVital';

export interface PerformanceMetric {
  component_name?: string;
  metric_name: string;
  value: number;
  timestamp: string | number;
  category: string;
  type: MetricType;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  metadata?: Record<string, any>;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

// Event types for the metrics collector
type CollectorEvent = 'flush' | 'collect' | 'error';
type FlushCallback = (metrics: PerformanceMetric[]) => void;
type CollectCallback = (metric: PerformanceMetric) => void;
type ErrorCallback = (error: Error) => void;

/**
 * Service for collecting application performance metrics
 */
class MetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean = true;
  private autoFlushInterval: number = 30000; // 30 seconds
  private autoFlushTimer: number | null = null;
  private events: Record<CollectorEvent, Function[]> = {
    flush: [],
    collect: [],
    error: []
  };
  
  constructor() {
    this.setupAutoFlush();
    
    // Set up page visibility handler for flushing on page hide
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
  
  /**
   * Add a metric to the collection
   */
  public collect(
    metricName: string,
    value: number,
    type: MetricType = 'metric',
    metadata?: Record<string, any>,
    componentName?: string
  ): void {
    if (!this.isEnabled) return;
    
    try {
      const metric: PerformanceMetric = {
        metric_name: metricName,
        value,
        timestamp: Date.now(),
        category: componentName ? 'component' : 'application',
        type,
        component_name: componentName,
        metadata
      };
      
      this.metrics.push(metric);
      this.triggerEvent('collect', metric);
    } catch (err) {
      this.handleError(err as Error);
    }
  }
  
  /**
   * Track a component-specific metric
   */
  public trackComponentMetric(
    componentName: string,
    metricName: string,
    value: number,
    type: MetricType = 'render'
  ): void {
    this.collect(metricName, value, type, undefined, componentName);
  }
  
  /**
   * Track an interaction metric
   */
  public trackInteraction(
    name: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    this.collect(name, duration, 'interaction', metadata);
  }
  
  /**
   * Flush metrics to handlers
   */
  public async flush(): Promise<void> {
    if (this.metrics.length === 0) return;
    
    try {
      const metricsToFlush = [...this.metrics];
      this.metrics = [];
      
      this.triggerEvent('flush', metricsToFlush);
    } catch (err) {
      this.handleError(err as Error);
    }
  }
  
  /**
   * Enable or disable the collector
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (enabled) {
      this.setupAutoFlush();
    } else if (this.autoFlushTimer !== null) {
      window.clearInterval(this.autoFlushTimer);
      this.autoFlushTimer = null;
    }
  }
  
  /**
   * Set the auto-flush interval
   */
  public setAutoFlushInterval(intervalMs: number): void {
    this.autoFlushInterval = intervalMs;
    this.setupAutoFlush();
  }
  
  /**
   * Set the sampling rate (0-1) for metrics collection
   */
  public setSamplingRate(rate: number): void {
    // Implementation will determine whether to collect metrics
    // based on this rate (e.g., if rate is 0.1, only 10% of metrics are collected)
  }
  
  /**
   * Register a callback for the flush event
   */
  public onFlush(callback: FlushCallback): () => void {
    return this.addEventListener('flush', callback);
  }
  
  /**
   * Register a callback for the collect event
   */
  public onCollect(callback: CollectCallback): () => void {
    return this.addEventListener('collect', callback);
  }
  
  /**
   * Register a callback for the error event
   */
  public onError(callback: ErrorCallback): () => void {
    return this.addEventListener('error', callback);
  }
  
  /**
   * Clear all metrics without flushing
   */
  public clear(): void {
    this.metrics = [];
  }
  
  /**
   * Get the count of collected metrics
   */
  public getCount(): number {
    return this.metrics.length;
  }
  
  /**
   * Add a web vital metric
   */
  public addWebVital(
    name: string,
    value: number, 
    category: 'loading' | 'interaction' | 'visual_stability',
  ): void {
    this.collect(name, value, 'webVital', { webVitalCategory: category });
  }
  
  /**
   * Add a general metric
   */
  public addMetric(metric: Partial<PerformanceMetric>): void {
    if (!metric.metric_name || typeof metric.value !== 'number') {
      console.error('Invalid metric:', metric);
      return;
    }
    
    this.metrics.push({
      metric_name: metric.metric_name,
      value: metric.value,
      timestamp: metric.timestamp || Date.now(),
      category: metric.category || 'application',
      type: metric.type || 'metric',
      component_name: metric.component_name,
      metadata: metric.metadata
    });
  }
  
  /**
   * Handle document visibility change
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      // When the page is hidden, flush metrics immediately
      void this.flush();
    }
  };
  
  /**
   * Handle errors in the collector
   */
  private handleError(error: Error): void {
    console.error('Metrics collector error:', error);
    this.triggerEvent('error', error);
  }
  
  /**
   * Add an event listener
   */
  private addEventListener(event: CollectorEvent, callback: Function): () => void {
    this.events[event].push(callback);
    
    // Return a function to remove the listener
    return () => {
      const index = this.events[event].indexOf(callback);
      if (index !== -1) {
        this.events[event].splice(index, 1);
      }
    };
  }
  
  /**
   * Trigger an event
   */
  private triggerEvent(event: CollectorEvent, ...args: any[]): void {
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (err) {
        console.error(`Error in ${event} callback:`, err);
      }
    });
  }
  
  /**
   * Set up auto-flush timer
   */
  private setupAutoFlush(): void {
    if (this.autoFlushTimer !== null) {
      window.clearInterval(this.autoFlushTimer);
    }
    
    if (this.isEnabled && typeof window !== 'undefined') {
      this.autoFlushTimer = window.setInterval(() => {
        void this.flush();
      }, this.autoFlushInterval);
    }
  }
}

// Create and export a singleton instance
export const metricsCollector = new MetricsCollector();

// Export the class for testing or custom instances
export default metricsCollector;
