
/**
 * Metrics Collector
 * 
 * Service for collecting and buffering performance metrics.
 */
import { PerformanceMetric, MetricType } from '../core/types';

// Event types for the metrics collector
type CollectorEvent = 'flush' | 'collect' | 'error';
type FlushCallback = (metrics: PerformanceMetric[]) => void;
type CollectCallback = (metric: PerformanceMetric) => void;
type ErrorCallback = (error: Error) => void;

/**
 * Service for collecting performance metrics
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
