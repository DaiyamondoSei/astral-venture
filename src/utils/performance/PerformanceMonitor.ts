import { ComponentMetrics } from '@/services/ai/types';

/**
 * PerformanceMonitor class for tracking component render times and performance metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics> = new Map();
  private subscribers: Array<(metrics: Map<string, ComponentMetrics>) => void> = [];
  private isMonitoring: boolean = false;
  private renderThreshold: number = 16; // Default threshold in ms (60fps)
  private slowComponentCounts: Map<string, number> = new Map();
  private frameMetrics: { timestamp: number, fps: number }[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private memorySnapshots: { timestamp: number, usage: number }[] = [];
  
  /**
   * Start monitoring component performance
   */
  public startMonitoring(): void {
    this.isMonitoring = true;
    this.trackFrameRate();
    this.trackMemoryUsage();
    console.log("Performance monitoring started");
  }
  
  /**
   * Stop monitoring component performance
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log("Performance monitoring stopped");
  }
  
  /**
   * Record a component render event
   * @param componentName The name of the component that rendered
   * @param renderTime The time it took to render in milliseconds
   */
  public recordRender(componentName: string, renderTime: number): void {
    if (!this.isMonitoring) return;
    
    const existing = this.metrics.get(componentName);
    const now = performance.now();
    
    if (existing) {
      const totalTime = existing.totalRenderTime + renderTime;
      const renderCount = existing.renderCount + 1;
      
      this.metrics.set(componentName, {
        componentName,
        renderCount,
        totalRenderTime: totalTime,
        averageRenderTime: totalTime / renderCount,
        lastRenderTime: renderTime,
        firstRenderTime: existing.firstRenderTime
      });
    } else {
      this.metrics.set(componentName, {
        componentName,
        renderCount: 1,
        totalRenderTime: renderTime,
        averageRenderTime: renderTime,
        lastRenderTime: renderTime,
        firstRenderTime: now
      });
    }
    
    // Notify subscribers of the update
    this.notifySubscribers();
    
    // Track slow renders
    if (renderTime > this.renderThreshold) {
      const count = (this.slowComponentCounts.get(componentName) || 0) + 1;
      this.slowComponentCounts.set(componentName, count);
      
      if (count % 5 === 0) { // Log every 5th slow render to avoid console spam
        console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms (${count} times)`);
      }
    }
  }
  
  /**
   * Record a batch of component renders
   * @param componentName The name of the component that rendered
   * @param renderTimes Array of render times in milliseconds
   */
  public recordRenderBatch(componentName: string, renderTimes: number[]): void {
    if (!this.isMonitoring || renderTimes.length === 0) return;
    
    const totalBatchTime = renderTimes.reduce((sum, time) => sum + time, 0);
    this.recordRender(componentName, totalBatchTime / renderTimes.length);
  }
  
  /**
   * Record a component unmount event
   * @param componentName The name of the component that unmounted
   */
  public recordUnmount(componentName: string): void {
    if (!this.isMonitoring) return;
    
    // Currently just logging, could be extended to track lifecycle metrics
    console.log(`Component unmounted: ${componentName}`);
  }
  
  /**
   * Report a slow render to the performance monitoring system
   * This could be extended to send data to an analytics service
   */
  public reportSlowRender(componentName: string, renderTime: number): void {
    // This would be implemented with actual analytics in production
    console.warn(`Reporting slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
  }
  
  /**
   * Get metrics for a specific component
   * @param componentName The name of the component
   * @returns The component metrics or null if not found
   */
  public getComponentMetrics(componentName: string): ComponentMetrics | null {
    return this.metrics.get(componentName) || null;
  }
  
  /**
   * Get all metrics
   * @returns All component metrics
   */
  public getMetrics(): Array<ComponentMetrics> {
    return Array.from(this.metrics.values());
  }
  
  /**
   * Get sorted metrics for the slowest components
   * @param limit Maximum number of components to return
   * @returns Sorted array of component metrics
   */
  public getSlowestComponents(limit: number = 10): Array<ComponentMetrics> {
    return Array.from(this.metrics.values())
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, limit);
  }
  
  /**
   * Get the current FPS (frames per second)
   * @returns The current FPS or 0 if not available
   */
  public getCurrentFPS(): number {
    if (this.frameMetrics.length === 0) return 0;
    return this.frameMetrics[this.frameMetrics.length - 1].fps;
  }
  
  /**
   * Get memory usage history
   * @returns Array of memory usage snapshots
   */
  public getMemoryUsage(): Array<{ timestamp: number, usage: number }> {
    return this.memorySnapshots;
  }
  
  /**
   * Set the render time threshold for slow render warnings
   * @param thresholdMs The threshold in milliseconds
   */
  public setRenderThreshold(thresholdMs: number): void {
    this.renderThreshold = thresholdMs;
  }
  
  /**
   * Reset all metrics
   */
  public resetMetrics(): void {
    this.metrics.clear();
    this.slowComponentCounts.clear();
    this.frameMetrics = [];
    this.memorySnapshots = [];
    this.notifySubscribers();
  }
  
  /**
   * Subscribe to metrics updates
   * @param callback The callback to be called when metrics update
   * @returns A function to unsubscribe
   */
  public subscribe(callback: (metrics: Map<string, ComponentMetrics>) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Track frame rate using requestAnimationFrame
   */
  private trackFrameRate(): void {
    if (!this.isMonitoring) return;
    
    const trackFrame = (timestamp: number) => {
      this.frameCount++;
      
      // Calculate FPS every second
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = timestamp;
      } else if (timestamp - this.lastFrameTime >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFrameTime));
        this.frameMetrics.push({ timestamp, fps });
        
        // Keep only the last 60 seconds of data
        if (this.frameMetrics.length > 60) {
          this.frameMetrics.shift();
        }
        
        this.frameCount = 0;
        this.lastFrameTime = timestamp;
      }
      
      if (this.isMonitoring) {
        requestAnimationFrame(trackFrame);
      }
    };
    
    requestAnimationFrame(trackFrame);
  }
  
  /**
   * Track memory usage if available
   */
  private trackMemoryUsage(): void {
    if (!this.isMonitoring) return;
    
    // Check if memory API is available
    if ('performance' in window && 'memory' in (performance as any)) {
      const checkMemory = () => {
        if (!this.isMonitoring) return;
        
        const memory = (performance as any).memory;
        const usage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
        
        this.memorySnapshots.push({
          timestamp: performance.now(),
          usage
        });
        
        // Keep only the last 60 snapshots
        if (this.memorySnapshots.length > 60) {
          this.memorySnapshots.shift();
        }
        
        setTimeout(checkMemory, 5000); // Check every 5 seconds
      };
      
      checkMemory();
    }
  }
  
  /**
   * Notify all subscribers of metrics updates
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.error('Error in performance metrics subscriber:', error);
      }
    });
  }
}

// Create and export a singleton instance for consistent monitoring
export const performanceMonitor = new PerformanceMonitor();

// Export the singleton for use throughout the application
export default performanceMonitor;
