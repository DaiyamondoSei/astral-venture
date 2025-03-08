/**
 * Advanced Performance Monitoring System
 * 
 * This system tracks component rendering performance, identifies bottlenecks,
 * and provides insights for optimization opportunities.
 */

import { devLogger } from '@/utils/debugUtils';

export type ComponentRenderData = {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRenderTimestamp: number;
  propsSnapshot?: Record<string, any>;
  stateSnapshot?: Record<string, any>;
  renderPath: string[];
};

export type PerformanceMetric = {
  metricName: string;
  value: number;
  timestamp: number;
  threshold?: number;
  exceededThreshold?: boolean;
  componentName?: string;
  context?: Record<string, any>;
};

class PerformanceMonitorService {
  private static instance: PerformanceMonitorService;
  private componentRenderData: Map<string, ComponentRenderData> = new Map();
  private metrics: PerformanceMetric[] = [];
  private thresholds: Record<string, number> = {
    renderTime: 16, // ms (targeting 60fps)
    renderCount: 5, // renders per second
    componentComplexity: 100, // arbitrary score
    propCount: 10, // props per component
    stateCount: 5, // state variables per component
  };
  private isEnabled = process.env.NODE_ENV === 'development';
  private renderPathStack: string[] = [];
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): PerformanceMonitorService {
    if (!PerformanceMonitorService.instance) {
      PerformanceMonitorService.instance = new PerformanceMonitorService();
    }
    return PerformanceMonitorService.instance;
  }
  
  /**
   * Start tracking a component render cycle
   */
  public startComponentRender(componentName: string): number {
    if (!this.isEnabled) return 0;
    
    this.renderPathStack.push(componentName);
    
    // Return the start time to be used for the end calculation
    return performance.now();
  }
  
  /**
   * End tracking a component render cycle
   */
  public endComponentRender(
    componentName: string, 
    startTime: number,
    props?: Record<string, any>,
    state?: Record<string, any>
  ): void {
    if (!this.isEnabled) return;
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    const now = Date.now();
    
    // Pop the current component from the render path stack
    if (this.renderPathStack[this.renderPathStack.length - 1] === componentName) {
      this.renderPathStack.pop();
    }
    
    // Get existing data or initialize new data
    const existingData = this.componentRenderData.get(componentName) || {
      componentName,
      renderTime: 0,
      renderCount: 0,
      lastRenderTimestamp: 0,
      renderPath: []
    };
    
    // Update the data
    const newData: ComponentRenderData = {
      ...existingData,
      renderTime: renderTime,
      renderCount: existingData.renderCount + 1,
      lastRenderTimestamp: now,
      propsSnapshot: props,
      stateSnapshot: state,
      renderPath: [...this.renderPathStack] // Current render path (parent components)
    };
    
    this.componentRenderData.set(componentName, newData);
    
    // Record metric for this render
    this.recordMetric({
      metricName: 'renderTime',
      value: renderTime,
      timestamp: now,
      threshold: this.thresholds.renderTime,
      exceededThreshold: renderTime > this.thresholds.renderTime,
      componentName
    });
    
    // Check for performance issues
    if (renderTime > this.thresholds.renderTime) {
      devLogger.warn(
        'PerformanceMonitor',
        `Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
      );
      
      // Analyze what might be causing the slow render
      this.analyzeRenderPerformance(componentName, renderTime, props, state);
    }
  }
  
  /**
   * Record a general performance metric
   */
  public recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;
    
    this.metrics.push(metric);
    
    // Keep metrics array from growing too large
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }
  
  /**
   * Get recent metrics for a component
   */
  public getComponentMetrics(componentName: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.componentName === componentName);
  }
  
  /**
   * Get components that exceed performance thresholds
   */
  public getPerformanceBottlenecks(): {
    component: ComponentRenderData;
    issues: string[];
  }[] {
    const bottlenecks: {
      component: ComponentRenderData;
      issues: string[];
    }[] = [];
    
    this.componentRenderData.forEach(data => {
      const issues: string[] = [];
      
      // Check render time
      if (data.renderTime > this.thresholds.renderTime) {
        issues.push(`Slow render time (${data.renderTime.toFixed(2)}ms)`);
      }
      
      // Check if props are large
      if (data.propsSnapshot && Object.keys(data.propsSnapshot).length > this.thresholds.propCount) {
        issues.push(`High prop count (${Object.keys(data.propsSnapshot).length})`);
      }
      
      // Check if state is large
      if (data.stateSnapshot && Object.keys(data.stateSnapshot).length > this.thresholds.stateCount) {
        issues.push(`High state variable count (${Object.keys(data.stateSnapshot).length})`);
      }
      
      if (issues.length > 0) {
        bottlenecks.push({ component: data, issues });
      }
    });
    
    return bottlenecks;
  }
  
  /**
   * Analyze what might be causing slow renders
   */
  private analyzeRenderPerformance(
    componentName: string, 
    renderTime: number,
    props?: Record<string, any>,
    state?: Record<string, any>
  ): void {
    // Check for large prop objects
    if (props) {
      const propCount = Object.keys(props).length;
      if (propCount > this.thresholds.propCount) {
        devLogger.warn(
          'PerformanceMonitor',
          `${componentName} has ${propCount} props, which may cause performance issues`
        );
        
        // Look for large objects in props
        for (const [key, value] of Object.entries(props)) {
          if (typeof value === 'object' && value !== null) {
            try {
              const size = JSON.stringify(value).length;
              if (size > 1000) { // Arbitrary threshold for large props
                devLogger.warn(
                  'PerformanceMonitor',
                  `Large prop detected: ${componentName}.${key} (${size} bytes)`
                );
              }
            } catch (e) {
              // Ignore serialization errors
            }
          }
        }
      }
    }
    
    // Check for excessive state
    if (state) {
      const stateCount = Object.keys(state).length;
      if (stateCount > this.thresholds.stateCount) {
        devLogger.warn(
          'PerformanceMonitor',
          `${componentName} has ${stateCount} state variables, consider refactoring state management`
        );
      }
    }
    
    // Suggest using memo or callback if not already
    devLogger.info(
      'PerformanceMonitor',
      `Optimization tips for ${componentName}:
      1. Consider using React.memo for pure functional components
      2. Use useCallback for function props
      3. Use useMemo for expensive calculations
      4. Consider splitting into smaller components`
    );
  }
  
  /**
   * Reset all collected metrics
   */
  public reset(): void {
    this.componentRenderData.clear();
    this.metrics = [];
    this.renderPathStack = [];
  }
  
  /**
   * Get summary of all components performance
   */
  public getPerformanceSummary(): {
    totalComponents: number;
    slowComponents: number;
    averageRenderTime: number;
    worstComponents: { name: string; renderTime: number }[];
  } {
    const components = Array.from(this.componentRenderData.values());
    const totalComponents = components.length;
    const slowComponents = components.filter(c => c.renderTime > this.thresholds.renderTime).length;
    
    const totalRenderTime = components.reduce((sum, comp) => sum + comp.renderTime, 0);
    const averageRenderTime = totalComponents ? totalRenderTime / totalComponents : 0;
    
    const sortedByTime = [...components].sort((a, b) => b.renderTime - a.renderTime);
    const worstComponents = sortedByTime.slice(0, 5).map(c => ({
      name: c.componentName,
      renderTime: c.renderTime
    }));
    
    return {
      totalComponents,
      slowComponents,
      averageRenderTime,
      worstComponents
    };
  }
}

// Export the singleton instance
export const performanceMonitor = PerformanceMonitorService.getInstance();
