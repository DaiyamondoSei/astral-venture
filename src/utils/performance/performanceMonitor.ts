/**
 * Performance Monitoring System
 * 
 * This service tracks real-time performance metrics for the application
 * including render times, memory usage, FPS, and component-level statistics.
 */
import { devLogger } from '../debugUtils';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number | null;
  jsHeapSizeLimit: number;
  totalRenders: number;
  renderTimes: number[];
  lastRenderTime: number;
  lastUpdated: number;
  events: PerformanceEvent[];
  componentStats: ComponentStat[];
  insights: PerformanceInsight[];
  renderTimeline: RenderTimelineItem[];
}

export interface PerformanceEvent {
  type: 'render' | 'navigation' | 'error' | 'api' | 'interaction' | 'resource';
  description: string;
  timestamp: number;
  duration?: number;
  componentName?: string;
  metadata?: Record<string, any>;
}

export interface ComponentStat {
  name: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  recentRenderTimes: number[];
}

export interface PerformanceInsight {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  recommendation?: string;
  componentName?: string;
  metadata?: Record<string, any>;
}

export interface RenderTimelineItem {
  componentName: string;
  timestamp: number;
  renderTime: number;
  renderCount: number;
  props?: Record<string, any>;
}

export type PerformanceSubscriber = () => void;

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private subscribers: PerformanceSubscriber[] = [];
  private isActive: boolean = false;
  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateInterval: number = 1000; // Update FPS every second
  private lastFpsUpdate: number = 0;
  
  constructor() {
    this.metrics = {
      fps: 0,
      memoryUsage: null,
      jsHeapSizeLimit: 0,
      totalRenders: 0,
      renderTimes: [],
      lastRenderTime: 0,
      lastUpdated: Date.now(),
      events: [],
      componentStats: [],
      insights: [],
      renderTimeline: []
    };
    
    // Start monitoring on initialization if in browser environment
    if (typeof window !== 'undefined') {
      this.start();
    }
  }
  
  /**
   * Start performance monitoring
   */
  public start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.lastFpsUpdate = this.lastFrameTime;
    
    // Start RAF loop for FPS calculation
    this.measureFps();
    
    // Collect memory usage stats if available
    this.collectMemoryStats();
    
    devLogger.info('PerformanceMonitor', 'Performance monitoring started');
  }
  
  /**
   * Stop performance monitoring
   */
  public stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.rafId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    devLogger.info('PerformanceMonitor', 'Performance monitoring stopped');
  }
  
  /**
   * Measure FPS using requestAnimationFrame
   */
  private measureFps(): void {
    if (!this.isActive || typeof window === 'undefined') return;
    
    const currentTime = performance.now();
    this.frameCount++;
    
    // Calculate FPS every second
    if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      const elapsedTime = currentTime - this.lastFpsUpdate;
      this.metrics.fps = (this.frameCount * 1000) / elapsedTime;
      
      this.lastFpsUpdate = currentTime;
      this.frameCount = 0;
      this.metrics.lastUpdated = Date.now();
      
      // Notify subscribers
      this.notifySubscribers();
      
      // Collect memory stats with each FPS update
      this.collectMemoryStats();
    }
    
    this.lastFrameTime = currentTime;
    this.rafId = window.requestAnimationFrame(() => this.measureFps());
  }
  
  /**
   * Collect memory usage statistics
   */
  private collectMemoryStats(): void {
    if (typeof window === 'undefined') return;
    
    // Check if performance memory API is available (Chrome only)
    const performance = window.performance as any;
    if (performance && performance.memory) {
      const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
      
      this.metrics.memoryUsage = (usedJSHeapSize / jsHeapSizeLimit) * 100;
      this.metrics.jsHeapSizeLimit = jsHeapSizeLimit;
    }
  }
  
  /**
   * Record a component render
   */
  public recordRender(componentName: string, renderTime: number, props?: Record<string, any>): void {
    if (!this.isActive) return;
    
    this.metrics.totalRenders++;
    this.metrics.renderTimes.push(renderTime);
    this.metrics.lastRenderTime = renderTime;
    
    // Keep only the last 100 render times
    if (this.metrics.renderTimes.length > 100) {
      this.metrics.renderTimes.shift();
    }
    
    // Add to timeline
    this.metrics.renderTimeline.push({
      componentName,
      timestamp: Date.now(),
      renderTime,
      renderCount: 1, // Will be updated if the component exists
      props: props ? { ...props } : undefined
    });
    
    // Keep only the last 100 timeline items
    if (this.metrics.renderTimeline.length > 100) {
      this.metrics.renderTimeline.shift();
    }
    
    // Update component stats
    this.updateComponentStats(componentName, renderTime);
    
    // Add event
    this.recordEvent({
      type: 'render',
      description: `Rendered ${componentName} (${renderTime.toFixed(1)}ms)`,
      timestamp: Date.now(),
      duration: renderTime,
      componentName
    });
    
    // Generate insights based on render time
    this.generateRenderInsights(componentName, renderTime);
    
    // Notify subscribers
    this.notifySubscribers();
  }
  
  /**
   * Update component-level statistics
   */
  private updateComponentStats(componentName: string, renderTime: number): void {
    let componentStat = this.metrics.componentStats.find(
      stat => stat.name === componentName
    );
    
    if (!componentStat) {
      componentStat = {
        name: componentName,
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        recentRenderTimes: []
      };
      this.metrics.componentStats.push(componentStat);
    }
    
    componentStat.renderCount++;
    componentStat.totalRenderTime += renderTime;
    componentStat.lastRenderTime = renderTime;
    componentStat.averageRenderTime = componentStat.totalRenderTime / componentStat.renderCount;
    
    // Track recent render times (last 10)
    componentStat.recentRenderTimes.push(renderTime);
    if (componentStat.recentRenderTimes.length > 10) {
      componentStat.recentRenderTimes.shift();
    }
    
    // Update the render count in the timeline
    const timelineItem = this.metrics.renderTimeline.find(
      item => item.componentName === componentName
    );
    if (timelineItem) {
      timelineItem.renderCount = componentStat.renderCount;
    }
  }
  
  /**
   * Record a performance event
   */
  public recordEvent(event: PerformanceEvent): void {
    if (!this.isActive) return;
    
    this.metrics.events.push(event);
    
    // Keep only the last 100 events
    if (this.metrics.events.length > 100) {
      this.metrics.events.shift();
    }
    
    this.metrics.lastUpdated = Date.now();
    this.notifySubscribers();
  }
  
  /**
   * Generate insights based on render performance
   */
  private generateRenderInsights(componentName: string, renderTime: number): void {
    // Generate insights for slow renders
    if (renderTime > 50) {
      const insightId = `slow-render-${componentName}`;
      
      // Check if we already have this insight
      const existingInsight = this.metrics.insights.find(
        insight => insight.id === insightId
      );
      
      if (!existingInsight) {
        this.metrics.insights.push({
          id: insightId,
          title: `Slow render detected in ${componentName}`,
          description: `Component took ${renderTime.toFixed(1)}ms to render, which exceeds the recommended threshold of 50ms.`,
          severity: renderTime > 100 ? 'critical' : 'warning',
          timestamp: Date.now(),
          recommendation: 'Consider optimizing with React.memo or useMemo for expensive calculations.',
          componentName
        });
      }
    }
    
    // Generate insights for components that render too frequently
    const componentStat = this.metrics.componentStats.find(
      stat => stat.name === componentName
    );
    
    if (componentStat && componentStat.renderCount > 50) {
      const insightId = `frequent-renders-${componentName}`;
      
      // Check if we already have this insight
      const existingInsight = this.metrics.insights.find(
        insight => insight.id === insightId
      );
      
      if (!existingInsight) {
        this.metrics.insights.push({
          id: insightId,
          title: `Frequent re-renders in ${componentName}`,
          description: `Component has rendered ${componentStat.renderCount} times, which may indicate inefficient rendering.`,
          severity: 'warning',
          timestamp: Date.now(),
          recommendation: 'Review the component\'s dependencies and consider using React.memo or useCallback.',
          componentName
        });
      }
    }
    
    // Limit the number of insights
    if (this.metrics.insights.length > 20) {
      this.metrics.insights.shift();
    }
  }
  
  /**
   * Add a performance insight manually
   */
  public addInsight(insight: Omit<PerformanceInsight, 'id' | 'timestamp'>): void {
    if (!this.isActive) return;
    
    const id = `insight-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    this.metrics.insights.push({
      ...insight,
      id,
      timestamp: Date.now()
    });
    
    // Limit the number of insights
    if (this.metrics.insights.length > 20) {
      this.metrics.insights.shift();
    }
    
    this.metrics.lastUpdated = Date.now();
    this.notifySubscribers();
  }
  
  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = {
      fps: this.metrics.fps,
      memoryUsage: this.metrics.memoryUsage,
      jsHeapSizeLimit: this.metrics.jsHeapSizeLimit,
      totalRenders: 0,
      renderTimes: [],
      lastRenderTime: 0,
      lastUpdated: Date.now(),
      events: [],
      componentStats: [],
      insights: [],
      renderTimeline: []
    };
    
    this.notifySubscribers();
    devLogger.info('PerformanceMonitor', 'Performance metrics cleared');
  }
  
  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Subscribe to performance updates
   */
  public subscribe(callback: PerformanceSubscriber): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notify all subscribers of updates
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback();
      } catch (error) {
        devLogger.error('PerformanceMonitor', 'Error in subscriber callback', error);
      }
    });
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
