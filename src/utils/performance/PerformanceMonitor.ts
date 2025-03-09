/**
 * PerformanceMonitor class
 * Tracks component render times, frequency, and other performance metrics
 */

import { createSafeFunction } from '@/utils/errorHandling';

// Metric types for component performance
export interface ComponentMetric {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  maxRenderTime: number;
  lastRenderTime: number;
  totalRenderTime: number;
  renderTimestamps: number[];
  recentRenderDurations: number[];
  slowRenders: number;
}

// Subscriber type for the pub/sub pattern
type Subscriber = (metrics: ComponentMetric[]) => void;

// RenderAnalysis for component optimization suggestions
export interface RenderAnalysis {
  componentName: string;
  renderCount: number;
  renderFrequency: 'low' | 'medium' | 'high';
  averageRenderTime: number;
  maxRenderTime: number;
  possibleOptimizations: string[];
  isProblematic: boolean;
}

class PerformanceMonitor {
  private metrics: Map<string, ComponentMetric> = new Map();
  private subscribers: Subscriber[] = [];
  private sessionId: string;
  private throttleInterval: number = 500; // ms
  private lastBatchTime: number = 0;
  private batchedReports: { component: string, duration: number }[] = [];
  
  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[PerformanceMonitor] Initialized with session ID:', this.sessionId);
    }
  }
  
  /**
   * Report a component render with timing information
   */
  reportRender = createSafeFunction((componentName: string, renderDuration: number) => {
    // Skip reporting if component name is not provided
    if (!componentName) return;
    
    const now = Date.now();
    let metric = this.metrics.get(componentName);
    
    if (!metric) {
      metric = {
        componentName,
        renderCount: 0,
        averageRenderTime: 0,
        maxRenderTime: 0,
        lastRenderTime: now,
        totalRenderTime: 0,
        renderTimestamps: [],
        recentRenderDurations: [],
        slowRenders: 0,
      };
      this.metrics.set(componentName, metric);
    }
    
    // Update metrics
    metric.renderCount += 1;
    metric.lastRenderTime = now;
    metric.totalRenderTime += renderDuration;
    metric.recentRenderDurations.push(renderDuration);
    metric.renderTimestamps.push(now);
    
    // Keep only recent render durations (last 10)
    if (metric.recentRenderDurations.length > 10) {
      metric.recentRenderDurations.shift();
    }
    
    // Keep only recent timestamps (last 50)
    if (metric.renderTimestamps.length > 50) {
      metric.renderTimestamps.shift();
    }
    
    // Update average render time
    metric.averageRenderTime = metric.totalRenderTime / metric.renderCount;
    
    // Update max render time if this render was slower
    if (renderDuration > metric.maxRenderTime) {
      metric.maxRenderTime = renderDuration;
    }
    
    // Track slow renders (more than 16ms = below 60fps)
    if (renderDuration > 16) {
      metric.slowRenders += 1;
    }
    
    // Notify subscribers of updated metrics
    this.notifySubscribers();
  }, 'PerformanceMonitor.reportRender');
  
  /**
   * Record batch of renders for efficiency
   */
  recordRenderBatch = (renders: { component: string, duration: number }[]) => {
    const now = Date.now();
    
    // Add to batch
    this.batchedReports.push(...renders);
    
    // Process batch if throttle time has passed
    if (now - this.lastBatchTime > this.throttleInterval) {
      this.processBatch();
      this.lastBatchTime = now;
    }
  };
  
  /**
   * Process batched render reports
   */
  processBatch = () => {
    // Skip if no batched reports
    if (this.batchedReports.length === 0) return;
    
    // Process each report
    for (const report of this.batchedReports) {
      this.reportRender(report.component, report.duration);
    }
    
    // Clear batch
    this.batchedReports = [];
  };
  
  /**
   * Record component unmount
   */
  recordUnmount = (componentName: string) => {
    // Implement if needed
  };
  
  /**
   * Subscribe to metric updates
   */
  subscribe = (callback: Subscriber) => {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  };
  
  /**
   * Notify subscribers of metric updates
   */
  private notifySubscribers = () => {
    const metrics = Array.from(this.metrics.values());
    for (const subscriber of this.subscribers) {
      try {
        subscriber(metrics);
      } catch (error) {
        console.error('[PerformanceMonitor] Error in subscriber:', error);
      }
    }
  };
  
  /**
   * Get metrics for all components
   */
  getAllMetrics = () => {
    return Array.from(this.metrics.values());
  };
  
  /**
   * Get metrics for a specific component
   */
  getMetrics = (componentName: string) => {
    return this.metrics.get(componentName);
  };
  
  /**
   * Get component metrics as an object 
   */
  getComponentMetrics = (componentName: string) => {
    const metric = this.metrics.get(componentName);
    return metric ? { ...metric } : null;
  };
  
  /**
   * Clear all metrics
   */
  clearMetrics = () => {
    this.metrics.clear();
    this.notifySubscribers();
  };
  
  /**
   * Analyze renders for optimization opportunities
   */
  analyzeRenders = (): RenderAnalysis[] => {
    return Array.from(this.metrics.values()).map(metric => {
      const renderFrequency = this.calculateRenderFrequency(metric);
      const possibleOptimizations = this.suggestOptimizations(metric, renderFrequency);
      
      return {
        componentName: metric.componentName,
        renderCount: metric.renderCount,
        renderFrequency,
        averageRenderTime: metric.averageRenderTime,
        maxRenderTime: metric.maxRenderTime,
        possibleOptimizations,
        isProblematic: possibleOptimizations.length > 0
      };
    });
  };
  
  /**
   * Calculate render frequency category based on metrics
   */
  private calculateRenderFrequency = (metric: ComponentMetric): 'low' | 'medium' | 'high' => {
    // Skip if not enough data
    if (metric.renderTimestamps.length < 2) return 'low';
    
    // Calculate average time between renders
    const timestamps = [...metric.renderTimestamps].sort((a, b) => a - b);
    let totalDelta = 0;
    
    for (let i = 1; i < timestamps.length; i++) {
      totalDelta += timestamps[i] - timestamps[i - 1];
    }
    
    const avgTimeBetweenRenders = totalDelta / (timestamps.length - 1);
    
    // Categorize frequency
    if (avgTimeBetweenRenders < 100) return 'high';
    if (avgTimeBetweenRenders < 500) return 'medium';
    return 'low';
  };
  
  /**
   * Suggest optimizations based on render metrics
   */
  private suggestOptimizations = (
    metric: ComponentMetric, 
    frequency: 'low' | 'medium' | 'high'
  ): string[] => {
    const suggestions: string[] = [];
    
    // Suggest memoization for frequently rendering components
    if (frequency === 'high' && metric.renderCount > 10) {
      suggestions.push('Consider using React.memo or useMemo to prevent unnecessary rerenders');
    }
    
    // Suggest optimization for slow renders
    if (metric.averageRenderTime > 16 && metric.renderCount > 5) {
      suggestions.push('Component has slow render times (>16ms), consider optimizing rendering logic');
    }
    
    // Suggest useCallback for components with high render counts
    if (metric.renderCount > 20) {
      suggestions.push('Consider using useCallback for event handlers to prevent recreation on each render');
    }
    
    return suggestions;
  };
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
