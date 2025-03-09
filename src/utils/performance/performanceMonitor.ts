// Re-export from the properly cased file to maintain backward compatibility
export * from './PerformanceMonitor';

// Re-export the default export
import { performanceMonitor as actualPerformanceMonitor } from './PerformanceMonitor';
export { actualPerformanceMonitor as performanceMonitor };

export default actualPerformanceMonitor;

import { throttle } from '@/utils/performanceUtils';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private componentMetrics: Record<string, any> = {};
  private renderCounts: Record<string, number> = {};
  private lastRenderTimes: Record<string, number> = {};
  private frameRateSamples: number[] = [];
  private lastFrameTime: number = 0;
  private isMonitoring: boolean = false;
  private metricsHistory: Record<string, any[]> = {};
  private lowPerformanceDetected: boolean = false;

  // Get singleton instance
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start monitoring performance
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    
    // Start FPS monitoring
    requestAnimationFrame(this.monitorFrameRate.bind(this));
    
    console.log('Performance monitoring started');
  }

  // Stop monitoring
  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('Performance monitoring stopped');
  }

  // Monitor frame rate
  private monitorFrameRate(): void {
    if (!this.isMonitoring) return;
    
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    
    if (elapsed > 0) {
      const fps = 1000 / elapsed;
      this.frameRateSamples.push(fps);
      
      // Keep only the last 60 samples
      if (this.frameRateSamples.length > 60) {
        this.frameRateSamples.shift();
      }
      
      // Detect low performance
      const averageFPS = this.getAverageFPS();
      if (averageFPS < 30 && !this.lowPerformanceDetected) {
        this.lowPerformanceDetected = true;
        console.warn('Low performance detected:', averageFPS.toFixed(1), 'FPS');
      } else if (averageFPS > 45 && this.lowPerformanceDetected) {
        this.lowPerformanceDetected = false;
        console.log('Performance recovered:', averageFPS.toFixed(1), 'FPS');
      }
    }
    
    this.lastFrameTime = now;
    requestAnimationFrame(this.monitorFrameRate.bind(this));
  }

  // Report component render
  public reportRender(
    componentName: string,
    renderTime: number,
    renderInfo: any = {}
  ): void {
    if (!this.isMonitoring) return;
    
    // Initialize component metrics if not exists
    if (!this.componentMetrics[componentName]) {
      this.componentMetrics[componentName] = {
        totalRenderTime: 0,
        renderCount: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        maxRenderTime: 0,
        minRenderTime: Infinity,
        lastRenderInfo: {},
        renderTimeline: []
      };
      this.renderCounts[componentName] = 0;
    }
    
    // Update metrics
    const metrics = this.componentMetrics[componentName];
    metrics.totalRenderTime += renderTime;
    metrics.renderCount += 1;
    metrics.lastRenderTime = renderTime;
    metrics.lastRenderInfo = renderInfo;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
    metrics.maxRenderTime = Math.max(metrics.maxRenderTime, renderTime);
    metrics.minRenderTime = Math.min(metrics.minRenderTime, renderTime);
    
    // Add to render timeline with timestamp
    metrics.renderTimeline.push({
      timestamp: Date.now(),
      renderTime,
      info: renderInfo
    });
    
    // Keep only last 20 render events in timeline
    if (metrics.renderTimeline.length > 20) {
      metrics.renderTimeline.shift();
    }
    
    // Track render counts
    this.renderCounts[componentName] += 1;
    
    // Add to metrics history
    if (!this.metricsHistory[componentName]) {
      this.metricsHistory[componentName] = [];
    }
    this.metricsHistory[componentName].push({
      timestamp: Date.now(),
      renderTime,
      info: renderInfo
    });
    
    // Keep history size manageable
    if (this.metricsHistory[componentName].length > 100) {
      this.metricsHistory[componentName].shift();
    }
    
    // Log excessive render times
    if (renderTime > 50) {
      console.warn(`Slow render detected - ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }

  // Get component metrics
  public getComponentMetrics(componentName?: string): any {
    if (componentName) {
      return this.componentMetrics[componentName] || null;
    }
    return this.componentMetrics;
  }

  // Get render count for a component
  public getRenderCount(componentName: string): number {
    return this.renderCounts[componentName] || 0;
  }

  // Get average FPS
  public getAverageFPS(): number {
    if (this.frameRateSamples.length === 0) return 60;
    
    const sum = this.frameRateSamples.reduce((acc, val) => acc + val, 0);
    return sum / this.frameRateSamples.length;
  }

  // Clear metrics for a component
  public clearMetrics(componentName?: string): void {
    if (componentName) {
      delete this.componentMetrics[componentName];
      delete this.renderCounts[componentName];
      delete this.metricsHistory[componentName];
    } else {
      this.componentMetrics = {};
      this.renderCounts = {};
      this.metricsHistory = {};
    }
  }

  // Check if a component needs optimization
  public needsOptimization(componentName: string): boolean {
    const metrics = this.componentMetrics[componentName];
    if (!metrics) return false;
    
    // Optimization criteria
    return (
      metrics.averageRenderTime > 20 || // Slow average render time
      metrics.renderCount > 30 || // Excessive renders
      metrics.maxRenderTime > 50 // Any significantly slow render
    );
  }

  // Get all component names that need optimization
  public getComponentsNeedingOptimization(): string[] {
    return Object.keys(this.componentMetrics).filter(name => 
      this.needsOptimization(name)
    );
  }

  // Get metrics history for a component
  public getMetricsHistory(componentName: string): any[] {
    return this.metricsHistory[componentName] || [];
  }

  // Get performance status
  public getPerformanceStatus(): any {
    return {
      averageFPS: this.getAverageFPS(),
      lowPerformanceDetected: this.lowPerformanceDetected,
      componentCount: Object.keys(this.componentMetrics).length,
      totalRenderCount: Object.values(this.renderCounts).reduce((sum: number, count: number) => sum + count, 0),
      componentsNeedingOptimization: this.getComponentsNeedingOptimization()
    };
  }

  // Alias for recordRender to maintain backward compatibility
  public recordRender = this.reportRender;
}

// Export singleton instance
export default PerformanceMonitor.getInstance();
