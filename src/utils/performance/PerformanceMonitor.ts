/**
 * PerformanceMonitor class for tracking component rendering and application performance
 * This file uses PascalCase to match class name conventions
 */

import { throttle } from '../performanceUtils';

// Define types for metrics
export interface ComponentMetric {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  renderTimes: number[];
  lastRenderInfo?: Record<string, any>;
  renderTimeline: {
    timestamp: number;
    renderTime: number;
    info?: Record<string, any>;
  }[];
}

export interface PerformanceMetrics {
  components: Record<string, ComponentMetric>;
  queuedMetrics: any[];
  lastFPSCheck: number;
  averageFPS: number;
  deviceInfo: {
    category: string;
    userAgent: string;
    memory?: number;
    screen?: { width: number, height: number };
  };
}

// Define the class with Singleton pattern
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private isMonitoring: boolean = false;
  private subscribers: ((metrics: PerformanceMetrics) => void)[] = [];
  
  private constructor() {
    this.metrics = {
      components: {},
      queuedMetrics: [],
      lastFPSCheck: 0,
      averageFPS: 60,
      deviceInfo: {
        category: 'medium',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        memory: typeof navigator !== 'undefined' && 'deviceMemory' in navigator ? 
          (navigator as any).deviceMemory : undefined,
        screen: typeof window !== 'undefined' ? {
          width: window.innerWidth,
          height: window.innerHeight
        } : undefined
      }
    };
  }
  
  // Get singleton instance
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  // Report component render
  public reportRender(
    componentName: string,
    renderTime: number,
    renderInfo: Record<string, any> = {}
  ): void {
    if (!this.metrics.components[componentName]) {
      this.metrics.components[componentName] = {
        componentName,
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        renderTimes: [],
        renderTimeline: []
      };
    }
    
    const metric = this.metrics.components[componentName];
    
    // Update metrics
    metric.renderCount += 1;
    metric.totalRenderTime += renderTime;
    metric.lastRenderTime = renderTime;
    metric.lastRenderInfo = renderInfo;
    metric.renderTimes.push(renderTime);
    
    // Keep renderTimes array at a reasonable size
    if (metric.renderTimes.length > 50) {
      metric.renderTimes.shift();
    }
    
    // Calculate average render time
    metric.averageRenderTime = metric.totalRenderTime / metric.renderCount;
    
    // Add to timeline
    metric.renderTimeline.push({
      timestamp: Date.now(),
      renderTime,
      info: renderInfo
    });
    
    // Keep timeline at a reasonable size
    if (metric.renderTimeline.length > 20) {
      metric.renderTimeline.shift();
    }
    
    // Add to queue for potential server logging
    this.metrics.queuedMetrics.push({
      component: componentName,
      renderTime,
      timestamp: Date.now()
    });
    
    // Keep queue at a reasonable size
    if (this.metrics.queuedMetrics.length > 100) {
      this.metrics.queuedMetrics.shift();
    }
    
    // Notify subscribers of changes
    this.notifySubscribers();
  }
  
  // For backward compatibility
  public recordRender = this.reportRender;
  
  // Start monitoring
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitor FPS if in browser environment
    if (typeof window !== 'undefined') {
      let lastTime = performance.now();
      let frames = 0;
      
      const checkFPS = () => {
        frames++;
        const now = performance.now();
        const elapsed = now - lastTime;
        
        if (elapsed >= 1000) {
          this.metrics.averageFPS = Math.round((frames * 1000) / elapsed);
          lastTime = now;
          frames = 0;
          this.metrics.lastFPSCheck = Date.now();
          
          // Notify subscribers of FPS update
          this.notifySubscribers();
        }
        
        if (this.isMonitoring) {
          requestAnimationFrame(checkFPS);
        }
      };
      
      requestAnimationFrame(checkFPS);
    }
    
    console.log('Performance monitoring started');
  }
  
  // Stop monitoring
  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('Performance monitoring stopped');
  }
  
  // Clear metrics
  public clearMetrics(componentName?: string): void {
    if (componentName) {
      delete this.metrics.components[componentName];
    } else {
      this.metrics.components = {};
    }
    
    this.notifySubscribers();
  }
  
  // Get all component metrics
  public getAllMetrics(): Record<string, ComponentMetric> {
    return this.metrics.components;
  }
  
  // Get metrics for a specific component
  public getComponentMetrics(componentName: string): ComponentMetric | null {
    return this.metrics.components[componentName] || null;
  }
  
  // Get render count for a component
  public getRenderCount(componentName: string): number {
    return this.metrics.components[componentName]?.renderCount || 0;
  }
  
  // Get average render time for a component
  public getAverageRenderTime(componentName: string): number {
    return this.metrics.components[componentName]?.averageRenderTime || 0;
  }
  
  // Get all metrics data
  public getMetrics(): PerformanceMetrics {
    return this.metrics;
  }
  
  // Subscribe to metrics updates
  public subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  // Notify all subscribers of metrics updates
  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      subscriber(this.metrics);
    }
  }
  
  // Find components that might need optimization
  public getComponentsNeedingOptimization(): string[] {
    return Object.values(this.metrics.components)
      .filter(metric => 
        metric.averageRenderTime > 20 || 
        metric.renderCount > 30 ||
        metric.renderTimes.some(time => time > 50)
      )
      .map(metric => metric.componentName);
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Default export
export default performanceMonitor;
