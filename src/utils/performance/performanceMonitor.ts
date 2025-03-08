
import { devLogger } from '@/utils/debugUtils';

export interface ComponentMetrics {
  renders: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowRenders: number;
  firstRenderTime?: number;
  lastRenderTimestamp?: number;
}

interface PerformanceMetrics {
  totalComponents: number;
  totalRenders: number;
  totalRenderTime: number;
  averageRenderTime: number;
  slowRenders: number; // Renders taking > 16ms
  componentsWithSlowRenders: string[];
  startTime: number;
  componentMetrics: Record<string, ComponentMetrics>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private enabled: boolean;
  
  constructor() {
    this.metrics = this.getInitialMetrics();
    this.enabled = process.env.NODE_ENV === 'development';
  }
  
  /**
   * Record a component render
   */
  public recordRender(componentName: string, renderTime: number): void {
    if (!this.enabled) return;
    
    // Initialize component metrics if not exists
    if (!this.metrics.componentMetrics[componentName]) {
      this.metrics.componentMetrics[componentName] = {
        renders: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        slowRenders: 0,
        firstRenderTime: renderTime,
        lastRenderTimestamp: Date.now()
      };
    }
    
    const compMetrics = this.metrics.componentMetrics[componentName];
    
    // Update component metrics
    compMetrics.renders++;
    compMetrics.totalRenderTime += renderTime;
    compMetrics.averageRenderTime = compMetrics.totalRenderTime / compMetrics.renders;
    compMetrics.lastRenderTime = renderTime;
    compMetrics.lastRenderTimestamp = Date.now();
    
    // Check if this is a slow render
    if (renderTime > 16) { // 16ms = 1 frame at 60fps
      compMetrics.slowRenders++;
      
      if (!this.metrics.componentsWithSlowRenders.includes(componentName)) {
        this.metrics.componentsWithSlowRenders.push(componentName);
      }
    }
    
    // Update global metrics
    this.metrics.totalRenders++;
    this.metrics.totalRenderTime += renderTime;
    this.metrics.averageRenderTime = this.metrics.totalRenderTime / this.metrics.totalRenders;
    
    if (renderTime > 16) {
      this.metrics.slowRenders++;
    }
    
    // Ensure component is counted
    const uniqueComponents = Object.keys(this.metrics.componentMetrics).length;
    this.metrics.totalComponents = uniqueComponents;
    
    // Log very slow renders
    if (renderTime > 50) {
      devLogger.warn('Performance', `Very slow render detected in ${componentName}: ${renderTime.toFixed(1)}ms`);
    }
  }
  
  /**
   * Record a component unmount
   */
  public recordUnmount(componentName: string): void {
    // Just log for now, could track mount/unmount patterns in the future
    devLogger.log('Performance', `Component unmounted: ${componentName}`);
  }
  
  /**
   * Get all performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get metrics for a specific component
   */
  public getComponentMetrics(componentName: string): ComponentMetrics | null {
    const metrics = this.metrics.componentMetrics[componentName];
    return metrics ? { ...metrics } : null;
  }
  
  /**
   * Get components with the slowest average render times
   */
  public getSlowestComponents(limit: number = 5): { name: string; metrics: ComponentMetrics }[] {
    return Object.entries(this.metrics.componentMetrics)
      .map(([name, metrics]) => ({ name, metrics }))
      .sort((a, b) => b.metrics.averageRenderTime - a.metrics.averageRenderTime)
      .slice(0, limit);
  }
  
  /**
   * Get components with the most renders
   */
  public getMostFrequentlyRenderedComponents(limit: number = 5): { name: string; metrics: ComponentMetrics }[] {
    return Object.entries(this.metrics.componentMetrics)
      .map(([name, metrics]) => ({ name, metrics }))
      .sort((a, b) => b.metrics.renders - a.metrics.renders)
      .slice(0, limit);
  }
  
  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = this.getInitialMetrics();
    devLogger.log('Performance', 'Performance metrics cleared');
  }
  
  /**
   * Enable or disable performance monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    devLogger.log('Performance', `Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Get initial metrics structure
   */
  private getInitialMetrics(): PerformanceMetrics {
    return {
      totalComponents: 0,
      totalRenders: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      slowRenders: 0,
      componentsWithSlowRenders: [],
      startTime: Date.now(),
      componentMetrics: {}
    };
  }
  
  /**
   * Generate a performance report summary
   */
  public generateReport(): string {
    const { 
      totalComponents, 
      totalRenders, 
      totalRenderTime, 
      averageRenderTime, 
      slowRenders 
    } = this.metrics;
    
    const runtime = (Date.now() - this.metrics.startTime) / 1000;
    const rendersPerSecond = totalRenders / runtime;
    
    let report = `
Performance Report:
==================
Runtime: ${runtime.toFixed(1)}s
Total Components: ${totalComponents}
Total Renders: ${totalRenders} (${rendersPerSecond.toFixed(1)}/s)
Total Render Time: ${totalRenderTime.toFixed(1)}ms
Average Render Time: ${averageRenderTime.toFixed(2)}ms
Slow Renders (>16ms): ${slowRenders} (${((slowRenders / totalRenders) * 100).toFixed(1)}%)

Top 5 Slowest Components:
------------------------
`;
    
    const slowest = this.getSlowestComponents(5);
    slowest.forEach(({ name, metrics }, index) => {
      report += `${index + 1}. ${name}: ${metrics.averageRenderTime.toFixed(2)}ms avg (${metrics.renders} renders)\n`;
    });
    
    report += `
Top 5 Most Frequently Rendered:
-----------------------------
`;
    
    const frequent = this.getMostFrequentlyRenderedComponents(5);
    frequent.forEach(({ name, metrics }, index) => {
      report += `${index + 1}. ${name}: ${metrics.renders} renders (${metrics.averageRenderTime.toFixed(2)}ms avg)\n`;
    });
    
    return report;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
