/**
 * Performance Monitor Utility
 * 
 * Tracks component render times, memory usage, and other performance metrics
 */

// Basic performance metrics interface
export interface PerformanceMetrics {
  componentName: string;
  renderTimes: number[];
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
  events: Array<{
    time: number;
    type: string;
    data?: any;
  }>;
  componentStats: Record<string, {
    count: number;
    total: number;
    average: number;
    max: number;
  }>;
  insights: string[];
  renderTimeline: Array<{
    component: string;
    startTime: number;
    endTime: number;
    duration: number;
  }>;
  fps: number;
  lastUpdated: number;
}

// Extend Performance interface to include memory property
interface ExtendedPerformance extends Performance {
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}

class PerformanceMonitor {
  private metrics: Record<string, Partial<PerformanceMetrics>> = {};
  private listeners: Array<(metrics: Record<string, Partial<PerformanceMetrics>>) => void> = [];
  private pendingUpdates: boolean = false;
  private lastNotifyTime: number = 0;
  private notifyThrottle: number = 100; // ms
  
  constructor() {
    // Initialize memory tracking if available
    this.trackMemoryUsage();
  }
  
  /**
   * Record a component render
   */
  public recordRender(componentName: string, duration: number): void {
    this.updateMetrics(componentName, duration);
  }
  
  /**
   * Record a batch of component renders efficiently
   */
  public recordRenderBatch(componentName: string, renders: Array<{time: number, duration: number}>): void {
    if (!renders.length) return;
    
    // Get or create metrics for this component
    if (!this.metrics[componentName]) {
      this.metrics[componentName] = {
        componentName,
        renderTimes: [],
        events: [],
        averageRenderTime: 0,
        insights: [],
        componentStats: {},
        renderTimeline: []
      };
    }
    
    const metrics = this.metrics[componentName];
    const renderTimes = metrics.renderTimes || [];
    const events = metrics.events || [];
    const renderTimeline = metrics.renderTimeline || [];
    
    // Process all renders efficiently in a single batch
    let totalDuration = 0;
    
    renders.forEach(render => {
      // Add render time
      renderTimes.push(render.duration);
      totalDuration += render.duration;
      
      // Only keep last 100 render times
      if (renderTimes.length > 100) {
        renderTimes.shift();
      }
      
      // Add event (but limit to avoid memory issues)
      if (events.length < 50) {
        events.push({
          time: render.time,
          type: 'render',
          data: { duration: render.duration }
        });
      }
      
      // Add to timeline (limit to avoid memory issues)
      if (renderTimeline.length < 50) {
        renderTimeline.push({
          component: componentName,
          startTime: render.time - render.duration,
          endTime: render.time,
          duration: render.duration
        });
      }
    });
    
    // Only keep last 50 timeline entries
    if (renderTimeline.length > 50) {
      renderTimeline.splice(0, renderTimeline.length - 50);
    }
    
    // Update average once for the batch
    const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    
    // Update metrics in one go
    this.metrics[componentName] = {
      ...metrics,
      renderTimes,
      lastRenderTime: renders[renders.length - 1].duration,
      averageRenderTime,
      events,
      renderTimeline,
      lastUpdated: Date.now()
    };
    
    // Throttled notification of listeners
    this.throttledNotify();
  }
  
  // Private method to handle metric updates
  private updateMetrics(componentName: string, duration: number): void {
    if (!this.metrics[componentName]) {
      this.metrics[componentName] = {
        componentName,
        renderTimes: [],
        events: [],
        averageRenderTime: 0,
        insights: [],
        componentStats: {},
        renderTimeline: []
      };
    }
    
    // Add render time
    const renderTimes = this.metrics[componentName].renderTimes || [];
    renderTimes.push(duration);
    
    // Only keep last 100 render times
    if (renderTimes.length > 100) {
      renderTimes.shift();
    }
    
    // Update average
    const averageRenderTime = 
      renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    
    // Add event
    const events = this.metrics[componentName].events || [];
    events.push({
      time: Date.now(),
      type: 'render',
      data: { duration }
    });
    
    // Add to timeline
    const renderTimeline = this.metrics[componentName].renderTimeline || [];
    const now = performance.now();
    renderTimeline.push({
      component: componentName,
      startTime: now - duration,
      endTime: now,
      duration
    });
    
    // Only keep last 50 timeline entries
    if (renderTimeline.length > 50) {
      renderTimeline.shift();
    }
    
    // Update metrics
    this.metrics[componentName] = {
      ...this.metrics[componentName],
      renderTimes,
      lastRenderTime: duration,
      averageRenderTime,
      events,
      renderTimeline,
      lastUpdated: Date.now()
    };
    
    // Throttled notification of listeners
    this.throttledNotify();
  }
  
  /**
   * Throttle UI updates to reduce performance impact
   */
  private throttledNotify(): void {
    const now = Date.now();
    
    // If we already have a pending update, don't schedule another one
    if (this.pendingUpdates) return;
    
    // If we recently notified, schedule a delayed update
    if (now - this.lastNotifyTime < this.notifyThrottle) {
      this.pendingUpdates = true;
      
      setTimeout(() => {
        this.notifyListeners();
        this.pendingUpdates = false;
        this.lastNotifyTime = Date.now();
      }, this.notifyThrottle);
    } else {
      // Otherwise update immediately
      this.notifyListeners();
      this.lastNotifyTime = now;
    }
  }
  
  /**
   * Record a component unmount
   */
  public recordUnmount(componentName: string): void {
    if (!this.metrics[componentName]) return;
    
    const events = this.metrics[componentName].events || [];
    events.push({
      time: Date.now(),
      type: 'unmount'
    });
    
    this.metrics[componentName].events = events;
    this.notifyListeners();
  }
  
  /**
   * Get metrics for a specific component
   */
  public getComponentMetrics(componentName: string): Partial<PerformanceMetrics> {
    return this.metrics[componentName] || { componentName };
  }
  
  /**
   * Get all performance metrics
   */
  public getAllMetrics(): Record<string, Partial<PerformanceMetrics>> {
    return { ...this.metrics };
  }
  
  /**
   * Track memory usage if available in the browser
   */
  private trackMemoryUsage(): void {
    const extendedPerformance = performance as ExtendedPerformance;
    
    if (typeof extendedPerformance === 'undefined' || 
        !extendedPerformance.memory) {
      return;
    }
    
    // Update every 5 seconds instead of 2 for less overhead
    setInterval(() => {
      const memory = extendedPerformance.memory;
      
      if (!memory) return;
      
      // Only update components that were actually rendered recently
      const now = Date.now();
      const recentComponents = Object.keys(this.metrics).filter(
        comp => this.metrics[comp].lastUpdated && 
               (now - (this.metrics[comp].lastUpdated || 0)) < 30000 // 30 seconds
      );
      
      recentComponents.forEach(componentName => {
        this.metrics[componentName].memoryUsage = {
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize
        };
      });
      
      // Only notify if we have recent components
      if (recentComponents.length) {
        this.throttledNotify();
      }
    }, 5000); // Less frequent updates
  }
  
  /**
   * Subscribe to metrics updates
   */
  public subscribe(callback: (metrics: Record<string, Partial<PerformanceMetrics>>) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
  
  /**
   * Notify all listeners of metrics updates
   */
  private notifyListeners(): void {
    const metricsSnapshot = this.getAllMetrics();
    this.listeners.forEach(listener => listener(metricsSnapshot));
  }
  
  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = {};
    this.notifyListeners();
  }
  
  /**
   * Add a performance insight for a component
   */
  public addInsight(componentName: string, insight: string): void {
    if (!this.metrics[componentName]) {
      this.recordRender(componentName, 0); // Create metrics entry if it doesn't exist
    }
    
    const insights = this.metrics[componentName].insights || [];
    
    // Don't add duplicate insights
    if (!insights.includes(insight)) {
      insights.push(insight);
      
      // Only keep last 10 insights
      if (insights.length > 10) {
        insights.shift();
      }
      
      this.metrics[componentName].insights = insights;
      this.throttledNotify();
    }
  }
  
  /**
   * Get total render time across all tracked components
   */
  public get totalRenderTime(): number {
    return Object.values(this.metrics).reduce((sum, metric) => {
      const renderCount = metric.renderTimes?.length || 0;
      const avgTime = metric.averageRenderTime || 0;
      return sum + (renderCount * avgTime);
    }, 0);
  }
  
  /**
   * Get metrics formatted for visualization tools
   */
  public getMetrics() {
    const componentsCount = Object.keys(this.metrics).length;
    const totalRenderCount = Object.values(this.metrics).reduce(
      (sum, metric) => sum + (metric.renderTimes?.length || 0), 0
    );
    
    return {
      componentsCount,
      totalRenderCount,
      totalRenderTime: this.totalRenderTime,
      lastUpdated: Math.max(...Object.values(this.metrics)
        .map(m => m.lastUpdated || 0)
        .filter(Boolean)
      )
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
