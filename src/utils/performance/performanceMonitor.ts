
/**
 * Performance monitoring system
 * Provides standardized tracking for component renders, interactions, and web vitals
 */

export interface PerformanceMetric {
  id?: string;
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  metrics_data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  maxRenderTime: number;
  lastRenderTime: number;
  slowRenders: number;
  interactions: Record<string, InteractionMetric>;
  interactionCount: number;
}

export interface InteractionMetric {
  count: number;
  totalTime: number;
  averageTime: number;
  maxTime: number;
  lastTime: number;
}

export interface PerformanceEvent {
  type: 'render' | 'interaction' | 'webVital';
  componentName: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// Default threshold for slow renders (in ms)
const DEFAULT_SLOW_RENDER_THRESHOLD = 16.67; // ~60fps

class PerformanceMonitor {
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private enabled: boolean = true;
  private eventBuffer: PerformanceEvent[] = [];
  private bufferSize: number = 100;
  private flushInterval: number | null = null;
  private slowRenderThreshold: number = DEFAULT_SLOW_RENDER_THRESHOLD;
  private sessionId: string = this.generateSessionId();
  private reportCallback?: (metrics: PerformanceMetric[]) => Promise<void>;

  constructor() {
    // Initialize the monitor with default settings
    this.startAutoFlush();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    if (enabled && !this.flushInterval) {
      this.startAutoFlush();
    } else if (!enabled && this.flushInterval) {
      this.stopAutoFlush();
    }
  }

  /**
   * Set the threshold for what's considered a slow render (in ms)
   */
  setSlowRenderThreshold(threshold: number): void {
    this.slowRenderThreshold = threshold;
  }

  /**
   * Set how many events to buffer before automatic flush
   */
  setBufferSize(size: number): void {
    this.bufferSize = size;
  }

  /**
   * Register a callback for reporting metrics
   */
  setReportCallback(callback: (metrics: PerformanceMetric[]) => Promise<void>): void {
    this.reportCallback = callback;
  }

  /**
   * Start auto-flushing metrics at regular intervals
   */
  private startAutoFlush(intervalMs: number = 10000): void {
    if (this.flushInterval) {
      this.stopAutoFlush();
    }
    
    this.flushInterval = window.setInterval(() => {
      this.flushMetrics();
    }, intervalMs);
  }

  /**
   * Stop auto-flushing metrics
   */
  private stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Record a component render event
   */
  recordRender(componentName: string, renderTime: number, metadata?: Record<string, unknown>): void {
    if (!this.enabled) return;
    
    // Add to event buffer
    this.eventBuffer.push({
      type: 'render',
      componentName,
      duration: renderTime,
      timestamp: Date.now(),
      metadata
    });
    
    // Update component metrics
    this.updateComponentMetrics(componentName, renderTime);
    
    // Check if buffer should be flushed
    if (this.eventBuffer.length >= this.bufferSize) {
      this.flushMetrics();
    }
  }

  /**
   * Record a user interaction event
   */
  recordInteraction(componentName: string, interactionName: string, duration: number, metadata?: Record<string, unknown>): void {
    if (!this.enabled) return;
    
    // Add to event buffer
    this.eventBuffer.push({
      type: 'interaction',
      componentName: `${componentName}:${interactionName}`,
      duration,
      timestamp: Date.now(),
      metadata
    });
    
    // Update interaction metrics
    this.updateInteractionMetrics(componentName, interactionName, duration);
    
    // Check if buffer should be flushed
    if (this.eventBuffer.length >= this.bufferSize) {
      this.flushMetrics();
    }
  }

  /**
   * Record a web vital measurement
   */
  recordWebVital(name: string, value: number, metadata?: Record<string, unknown>): void {
    if (!this.enabled) return;
    
    // Add to event buffer
    this.eventBuffer.push({
      type: 'webVital',
      componentName: name,
      duration: value,
      timestamp: Date.now(),
      metadata
    });
  }

  /**
   * Update metrics for a component
   */
  private updateComponentMetrics(componentName: string, renderTime: number): void {
    let metrics = this.componentMetrics.get(componentName);
    
    if (!metrics) {
      metrics = {
        componentName,
        renderCount: 0,
        totalRenderTime: 0,
        maxRenderTime: 0,
        lastRenderTime: 0,
        slowRenders: 0,
        interactions: {},
        interactionCount: 0
      };
      this.componentMetrics.set(componentName, metrics);
    }
    
    metrics.renderCount++;
    metrics.totalRenderTime += renderTime;
    metrics.lastRenderTime = renderTime;
    
    if (renderTime > metrics.maxRenderTime) {
      metrics.maxRenderTime = renderTime;
    }
    
    if (renderTime > this.slowRenderThreshold) {
      metrics.slowRenders++;
    }
  }

  /**
   * Update metrics for an interaction
   */
  private updateInteractionMetrics(componentName: string, interactionName: string, duration: number): void {
    let metrics = this.componentMetrics.get(componentName);
    
    if (!metrics) {
      metrics = {
        componentName,
        renderCount: 0,
        totalRenderTime: 0,
        maxRenderTime: 0,
        lastRenderTime: 0,
        slowRenders: 0,
        interactions: {},
        interactionCount: 0
      };
      this.componentMetrics.set(componentName, metrics);
    }
    
    let interaction = metrics.interactions[interactionName];
    
    if (!interaction) {
      interaction = {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        maxTime: 0,
        lastTime: 0
      };
      metrics.interactions[interactionName] = interaction;
    }
    
    interaction.count++;
    interaction.totalTime += duration;
    interaction.lastTime = duration;
    interaction.averageTime = interaction.totalTime / interaction.count;
    
    if (duration > interaction.maxTime) {
      interaction.maxTime = duration;
    }
    
    metrics.interactionCount++;
  }

  /**
   * Get all collected performance metrics
   */
  getMetrics(): PerformanceMetric[] {
    const result: PerformanceMetric[] = [];
    
    this.componentMetrics.forEach((metrics) => {
      const averageRenderTime = metrics.renderCount > 0 
        ? metrics.totalRenderTime / metrics.renderCount 
        : 0;
      
      result.push({
        component_name: metrics.componentName,
        average_render_time: averageRenderTime,
        total_renders: metrics.renderCount,
        slow_renders: metrics.slowRenders,
        metrics_data: {
          maxRenderTime: metrics.maxRenderTime,
          lastRenderTime: metrics.lastRenderTime,
          interactions: Object.keys(metrics.interactions).length,
          interactionCount: metrics.interactionCount,
          sessionId: this.sessionId
        }
      });
    });
    
    return result;
  }

  /**
   * Flush collected metrics and optionally report them
   */
  async flushMetrics(): Promise<void> {
    if (this.eventBuffer.length === 0) return;
    
    const metrics = this.getMetrics();
    this.eventBuffer = [];
    
    if (this.reportCallback && metrics.length > 0) {
      try {
        await this.reportCallback(metrics);
      } catch (error) {
        console.error('Failed to report performance metrics:', error);
      }
    }
  }

  /**
   * Clear all collected metrics
   */
  clearMetrics(): void {
    this.componentMetrics.clear();
    this.eventBuffer = [];
  }
}

// Export singleton instance
export const performanceMetrics = new PerformanceMonitor();
