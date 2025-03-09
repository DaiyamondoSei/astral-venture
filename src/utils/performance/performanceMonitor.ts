/**
 * Performance Monitor Utility - Optimized Version
 * 
 * Tracks component render times, memory usage, and other performance metrics
 * with minimal overhead
 */

// Basic performance metrics interface
export interface PerformanceMetrics {
  componentName: string;
  renderTimes: number[];
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
  events: Array<{
    time: number;
    type: string;
    data?: any;
  }>;
  componentStats?: Record<string, {
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
  fps?: number;
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
  private notifyThrottle: number = 1000; // Increased from 100ms to 1000ms
  private isEnabled: boolean = process.env.NODE_ENV === 'development';
  private maxTrackedComponents: number = 20; // Limit total tracked components
  
  constructor() {
    // Only initialize in development mode
    if (this.isEnabled) {
      this.trackMemoryUsage();
      
      // Auto-cleanup every minute to prevent memory issues
      setInterval(() => this.cleanupOldMetrics(), 60000);
    }
  }
  
  /**
   * Record a component render
   */
  public recordRender(componentName: string, duration: number): void {
    if (!this.isEnabled) return;
    this.updateMetrics(componentName, duration);
  }
  
  /**
   * Record a batch of component renders efficiently
   */
  public recordRenderBatch(componentName: string, renders: Array<{time: number, duration: number}>): void {
    if (!this.isEnabled || !renders.length) return;
    
    // Get or create metrics for this component
    if (!this.metrics[componentName]) {
      // Check if we've reached max components
      if (Object.keys(this.metrics).length >= this.maxTrackedComponents) {
        // Remove the least recently updated component
        const oldestComponent = Object.entries(this.metrics)
          .sort(([, a], [, b]) => (a.lastUpdated || 0) - (b.lastUpdated || 0))[0][0];
        delete this.metrics[oldestComponent];
      }
      
      this.metrics[componentName] = {
        componentName,
        renderTimes: [],
        events: [],
        averageRenderTime: 0,
        insights: [],
        renderTimeline: []
      };
    }
    
    const metrics = this.metrics[componentName];
    const renderTimes = metrics.renderTimes || [];
    const renderTimeline = metrics.renderTimeline || [];
    
    // Process all renders efficiently in a single batch
    let totalDuration = 0;
    
    // Only process the most recent renders to save memory
    const recentRenders = renders.slice(-5); // Only use last 5 renders
    
    recentRenders.forEach(render => {
      // Add render time
      renderTimes.push(render.duration);
      totalDuration += render.duration;
      
      // Only keep last 20 render times (reduced from 100)
      if (renderTimes.length > 20) {
        renderTimes.shift();
      }
      
      // Add to timeline (limit to avoid memory issues)
      if (renderTimeline.length < 20) { // Reduced from 50
        renderTimeline.push({
          component: componentName,
          startTime: render.time - render.duration,
          endTime: render.time,
          duration: render.duration
        });
      }
    });
    
    // Only keep last 20 timeline entries
    if (renderTimeline.length > 20) { // Reduced from 50
      renderTimeline.splice(0, renderTimeline.length - 20);
    }
    
    // Update average once for the batch
    const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    
    // Update metrics in one go
    this.metrics[componentName] = {
      ...metrics,
      renderTimes,
      lastRenderTime: recentRenders[recentRenders.length - 1].duration,
      averageRenderTime,
      renderTimeline,
      lastUpdated: Date.now()
    };
    
    // Throttled notification of listeners
    this.throttledNotify();
  }
  
  // Private method to handle metric updates
  private updateMetrics(componentName: string, duration: number): void {
    if (!this.isEnabled) return;
    
    if (!this.metrics[componentName]) {
      // Check if we've reached max components
      if (Object.keys(this.metrics).length >= this.maxTrackedComponents) {
        // Remove the least recently updated component
        const oldestComponent = Object.entries(this.metrics)
          .sort(([, a], [, b]) => (a.lastUpdated || 0) - (b.lastUpdated || 0))[0][0];
        delete this.metrics[oldestComponent];
      }
      
      this.metrics[componentName] = {
        componentName,
        renderTimes: [],
        events: [],
        averageRenderTime: 0,
        insights: [],
        renderTimeline: []
      };
    }
    
    // Add render time
    const renderTimes = this.metrics[componentName].renderTimes || [];
    renderTimes.push(duration);
    
    // Only keep last 20 render times (reduced from 100)
    if (renderTimes.length > 20) {
      renderTimes.shift();
    }
    
    // Update average
    const averageRenderTime = 
      renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    
    // Add to timeline
    const renderTimeline = this.metrics[componentName].renderTimeline || [];
    const now = performance.now();
    
    // Only keep recent timeline to avoid memory issues
    if (renderTimeline.length < 20) { // Reduced from 50
      renderTimeline.push({
        component: componentName,
        startTime: now - duration,
        endTime: now,
        duration
      });
    }
    
    // Update metrics
    this.metrics[componentName] = {
      ...this.metrics[componentName],
      renderTimes,
      lastRenderTime: duration,
      averageRenderTime,
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
    if (!this.isEnabled) return;
    
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
   * Clean up old metrics to prevent memory issues
   */
  private cleanupOldMetrics(): void {
    if (!this.isEnabled) return;
    
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    // Remove components that haven't been updated in 10 minutes
    Object.keys(this.metrics).forEach(componentName => {
      const lastUpdated = this.metrics[componentName].lastUpdated || 0;
      if (now - lastUpdated > maxAge) {
        delete this.metrics[componentName];
      }
    });
    
    // If we still have too many components, keep only the most recently updated ones
    if (Object.keys(this.metrics).length > this.maxTrackedComponents) {
      const componentsToKeep = Object.entries(this.metrics)
        .sort(([, a], [, b]) => (b.lastUpdated || 0) - (a.lastUpdated || 0))
        .slice(0, this.maxTrackedComponents)
        .map(([componentName]) => componentName);
      
      const newMetrics: Record<string, Partial<PerformanceMetrics>> = {};
      componentsToKeep.forEach(componentName => {
        newMetrics[componentName] = this.metrics[componentName];
      });
      
      this.metrics = newMetrics;
    }
    
    // Notify listeners of the cleanup
    this.throttledNotify();
  }
  
  /**
   * Record a component unmount
   */
  public recordUnmount(componentName: string): void {
    if (!this.isEnabled || !this.metrics[componentName]) return;
    
    // Just update the last update time
    this.metrics[componentName].lastUpdated = Date.now();
  }
  
  /**
   * Get metrics for a specific component
   */
  public getComponentMetrics(componentName: string): Partial<PerformanceMetrics> {
    if (!this.isEnabled) return { componentName };
    return this.metrics[componentName] || { componentName };
  }
  
  /**
   * Get all performance metrics
   */
  public getAllMetrics(): Record<string, Partial<PerformanceMetrics>> {
    if (!this.isEnabled) return {};
    return { ...this.metrics };
  }
  
  /**
   * Track memory usage if available in the browser
   */
  private trackMemoryUsage(): void {
    if (!this.isEnabled) return;
    
    const extendedPerformance = performance as ExtendedPerformance;
    
    if (typeof extendedPerformance === 'undefined' || 
        !extendedPerformance.memory) {
      return;
    }
    
    // Update less frequently - every 10 seconds (instead of 5)
    setInterval(() => {
      if (!this.isEnabled) return;
      
      const memory = extendedPerformance.memory;
      
      if (!memory) return;
      
      // Only update for the most actively used components to reduce overhead
      const now = Date.now();
      const activeComponents = Object.keys(this.metrics)
        .filter(comp => 
          this.metrics[comp].lastUpdated && 
          (now - (this.metrics[comp].lastUpdated || 0)) < 60000 && // 1 minute (reduced from 30 sec)
          (this.metrics[comp].renderTimes?.length || 0) > 5 // Has been rendered at least 5 times
        )
        .slice(0, 5); // Only update top 5 active components
      
      if (activeComponents.length === 0) return;
      
      // Share memory data across all components to reduce redundancy
      const memoryData = {
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize
      };
      
      activeComponents.forEach(componentName => {
        this.metrics[componentName].memoryUsage = memoryData;
      });
      
      // Only notify if we updated components
      this.throttledNotify();
    }, 10000); // Every 10 seconds (doubled from 5)
  }
  
  /**
   * Subscribe to metrics updates
   */
  public subscribe(callback: (metrics: Record<string, Partial<PerformanceMetrics>>) => void): () => void {
    if (!this.isEnabled) return () => {};
    
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
  
  /**
   * Notify all listeners of metrics updates
   */
  private notifyListeners(): void {
    if (!this.isEnabled || this.listeners.length === 0) return;
    
    const metricsSnapshot = this.getAllMetrics();
    this.listeners.forEach(listener => listener(metricsSnapshot));
  }
  
  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = {};
    if (this.isEnabled) {
      this.notifyListeners();
    }
  }
  
  /**
   * Add a performance insight for a component
   */
  public addInsight(componentName: string, insight: string): void {
    if (!this.isEnabled) return;
    
    if (!this.metrics[componentName]) {
      this.recordRender(componentName, 0); // Create metrics entry if it doesn't exist
    }
    
    const insights = this.metrics[componentName].insights || [];
    
    // Don't add duplicate insights
    if (!insights.includes(insight)) {
      insights.push(insight);
      
      // Only keep last 5 insights (reduced from 10)
      if (insights.length > 5) {
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
    if (!this.isEnabled) return 0;
    
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
    if (!this.isEnabled) return {
      componentsCount: 0,
      totalRenderCount: 0,
      totalRenderTime: 0,
      lastUpdated: 0
    };
    
    const componentsCount = Object.keys(this.metrics).length;
    const totalRenderCount = Object.values(this.metrics).reduce(
      (sum, metric) => sum + (metric.renderTimes?.length || 0), 0
    );
    
    return {
      componentsCount,
      totalRenderCount,
      totalRenderTime: this.totalRenderTime,
      lastUpdated: Math.max(
        0,
        ...Object.values(this.metrics)
          .map(m => m.lastUpdated || 0)
          .filter(Boolean)
      )
    };
  }
  
  /**
   * Enable or disable the monitor
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled && process.env.NODE_ENV === 'development';
    
    // If disabling, clear all data
    if (!this.isEnabled) {
      this.clearMetrics();
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// If in production, disable the monitor immediately
if (process.env.NODE_ENV !== 'development') {
  performanceMonitor.setEnabled(false);
}
