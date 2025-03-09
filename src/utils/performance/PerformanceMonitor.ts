// Performance Monitor Implementation
import { DeviceCapability } from '../performanceUtils';

interface PerformanceMetrics {
  componentMetrics: Record<string, ComponentMetric>;
  renderTimeSeries: Record<string, number[]>;
  queuedMetrics: any[];
}

interface ComponentMetric {
  componentName: string;
  renderCount: number;
  renderTimes: number[];
  averageRenderTime: number;
  slowRenders: number;
  lastUpdated: number;
}

export class PerformanceMonitorImpl {
  private static instance: PerformanceMonitorImpl;
  private metrics: PerformanceMetrics = {
    componentMetrics: {},
    renderTimeSeries: {},
    queuedMetrics: []
  };
  private isMonitoring = false;
  private subscribers: ((metrics: Record<string, any>) => void)[] = [];

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): PerformanceMonitorImpl {
    if (!PerformanceMonitorImpl.instance) {
      PerformanceMonitorImpl.instance = new PerformanceMonitorImpl();
    }
    return PerformanceMonitorImpl.instance;
  }

  startMonitoring(): void {
    this.isMonitoring = true;
    console.log('[Performance] Monitoring started');
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('[Performance] Monitoring stopped');
  }

  recordRender(componentName: string, renderTime: number): void {
    if (!this.isMonitoring) return;

    // Initialize component metrics if needed
    if (!this.metrics.componentMetrics[componentName]) {
      this.metrics.componentMetrics[componentName] = {
        componentName,
        renderCount: 0,
        renderTimes: [],
        averageRenderTime: 0,
        slowRenders: 0,
        lastUpdated: Date.now()
      };
    }

    const componentMetric = this.metrics.componentMetrics[componentName];
    
    // Update metrics
    componentMetric.renderCount++;
    componentMetric.renderTimes.push(renderTime);
    componentMetric.lastUpdated = Date.now();
    
    // Calculate average render time
    const totalRenderTime = componentMetric.renderTimes.reduce((sum, time) => sum + time, 0);
    componentMetric.averageRenderTime = totalRenderTime / componentMetric.renderTimes.length;
    
    // Track slow renders (over 16ms for 60fps target)
    if (renderTime > 16) {
      componentMetric.slowRenders++;
    }
    
    // Keep only the last 100 render times to prevent memory issues
    if (componentMetric.renderTimes.length > 100) {
      componentMetric.renderTimes = componentMetric.renderTimes.slice(-100);
    }
    
    // Add to queue for potential backend reporting
    this.metrics.queuedMetrics.push({
      component_name: componentName,
      render_time: renderTime,
      timestamp: new Date().toISOString()
    });
    
    // Notify subscribers
    this.notifySubscribers();
  }

  getComponentMetrics(): Record<string, ComponentMetric> {
    return this.metrics.componentMetrics;
  }

  getAllMetrics(): Record<string, any> {
    return {
      ...this.metrics,
      timestamp: Date.now()
    };
  }

  getMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  clearMetrics(): void {
    this.metrics = {
      componentMetrics: {},
      renderTimeSeries: {},
      queuedMetrics: []
    };
    console.log('[Performance] Metrics cleared');
    this.notifySubscribers();
  }

  subscribe(callback: (metrics: Record<string, any>) => void): () => void {
    this.subscribers.push(callback);
    
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    const metrics = this.getAllMetrics();
    this.subscribers.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('[Performance] Error in subscriber callback:', error);
      }
    });
  }
}

// Export a singleton instance
export const performanceMonitor = PerformanceMonitorImpl.getInstance();
