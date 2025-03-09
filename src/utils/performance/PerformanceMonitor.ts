/**
 * Performance monitoring utilities
 */

export interface PerformanceEntry {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

class PerformanceMonitor {
  private renderTimings: PerformanceEntry[] = [];
  private componentTracking: Map<string, { startTime: number }> = new Map();
  private isEnabled: boolean = true;
  
  /**
   * Enable or disable performance monitoring
   */
  enable(enable: boolean) {
    this.isEnabled = enable;
  }
  
  /**
   * Start tracking a component render
   */
  startTracking(componentName: string) {
    if (!this.isEnabled) return;
    
    this.componentTracking.set(componentName, {
      startTime: performance.now()
    });
  }
  
  /**
   * End tracking a component render and record metrics
   */
  endTracking(componentName: string) {
    if (!this.isEnabled) return;
    
    const tracking = this.componentTracking.get(componentName);
    if (tracking) {
      const renderTime = performance.now() - tracking.startTime;
      this.reportRender(componentName, renderTime);
      this.componentTracking.delete(componentName);
    }
  }
  
  /**
   * Report a component render with timing information
   */
  reportRender(componentName: string, renderTime: number) {
    if (!this.isEnabled) return;
    
    this.renderTimings.push({
      componentName,
      renderTime,
      timestamp: Date.now()
    });
    
    // Keep the last 1000 render timings
    if (this.renderTimings.length > 1000) {
      this.renderTimings.shift();
    }
    
    // Log slow renders
    if (renderTime > 16) {
      console.warn(`Slow render for ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }
  
  /**
   * Get render timings for a specific component
   */
  getComponentRenderTimings(componentName: string): PerformanceEntry[] {
    return this.renderTimings.filter(entry => entry.componentName === componentName);
  }
  
  /**
   * Get average render time for a component
   */
  getAverageRenderTime(componentName: string): number {
    const timings = this.getComponentRenderTimings(componentName);
    if (timings.length === 0) return 0;
    
    const sum = timings.reduce((total, entry) => total + entry.renderTime, 0);
    return sum / timings.length;
  }
  
  /**
   * Get slow rendering components
   */
  getSlowRenderingComponents(): string[] {
    const componentTimes = new Map<string, number[]>();
    
    // Group render times by component
    this.renderTimings.forEach(entry => {
      const times = componentTimes.get(entry.componentName) || [];
      times.push(entry.renderTime);
      componentTimes.set(entry.componentName, times);
    });
    
    // Calculate averages and find slow components
    const slowComponents: string[] = [];
    
    componentTimes.forEach((times, component) => {
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      if (average > 16) { // Slow if average render time exceeds 16ms (60fps)
        slowComponents.push(component);
      }
    });
    
    return slowComponents;
  }
  
  /**
   * Clear all render timings
   */
  clearTimings() {
    this.renderTimings = [];
    this.componentTracking.clear();
  }
  
  /**
   * Get all render timings
   */
  getAllRenderTimings(): PerformanceEntry[] {
    return [...this.renderTimings];
  }
}

// Export a singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Also export the class for testing
export default PerformanceMonitor;
