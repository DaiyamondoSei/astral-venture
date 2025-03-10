
/**
 * Performance monitoring singleton for tracking component render times
 * and other performance metrics across the application.
 */
import { ComponentMetrics, ComponentMetric, PerformanceMetric } from './types';

class PerformanceMonitor {
  private metricsMap: Map<string, ComponentMetrics> = new Map();
  private isMonitoring: boolean = false;
  private startTime: number = 0;
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();
  private config = {
    slowThreshold: 16, // 16ms = ~60fps
    logToConsole: false,
    logSlowRenders: true,
    trackMemory: false,
    deviceCapability: 'medium' as 'low' | 'medium' | 'high',
  };

  /**
   * Record a component render event
   * 
   * @param componentName Name of the component
   * @param renderTime Time taken to render in ms
   */
  recordRender(componentName: string, renderTime: number): void {
    if (!this.isMonitoring) return;
    
    const now = performance.now();
    const isSlow = renderTime > this.config.slowThreshold;
    
    // Log slow renders if enabled
    if (isSlow && this.config.logSlowRenders) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
    
    this.recordMetric(componentName, {
      renderTime,
      timestamp: now,
      type: 'render'
    });
    
    // Emit render event
    this.emit('render', { componentName, renderTime, timestamp: now });
  }

  /**
   * Record a component unmount event
   * 
   * @param componentName Name of the component
   */
  recordUnmount(componentName: string): void {
    if (!this.isMonitoring) return;
    this.emit('unmount', { componentName, timestamp: performance.now() });
  }

  /**
   * Record a generic performance event
   * 
   * @param type Type of event
   * @param name Name of the event
   * @param duration Duration of the event in ms
   * @param metadata Additional metadata
   */
  recordEvent(
    type: 'interaction' | 'load' | 'render',
    name: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.isMonitoring) return;
    
    this.recordMetric(name, {
      renderTime: duration,
      timestamp: performance.now(),
      type,
      metadata
    });
    
    this.emit('event', { type, name, duration, metadata });
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    this.isMonitoring = true;
    this.startTime = performance.now();
    this.emit('start', { timestamp: this.startTime });
    
    if (this.config.logToConsole) {
      console.info('Performance monitoring started');
    }
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    
    this.emit('stop', { 
      timestamp: endTime,
      duration,
      metrics: this.getMetricsSnapshot()
    });
    
    if (this.config.logToConsole) {
      console.info(`Performance monitoring stopped (ran for ${duration.toFixed(2)}ms)`);
    }
  }

  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.metricsMap.clear();
    this.emit('reset', { timestamp: performance.now() });
    
    if (this.config.logToConsole) {
      console.info('Performance metrics reset');
    }
  }

  /**
   * Get metrics for a specific component
   * 
   * @param componentName Name of the component
   */
  getComponentMetrics(componentName: string): ComponentMetrics | null {
    return this.metricsMap.get(componentName) || null;
  }

  /**
   * Get all component metrics
   */
  getAllMetrics(): Map<string, ComponentMetrics> {
    return new Map(this.metricsMap);
  }

  /**
   * Get metrics in a format suitable for visualization or storage
   */
  getMetricsSnapshot(): ComponentMetrics[] {
    return Array.from(this.metricsMap.values());
  }

  /**
   * Get the slowest components sorted by average render time
   * 
   * @param limit Maximum number of components to return
   */
  getSortedComponents(limit: number = 5): ComponentMetrics[] {
    return this.getMetricsSnapshot()
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, limit);
  }

  /**
   * Register an event listener
   * 
   * @param eventType Event type to listen for
   * @param callback Callback function
   */
  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Update configuration options
   * 
   * @param options Configuration options to update
   */
  updateConfig(options: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...options };
    this.emit('configUpdate', { config: this.config });
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Convert component metrics to database-compatible format
   */
  getMetricsForDatabase(): PerformanceMetric[] {
    return this.getMetricsSnapshot().map(metrics => ({
      component_name: metrics.componentName,
      average_render_time: metrics.averageRenderTime,
      total_renders: metrics.renderCount,
      slow_renders: metrics.slowRenderCount,
      last_render: new Date(metrics.lastRenderTimestamp).toISOString()
    }));
  }

  /**
   * Private: Record a metric for a component
   */
  private recordMetric(componentName: string, metric: ComponentMetric): void {
    let componentMetrics = this.metricsMap.get(componentName);
    
    if (!componentMetrics) {
      componentMetrics = {
        componentName,
        metrics: [],
        averageRenderTime: 0,
        renderCount: 0,
        slowRenderCount: 0,
        lastRenderTimestamp: 0
      };
      
      this.metricsMap.set(componentName, componentMetrics);
    }
    
    // Add the new metric
    componentMetrics.metrics.push(metric);
    componentMetrics.renderCount++;
    componentMetrics.lastRenderTimestamp = metric.timestamp;
    
    // Check if it's a slow render
    if (metric.renderTime > this.config.slowThreshold) {
      componentMetrics.slowRenderCount++;
    }
    
    // Recalculate average
    const totalTime = componentMetrics.metrics.reduce(
      (sum, m) => sum + m.renderTime, 0
    );
    
    componentMetrics.averageRenderTime = totalTime / componentMetrics.metrics.length;
  }

  /**
   * Private: Emit an event to all listeners
   */
  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in performance monitor event listener (${eventType}):`, error);
      }
    });
  }
}

// Export a singleton instance
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
