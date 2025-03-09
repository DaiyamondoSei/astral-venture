
import { ComponentMetrics } from '@/services/ai/types';

/**
 * PerformanceMonitor class for tracking component render times and performance metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics> = new Map();
  private subscribers: Array<(metrics: Map<string, ComponentMetrics>) => void> = [];
  private isMonitoring: boolean = false;
  private renderThreshold: number = 16; // Default threshold in ms (60fps)
  
  /**
   * Start monitoring component performance
   */
  public startMonitoring(): void {
    this.isMonitoring = true;
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
        lastRenderTime: now,
        firstRenderTime: existing.firstRenderTime
      });
    } else {
      this.metrics.set(componentName, {
        componentName,
        renderCount: 1,
        totalRenderTime: renderTime,
        averageRenderTime: renderTime,
        lastRenderTime: now,
        firstRenderTime: now
      });
    }
    
    // Notify subscribers of the update
    this.notifySubscribers();
    
    // Log slow renders
    if (renderTime > this.renderThreshold) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
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
const performanceMonitor = new PerformanceMonitor();

// Export the class and the singleton
export { performanceMonitor };
export default performanceMonitor;
