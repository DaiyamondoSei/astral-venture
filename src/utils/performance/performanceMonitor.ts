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

class PerformanceMonitor {
  private metrics: Record<string, Partial<PerformanceMetrics>> = {};
  private listeners: Array<(metrics: Record<string, Partial<PerformanceMetrics>>) => void> = [];
  
  constructor() {
    // Initialize memory tracking if available
    this.trackMemoryUsage();
  }
  
  /**
   * Record a component render
   */
  public recordRender(componentName: string, duration: number): void {
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
    
    // Notify listeners
    this.notifyListeners();
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
    if (typeof performance === 'undefined' || 
        !performance.memory) {
      return;
    }
    
    // Update every 2 seconds
    setInterval(() => {
      const memory = performance.memory;
      
      if (!memory) return;
      
      for (const componentName in this.metrics) {
        this.metrics[componentName].memoryUsage = {
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize
        };
      }
      
      this.notifyListeners();
    }, 2000);
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
    insights.push(insight);
    
    // Only keep last 10 insights
    if (insights.length > 10) {
      insights.shift();
    }
    
    this.metrics[componentName].insights = insights;
    this.notifyListeners();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
