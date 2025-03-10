
/**
 * Central performance monitoring system
 * Tracks component render times, interactions, and web vitals
 */

// Type definitions
export interface ComponentMetrics {
  component: string;
  averageRenderTime: number;
  totalRenders: number;
  slowRenders: number;
  lastRenderTime?: number;
  totalRenderTime: number;
}

export interface PerformanceEvent {
  id: string;
  timestamp: number;
  duration: number;
  category: 'render' | 'interaction' | 'load' | 'api';
  component?: string;
  details?: Record<string, unknown>;
}

export interface PerformanceMetric {
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  created_at: string;
}

// The actual performance monitor implementation
class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics> = new Map();
  private events: PerformanceEvent[] = [];
  private isMonitoring: boolean = true;
  private slowRenderThreshold: number = 16; // 16ms = 60fps
  private metricsLimit: number = 100; // Maximum number of events to store

  // Record a component render
  recordRender(componentName: string, renderTime: number): void {
    if (!this.isMonitoring) return;
    
    const existingMetrics = this.metrics.get(componentName) || {
      component: componentName,
      averageRenderTime: 0,
      totalRenders: 0,
      slowRenders: 0,
      totalRenderTime: 0
    };
    
    // Update metrics
    existingMetrics.totalRenders += 1;
    existingMetrics.totalRenderTime += renderTime;
    existingMetrics.lastRenderTime = renderTime;
    existingMetrics.averageRenderTime = existingMetrics.totalRenderTime / existingMetrics.totalRenders;
    
    // Count slow renders
    if (renderTime > this.slowRenderThreshold) {
      existingMetrics.slowRenders += 1;
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    // Store updated metrics
    this.metrics.set(componentName, existingMetrics);
    
    // Record event
    this.recordEvent('render', componentName, renderTime);
  }
  
  // Record an unmount event
  recordUnmount(componentName: string): void {
    if (!this.isMonitoring) return;
    
    // Add a marker for component unmount (useful for debugging memory leaks)
    this.events.push({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: 0,
      category: 'render',
      component: componentName,
      details: { type: 'unmount' }
    });
  }
  
  // Record any performance event
  recordEvent(
    category: 'render' | 'interaction' | 'load' | 'api', 
    name: string, 
    duration: number,
    details?: Record<string, unknown>
  ): void {
    if (!this.isMonitoring) return;
    
    const event: PerformanceEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      duration,
      category,
      component: name,
      details
    };
    
    this.events.push(event);
    
    // Limit the number of stored events to prevent memory issues
    if (this.events.length > this.metricsLimit) {
      this.events.shift();
    }
  }
  
  // Start monitoring
  startMonitoring(): void {
    this.isMonitoring = true;
  }
  
  // Stop monitoring
  stopMonitoring(): void {
    this.isMonitoring = false;
  }
  
  // Reset all metrics
  resetMetrics(): void {
    this.metrics.clear();
    this.events = [];
  }
  
  // Get metrics for a specific component
  getComponentMetrics(componentName: string): ComponentMetrics {
    return this.metrics.get(componentName) || {
      component: componentName,
      averageRenderTime: 0,
      totalRenders: 0,
      slowRenders: 0,
      totalRenderTime: 0
    };
  }
  
  // Get all component metrics
  getAllComponentMetrics(): ComponentMetrics[] {
    return Array.from(this.metrics.values());
  }
  
  // Get recent events
  getRecentEvents(limit: number = 20): PerformanceEvent[] {
    return this.events.slice(-limit);
  }
  
  // Get slow components (those with higher than threshold average render time)
  getSlowComponents(threshold: number = this.slowRenderThreshold): ComponentMetrics[] {
    return this.getAllComponentMetrics()
      .filter(metric => metric.averageRenderTime > threshold)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }
  
  // Configure the slow render threshold
  setSlowRenderThreshold(threshold: number): void {
    this.slowRenderThreshold = threshold;
  }
  
  // Get all events for a specific component
  getComponentEvents(componentName: string): PerformanceEvent[] {
    return this.events.filter(event => event.component === componentName);
  }
}

// Export a singleton instance
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
