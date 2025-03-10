
/**
 * Performance monitoring system with strict typing and consistent API
 * This centralizes performance tracking across the application
 */

import type {
  ComponentMetrics,
  PerformanceTrackingOptions,
  RenderEventType,
  DeviceInfo
} from '@/types/performance';

export class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics> = new Map();
  private isMonitoring: boolean = false;
  private slowRenderThreshold: number = 16; // Default 16ms (60fps)
  private enableDebugLogging: boolean = false;
  private deviceInfo: DeviceInfo | null = null;
  
  /**
   * Initialize the performance monitor
   */
  constructor(options?: PerformanceTrackingOptions) {
    if (options?.autoStart) {
      this.startMonitoring();
    }
    
    if (options?.slowRenderThreshold) {
      this.slowRenderThreshold = options.slowRenderThreshold;
    }
    
    if (options?.enableDebugLogging) {
      this.enableDebugLogging = options.enableDebugLogging;
    }
    
    this.collectDeviceInfo();
  }
  
  /**
   * Collect device and environment information
   */
  private collectDeviceInfo(): void {
    // Safely get device memory
    const deviceMemory = (navigator as any).deviceMemory 
      ? (navigator as any).deviceMemory 
      : undefined;
    
    // Determine device category based on available hardware
    let deviceCategory: 'low' | 'medium' | 'high' = 'medium';
    
    if (deviceMemory && deviceMemory <= 2) {
      deviceCategory = 'low';
    } else if (deviceMemory && deviceMemory >= 8) {
      deviceCategory = 'high';
    }
    
    // Get network information if available
    const connection = (navigator as any).connection;
    const connectionType = connection ? connection.effectiveType : undefined;
    
    // Collect viewport and screen information
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    const screenSize = {
      width: window.screen.width,
      height: window.screen.height
    };
    
    // Store device info
    this.deviceInfo = {
      userAgent: navigator.userAgent,
      deviceCategory,
      deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      connectionType,
      viewport,
      screenSize,
      pixelRatio: window.devicePixelRatio
    };
  }
  
  /**
   * Start monitoring performance
   */
  public startMonitoring = (): void => {
    this.isMonitoring = true;
    this.logDebug('Performance monitoring started');
  };
  
  /**
   * Stop monitoring performance
   */
  public stopMonitoring = (): void => {
    this.isMonitoring = false;
    this.logDebug('Performance monitoring stopped');
  };
  
  /**
   * Check if monitoring is active
   */
  public isActive = (): boolean => {
    return this.isMonitoring;
  };
  
  /**
   * Reset all collected metrics
   */
  public resetMetrics = (): void => {
    this.metrics.clear();
    this.logDebug('Performance metrics reset');
  };
  
  /**
   * Record a component render event
   */
  public recordRender = (componentName: string, renderTime: number): void => {
    if (!this.isMonitoring) return;
    
    const existingMetrics = this.metrics.get(componentName) || this.createInitialMetrics(componentName);
    const renderCount = existingMetrics.renderCount + 1;
    const totalRenderTime = existingMetrics.totalRenderTime + renderTime;
    const averageRenderTime = totalRenderTime / renderCount;
    const isSlow = renderTime > this.slowRenderThreshold;
    
    const updatedMetrics: ComponentMetrics = {
      componentName,
      renderCount,
      totalRenderTime,
      averageRenderTime,
      lastRenderTime: renderTime,
      slowRenderCount: isSlow 
        ? existingMetrics.slowRenderCount + 1 
        : existingMetrics.slowRenderCount,
      firstRenderTime: existingMetrics.firstRenderTime || renderTime
    };
    
    this.metrics.set(componentName, updatedMetrics);
    
    if (isSlow && this.enableDebugLogging) {
      console.warn(
        `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms ` +
        `(threshold: ${this.slowRenderThreshold}ms)`
      );
    }
  };
  
  /**
   * Record a component unmount event
   */
  public recordUnmount = (componentName: string): void => {
    if (!this.isMonitoring) return;
    
    // We don't remove the metrics on unmount, just log the event
    this.logDebug(`Component unmounted: ${componentName}`);
  };
  
  /**
   * Record a custom performance event
   */
  public recordEvent = (
    eventType: RenderEventType,
    componentName: string,
    duration: number
  ): void => {
    if (!this.isMonitoring) return;
    
    this.logDebug(`Performance event: ${eventType} in ${componentName} (${duration.toFixed(2)}ms)`);
    
    // For interaction events, we record them separately
    if (eventType === 'interaction') {
      this.recordRender(`${componentName}:${eventType}`, duration);
    }
  };
  
  /**
   * Get metrics for a specific component
   */
  public getComponentMetrics = (componentName: string): ComponentMetrics | null => {
    return this.metrics.get(componentName) || null;
  };
  
  /**
   * Get all recorded component metrics
   */
  public getAllMetrics = (): ComponentMetrics[] => {
    return Array.from(this.metrics.values());
  };
  
  /**
   * Get components sorted by a specific metric
   */
  public getSortedComponents = (
    metric: keyof ComponentMetrics = 'lastRenderTime',
    limit: number = 10
  ): ComponentMetrics[] => {
    return Array.from(this.metrics.values())
      .sort((a, b) => {
        // Handle numeric comparisons
        if (typeof a[metric] === 'number' && typeof b[metric] === 'number') {
          return (b[metric] as number) - (a[metric] as number);
        }
        
        // Default to string comparison
        return String(b[metric]).localeCompare(String(a[metric]));
      })
      .slice(0, limit);
  };
  
  /**
   * Get device and environment information
   */
  public getDeviceInfo = (): DeviceInfo | null => {
    return this.deviceInfo;
  };
  
  /**
   * Create initial metrics for a component
   */
  private createInitialMetrics(componentName: string): ComponentMetrics {
    return {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      slowRenderCount: 0
    };
  }
  
  /**
   * Log debug messages if enabled
   */
  private logDebug(message: string): void {
    if (this.enableDebugLogging) {
      console.debug(`[PerformanceMonitor] ${message}`);
    }
  }
}

// Create and export a singleton instance
export const performanceMonitor = new PerformanceMonitor({
  autoStart: true,
  slowRenderThreshold: 16,
  enableDebugLogging: process.env.NODE_ENV === 'development'
});

export default performanceMonitor;
