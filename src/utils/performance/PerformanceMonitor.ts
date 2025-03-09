/**
 * Performance monitoring utility for tracking render times and performance metrics
 */

export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  renderTimes: number[];
  averageRenderTime: number;
  maxRenderTime: number;
  lastRenderTime: number;
  slowRenders: number;
}

export interface PerformanceMetrics {
  components: Record<string, ComponentMetrics>;
  queuedMetrics: any[];
  sessionStartTime: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    components: {},
    queuedMetrics: [],
    sessionStartTime: Date.now()
  };
  private isMonitoring = false;
  private subscribers: ((metrics: Record<string, ComponentMetrics>) => void)[] = [];

  constructor() {
    // Initialize metrics
    this.resetMetrics();
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    this.isMonitoring = true;
    console.log('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('Performance monitoring stopped');
  }

  /**
   * Record component render time
   */
  public recordRender(componentName: string, renderTime: number): void {
    if (!this.isMonitoring) return;

    const threshold = 16; // 16ms = 60fps threshold
    const metrics = this.metrics.components[componentName] || {
      componentName,
      renderCount: 0,
      renderTimes: [],
      averageRenderTime: 0,
      maxRenderTime: 0,
      lastRenderTime: 0,
      slowRenders: 0
    };

    // Update metrics
    metrics.renderCount++;
    metrics.renderTimes.push(renderTime);
    metrics.lastRenderTime = renderTime;
    
    // Keep only the last 10 render times to avoid memory issues
    if (metrics.renderTimes.length > 10) {
      metrics.renderTimes.shift();
    }
    
    // Calculate average
    metrics.averageRenderTime = metrics.renderTimes.reduce((a, b) => a + b, 0) / metrics.renderTimes.length;
    
    // Track max render time
    metrics.maxRenderTime = Math.max(metrics.maxRenderTime, renderTime);
    
    // Track slow renders
    if (renderTime > threshold) {
      metrics.slowRenders++;
    }

    // Update metrics in the store
    this.metrics.components[componentName] = metrics;

    // Add to queue for server reporting
    this.metrics.queuedMetrics.push({
      componentName,
      renderTime,
      timestamp: Date.now()
    });

    // Notify subscribers
    this.notifySubscribers();
  }

  /**
   * Record component unmount
   */
  public recordUnmount(componentName: string): void {
    // Currently just logging, could do more
    if (this.isMonitoring) {
      console.debug(`Component ${componentName} unmounted`);
    }
  }
  
  /**
   * Record batch of renders efficiently
   */
  public recordRenderBatch(componentName: string, renders: {time: number, duration: number}[]): void {
    if (!this.isMonitoring || renders.length === 0) return;
    
    // Process all render times in a batch
    const totalTime = renders.reduce((sum, item) => sum + item.duration, 0);
    const avgTime = totalTime / renders.length;
    
    // Record a single aggregated render
    this.recordRender(componentName, avgTime);
    
    // Add individual entries to the queue with lower priority
    for (const render of renders) {
      this.metrics.queuedMetrics.push({
        componentName,
        renderTime: render.duration,
        timestamp: render.time,
        isBatch: true
      });
    }
  }

  /**
   * Get component metrics
   */
  public getComponentMetrics(componentName?: string): any {
    if (componentName) {
      return this.metrics.components[componentName] || null;
    }
    return this.metrics.components;
  }

  /**
   * Get all metrics
   */
  public getAllMetrics(): Record<string, ComponentMetrics> {
    return this.metrics.components;
  }
  
  /**
   * Get raw metrics object
   */
  public getMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  /**
   * Reset all metrics
   */
  public clearMetrics(): void {
    this.resetMetrics();
    this.notifySubscribers();
  }

  /**
   * Subscribe to metrics updates
   */
  public subscribe(callback: (metrics: Record<string, ComponentMetrics>) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Initialize metrics
   */
  private resetMetrics(): void {
    this.metrics = {
      components: {},
      queuedMetrics: [],
      sessionStartTime: Date.now()
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      subscriber(this.metrics.components);
    }
  }
}
