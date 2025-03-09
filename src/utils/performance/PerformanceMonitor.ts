
import { ComponentMetrics } from '@/services/ai/types';

/**
 * Lightweight PerformanceMonitor class for tracking component render times
 */
export class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics> = new Map();
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
    
    // Track slow renders
    if (renderTime > this.renderThreshold) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
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
   * Reset all metrics
   */
  public resetMetrics(): void {
    this.metrics.clear();
  }
}

// Create and export a singleton instance for consistent monitoring
export const performanceMonitor = new PerformanceMonitor();

// Export the singleton for use throughout the application
export default performanceMonitor;
