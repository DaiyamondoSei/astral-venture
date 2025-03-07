import { getPerformanceCategory } from '../performanceUtils';

type PerformanceMetric = {
  fps: number;
  timestamp: number;
  memoryUsage?: number;
  cpuUsage?: number;
  deviceCategory: string;
  routeName: string;
};

/**
 * Enhanced performance monitoring utility
 * Collects real-time performance metrics for analysis
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private isMonitoring = false;
  private frameCountPerSecond = 0;
  private lastSecondTimestamp = 0;
  private monitoringIntervalId?: number;
  private animationFrameId?: number;
  private currentRoute = 'unknown';
  
  // Maximum number of metrics to store
  private maxMetricsLength = 100;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * Start monitoring performance
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    
    // Reset metrics
    this.metrics = [];
    this.frameCountPerSecond = 0;
    this.lastSecondTimestamp = performance.now();
    
    // Count frames
    const countFrame = () => {
      this.frameCountPerSecond++;
      if (this.isMonitoring) {
        this.animationFrameId = requestAnimationFrame(countFrame);
      }
    };
    
    // Start frame counting
    this.animationFrameId = requestAnimationFrame(countFrame);
    
    // Collect metrics every second
    this.monitoringIntervalId = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - this.lastSecondTimestamp;
      
      // Calculate FPS
      const fps = Math.round((this.frameCountPerSecond * 1000) / elapsed);
      
      // Get memory usage if available
      let memoryUsage;
      if (performance && (performance as any).memory) {
        memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
      }
      
      // Store metric
      this.addMetric({
        fps,
        timestamp: now,
        memoryUsage,
        deviceCategory: getPerformanceCategory(),
        routeName: this.currentRoute
      });
      
      // Log warning if FPS is low
      if (fps < 30) {
        console.warn(`[Performance Monitor] Low FPS detected: ${fps} FPS on route ${this.currentRoute}`);
      }
      
      // Reset counters
      this.frameCountPerSecond = 0;
      this.lastSecondTimestamp = now;
    }, 1000);
  }
  
  /**
   * Stop monitoring performance
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitoringIntervalId) {
      clearInterval(this.monitoringIntervalId);
      this.monitoringIntervalId = undefined;
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }
  
  /**
   * Set current route for better metric tracking
   */
  public setCurrentRoute(routeName: string): void {
    this.currentRoute = routeName;
  }
  
  /**
   * Add a performance metric to the collection
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep metrics array from growing too large
    if (this.metrics.length > this.maxMetricsLength) {
      this.metrics = this.metrics.slice(-this.maxMetricsLength);
    }
  }
  
  /**
   * Get collected metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
  
  /**
   * Get average FPS from collected metrics
   */
  public getAverageFPS(): number {
    if (this.metrics.length === 0) return 0;
    
    const sum = this.metrics.reduce((acc, metric) => acc + metric.fps, 0);
    return Math.round(sum / this.metrics.length);
  }
  
  /**
   * Get FPS stability percentage (% of measurements above 30 FPS)
   */
  public getFPSStability(): number {
    if (this.metrics.length === 0) return 100;
    
    const goodFrames = this.metrics.filter(metric => metric.fps >= 30).length;
    return Math.round((goodFrames / this.metrics.length) * 100);
  }
  
  /**
   * Check if current device is struggling with performance
   */
  public isPerformanceStruggling(): boolean {
    // Get last 5 metrics
    const recentMetrics = this.metrics.slice(-5);
    if (recentMetrics.length < 5) return false;
    
    // Calculate average recent FPS
    const avgFPS = recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;
    
    // Thresholds based on device capability
    const deviceCategory = getPerformanceCategory();
    const thresholds = {
      low: 20,
      medium: 30,
      high: 45
    };
    
    return avgFPS < thresholds[deviceCategory];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Hook up performance monitor to route changes
 */
export const initPerformanceMonitoring = (): () => void => {
  if (typeof window === 'undefined') return () => {};
  
  // Only enable in development or if explicitly enabled
  const shouldMonitor = process.env.NODE_ENV === 'development' || 
                        localStorage.getItem('enablePerformanceMonitoring') === 'true';
  
  if (shouldMonitor) {
    performanceMonitor.startMonitoring();
    
    // Update route on navigation
    const originalPushState = history.pushState;
    history.pushState = function(state, title, url) {
      originalPushState.call(this, state, title, url);
      performanceMonitor.setCurrentRoute(url || 'unknown');
    };
    
    window.addEventListener('popstate', () => {
      performanceMonitor.setCurrentRoute(window.location.pathname);
    });
    
    // Set initial route
    performanceMonitor.setCurrentRoute(window.location.pathname);
    
    return () => {
      performanceMonitor.stopMonitoring();
      history.pushState = originalPushState;
    };
  }
  
  return () => {};
};
