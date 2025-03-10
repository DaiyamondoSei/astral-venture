
import { useEffect, useRef, useCallback } from 'react';

// Define performance metrics interface
export interface PerformanceMetric {
  component_name: string;
  event_name?: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
  category?: string[];
}

// Create a singleton for performance metrics collection
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private config = {
    enabled: true,
    logLevel: 'medium' as 'high' | 'medium' | 'low',
    slowRenderThreshold: 16.67, // ms (60fps)
    slowInteractionThreshold: 100, // ms
    debugLogging: false
  };

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public addComponentMetric(
    componentName: string, 
    renderTime: number,
    type: 'load' | 'render' | 'interaction' = 'render'
  ): void {
    if (!this.config.enabled) return;

    this.metrics.push({
      component_name: componentName,
      event_name: type,
      duration: renderTime,
      timestamp: new Date().toISOString(),
      category: ['component', type]
    });

    if (
      this.config.debugLogging && 
      ((type === 'render' && renderTime > this.config.slowRenderThreshold) ||
       (type === 'interaction' && renderTime > this.config.slowInteractionThreshold))
    ) {
      console.warn(`Slow ${type} detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }

  public recordRender(
    componentName: string,
    renderTime: number,
    metadata: Record<string, unknown> = {}
  ): void {
    this.addComponentMetric(componentName, renderTime, 'render');
  }

  public recordInteraction(
    componentName: string,
    interactionName: string,
    duration: number,
    metadata: Record<string, unknown> = {}
  ): void {
    if (!this.config.enabled) return;

    this.metrics.push({
      component_name: componentName,
      event_name: interactionName,
      duration,
      timestamp: new Date().toISOString(),
      metadata,
      category: ['interaction']
    });

    if (
      this.config.debugLogging && 
      duration > this.config.slowInteractionThreshold
    ) {
      console.warn(`Slow interaction "${interactionName}" in ${componentName}: ${duration.toFixed(2)}ms`);
    }
  }

  public addWebVital(
    name: string,
    value: number,
    category: 'loading' | 'interaction' | 'visual_stability'
  ): void {
    if (!this.config.enabled) return;

    this.metrics.push({
      component_name: 'WebVitals',
      event_name: name,
      duration: value,
      timestamp: new Date().toISOString(),
      category: ['web-vital', category]
    });
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public updateConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig() {
    return { ...this.config };
  }

  public async reportNow(): Promise<{ success: boolean; message?: string }> {
    // This would send metrics to a server in a real implementation
    console.info(`Reporting ${this.metrics.length} performance metrics`);
    return { success: true };
  }
}

// Export singleton instance
export const performanceMetrics = PerformanceMonitor.getInstance();

export interface UsePerformanceTrackingOptions {
  enabled?: boolean;
  trackRenders?: boolean;
  trackInteractions?: boolean;
  componentName?: string;
  logSlowRenders?: boolean;
  autoStart?: boolean;
  trackMemory?: boolean;
  categories?: string[];
}

/**
 * Enhanced hook for comprehensive performance tracking
 */
export function usePerformanceTracking(
  componentNameOrOptions?: string | UsePerformanceTrackingOptions,
  options: UsePerformanceTrackingOptions = {}
) {
  // Process arguments to support both patterns:
  // usePerformanceTracking('ComponentName', options)
  // usePerformanceTracking(options)
  let componentName: string;
  let mergedOptions: UsePerformanceTrackingOptions;
  
  if (typeof componentNameOrOptions === 'string') {
    componentName = componentNameOrOptions;
    mergedOptions = options;
  } else {
    componentName = options.componentName || '';
    mergedOptions = componentNameOrOptions || {};
  }
  
  const {
    enabled = true,
    trackRenders = true,
    trackInteractions = true,
    logSlowRenders = false,
    autoStart = false,
    trackMemory = false,
    categories = []
  } = mergedOptions;
  
  const renderStartTime = useRef<number>(0);
  const interactionTimings = useRef<Map<string, number>>(new Map());
  const sessionStartTime = useRef<number>(Date.now());
  
  const componentNameRef = useRef<string>(
    componentName || 
    // Try to get component name from the call stack
    new Error().stack?.split('\n')[2]?.trim().split(' ')[1] ||
    'UnknownComponent'
  );
  
  // Track component mount and render
  useEffect(() => {
    if (!enabled || !trackRenders) return;
    
    // Calculate render time on mount
    const renderTime = performance.now() - renderStartTime.current;
    
    // Only record if time is valid
    if (renderTime > 0 && renderTime < 10000) { // Sanity check for unrealistic times
      performanceMetrics.recordRender(componentNameRef.current, renderTime, {
        categories,
        isSlowRender: logSlowRenders && renderTime > 16.67, // 60fps threshold
        sessionUptime: Date.now() - sessionStartTime.current,
        memoryUsage: trackMemory && (performance as any).memory?.usedJSHeapSize
      });
    }
    
    // Track subsequent renders
    return () => {
      renderStartTime.current = performance.now();
    };
  });
  
  // Set initial render start time
  if (renderStartTime.current === 0) {
    renderStartTime.current = performance.now();
  }
  
  /**
   * Start timing an interaction and return a function to end timing
   */
  const startInteractionTiming = useCallback((interactionName: string): (() => void) => {
    if (!enabled || !trackInteractions) return () => {};
    
    const startTime = performance.now();
    interactionTimings.current.set(interactionName, startTime);
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - interactionTimings.current.get(interactionName)!;
      
      performanceMetrics.recordInteraction(
        componentNameRef.current,
        interactionName,
        duration,
        {
          categories,
          timestamp: new Date().toISOString()
        }
      );
      
      interactionTimings.current.delete(interactionName);
    };
  }, [enabled, trackInteractions, categories]);
  
  /**
   * Track a completed interaction
   * Returns a function that can be called to track the end of the interaction
   */
  const trackInteraction = useCallback((interactionName: string) => {
    return () => {
      if (!enabled || !trackInteractions) return;
      
      const startTime = performance.now();
      
      return () => {
        const duration = performance.now() - startTime;
        performanceMetrics.recordInteraction(
          componentNameRef.current,
          interactionName,
          duration,
          {
            categories
          }
        );
      };
    };
  }, [enabled, trackInteractions, categories]);
  
  /**
   * Record a one-time interaction with a known duration
   */
  const recordInteraction = useCallback((interactionName: string, duration: number, metadata?: Record<string, unknown>) => {
    if (!enabled || !trackInteractions) return;
    
    performanceMetrics.recordInteraction(
      componentNameRef.current,
      interactionName,
      duration,
      {
        ...metadata,
        categories,
        timestamp: new Date().toISOString()
      }
    );
  }, [enabled, trackInteractions, categories]);
  
  // Auto-start timing if requested
  useEffect(() => {
    if (autoStart) {
      const endTiming = startInteractionTiming('componentLifetime');
      return () => {
        endTiming();
      };
    }
  }, [autoStart, startInteractionTiming]);
  
  return {
    trackInteraction,
    startInteractionTiming,
    recordInteraction,
    componentName: componentNameRef.current
  };
}

export default usePerformanceTracking;
