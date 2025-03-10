
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
  categories?: string[];
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

export type PerformanceCategory = 'render' | 'interaction' | 'load' | 'api';

// The actual performance monitor implementation
class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics> = new Map();
  private events: PerformanceEvent[] = [];
  private isMonitoring: boolean = true;
  private slowRenderThreshold: number = 16; // 16ms = 60fps
  private metricsLimit: number = 100; // Maximum number of events to store
  private logEnabled: boolean = process.env.NODE_ENV === 'development';
  private errorHandler?: (error: unknown) => void;

  // Record a component render with better error handling
  recordRender(componentName: string, renderTime: number): void {
    try {
      if (!this.isMonitoring || !componentName) return;
      
      // Validate inputs
      if (typeof renderTime !== 'number' || isNaN(renderTime)) {
        console.error(`Invalid render time for ${componentName}: ${renderTime}`);
        return;
      }
      
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
        if (this.logEnabled) {
          console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
      
      // Store updated metrics
      this.metrics.set(componentName, existingMetrics);
      
      // Record event
      this.recordEvent('render', componentName, renderTime);
    } catch (error) {
      this.handleError(error, 'recordRender');
    }
  }
  
  // Record an unmount event
  recordUnmount(componentName: string): void {
    try {
      if (!this.isMonitoring || !componentName) return;
      
      // Add a marker for component unmount (useful for debugging memory leaks)
      this.events.push({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        duration: 0,
        category: 'render',
        component: componentName,
        details: { type: 'unmount' }
      });
    } catch (error) {
      this.handleError(error, 'recordUnmount');
    }
  }
  
  // Record any performance event with enhanced type safety
  recordEvent(
    category: PerformanceCategory, 
    name: string, 
    duration: number,
    details?: Record<string, unknown>
  ): void {
    try {
      if (!this.isMonitoring || !name) return;
      
      // Validate inputs
      if (typeof duration !== 'number' || isNaN(duration)) {
        console.error(`Invalid duration for ${name}: ${duration}`);
        return;
      }
      
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
    } catch (error) {
      this.handleError(error, 'recordEvent');
    }
  }
  
  // Set error handler for monitoring failures
  setErrorHandler(handler: (error: unknown) => void): void {
    this.errorHandler = handler;
  }
  
  // Internal method to handle errors
  private handleError(error: unknown, method: string): void {
    console.error(`Error in PerformanceMonitor.${method}:`, error);
    
    if (this.errorHandler) {
      try {
        this.errorHandler(error);
      } catch (handlerError) {
        console.error('Error in performance error handler:', handlerError);
      }
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
  
  // Enable or disable logging
  setLogging(enabled: boolean): void {
    this.logEnabled = enabled;
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
  
  // Get recent events with filtering capabilities
  getRecentEvents(options: {
    limit?: number;
    category?: PerformanceCategory;
    component?: string;
  } = {}): PerformanceEvent[] {
    const { limit = 20, category, component } = options;
    
    let filteredEvents = this.events;
    
    if (category) {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }
    
    if (component) {
      filteredEvents = filteredEvents.filter(event => event.component?.includes(component));
    }
    
    return filteredEvents.slice(-limit);
  }
  
  // Get slow components (those with higher than threshold average render time)
  getSlowComponents(threshold: number = this.slowRenderThreshold): ComponentMetrics[] {
    return this.getAllComponentMetrics()
      .filter(metric => metric.averageRenderTime > threshold)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }
  
  // Configure the slow render threshold
  setSlowRenderThreshold(threshold: number): void {
    if (threshold > 0) {
      this.slowRenderThreshold = threshold;
    }
  }
  
  // Set the maximum number of events to store
  setMetricsLimit(limit: number): void {
    if (limit > 0) {
      this.metricsLimit = limit;
      
      // Trim events if we're already over the new limit
      if (this.events.length > limit) {
        this.events = this.events.slice(-limit);
      }
    }
  }
  
  // Export metrics for persistence
  exportMetrics(): {
    components: ComponentMetrics[];
    events: PerformanceEvent[];
    config: {
      slowRenderThreshold: number;
      metricsLimit: number;
    }
  } {
    return {
      components: this.getAllComponentMetrics(),
      events: this.events,
      config: {
        slowRenderThreshold: this.slowRenderThreshold,
        metricsLimit: this.metricsLimit
      }
    };
  }
  
  // Import metrics (for example after page reload)
  importMetrics(data: {
    components?: ComponentMetrics[];
    events?: PerformanceEvent[];
    config?: {
      slowRenderThreshold?: number;
      metricsLimit?: number;
    }
  }): void {
    try {
      if (data.components) {
        this.metrics.clear();
        data.components.forEach(metric => {
          this.metrics.set(metric.component, metric);
        });
      }
      
      if (data.events) {
        this.events = data.events;
      }
      
      if (data.config) {
        if (data.config.slowRenderThreshold) {
          this.slowRenderThreshold = data.config.slowRenderThreshold;
        }
        
        if (data.config.metricsLimit) {
          this.metricsLimit = data.config.metricsLimit;
        }
      }
    } catch (error) {
      this.handleError(error, 'importMetrics');
    }
  }
}

// Export a singleton instance
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
