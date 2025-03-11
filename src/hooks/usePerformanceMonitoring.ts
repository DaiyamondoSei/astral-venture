
/**
 * Hook for performance monitoring
 * 
 * Provides performance monitoring and optimization for components.
 */
import { useRef, useEffect, useCallback } from 'react';
import { usePerfConfig } from './usePerfConfig';
import { Result, success, failure } from '../utils/result/Result';
import { asyncResultify } from '../utils/result/AsyncResult';

// Performance tracking options
export interface PerformanceOptions {
  componentName: string;
  enabled?: boolean;
  trackRenderTime?: boolean;
  trackMemory?: boolean;
  trackInteractions?: boolean;
  trackSize?: boolean;
  reportToAnalytics?: boolean;
  slowThreshold?: number;
}

// Performance metrics
export interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  slowRenderCount: number;
  peakMemoryUsage: number;
  currentMemoryUsage: number;
  domSize?: {
    width: number;
    height: number;
    elementCount: number;
  };
  interactions: Record<string, {
    count: number;
    averageResponseTime: number;
    lastResponseTime: number;
  }>;
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitoring(options: PerformanceOptions) {
  const {
    componentName,
    enabled = true,
    trackRenderTime = true,
    trackMemory = false,
    trackInteractions = false,
    trackSize = false,
    reportToAnalytics = false,
    slowThreshold = 16
  } = options;
  
  const { config } = usePerfConfig();
  
  // Only enable if both the hook option and global config allow it
  const isEnabled = enabled && config.enablePerformanceTracking;
  
  // Refs for timing and metrics
  const renderStartTimeRef = useRef<number | null>(null);
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    slowRenderCount: 0,
    peakMemoryUsage: 0,
    currentMemoryUsage: 0,
    interactions: {}
  });
  
  // DOM node ref for size tracking
  const nodeRef = useRef<HTMLElement | null>(null);
  
  // Start timing the render
  const startTiming = useCallback(() => {
    if (!isEnabled || !trackRenderTime) return;
    renderStartTimeRef.current = performance.now();
  }, [isEnabled, trackRenderTime]);
  
  // End timing and calculate metrics
  const endTiming = useCallback(() => {
    if (!isEnabled || !trackRenderTime || renderStartTimeRef.current === null) return;
    
    const endTime = performance.now();
    const renderTime = endTime - renderStartTimeRef.current;
    
    // Update metrics
    const metrics = metricsRef.current;
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    
    // Calculate running average
    metrics.averageRenderTime = 
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;
    
    // Check if this was a slow render
    if (renderTime > slowThreshold) {
      metrics.slowRenderCount++;
      
      if (config.debugMode) {
        console.warn(`[${componentName}] Slow render detected: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    // Track memory usage if enabled and available
    if (trackMemory && window.performance && (window.performance as any).memory) {
      const memory = (window.performance as any).memory;
      metrics.currentMemoryUsage = memory.usedJSHeapSize;
      metrics.peakMemoryUsage = Math.max(metrics.peakMemoryUsage, memory.usedJSHeapSize);
    }
    
    // Report metrics if enabled
    if (reportToAnalytics) {
      void reportMetrics({
        componentName,
        metricName: 'renderTime',
        value: renderTime
      });
    }
    
    // Reset timer
    renderStartTimeRef.current = null;
  }, [isEnabled, trackRenderTime, componentName, slowThreshold, config.debugMode, trackMemory, reportToAnalytics]);
  
  // Create a tracking function for user interactions
  const trackInteraction = useCallback((interactionName: string) => {
    if (!isEnabled || !trackInteractions) return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Update metrics
      const metrics = metricsRef.current;
      
      // Initialize if first time seeing this interaction
      if (!metrics.interactions[interactionName]) {
        metrics.interactions[interactionName] = {
          count: 0,
          averageResponseTime: 0,
          lastResponseTime: 0
        };
      }
      
      const interaction = metrics.interactions[interactionName];
      interaction.count++;
      interaction.lastResponseTime = responseTime;
      
      // Calculate running average
      interaction.averageResponseTime = 
        (interaction.averageResponseTime * (interaction.count - 1) + responseTime) / interaction.count;
      
      // Report metrics if enabled
      if (reportToAnalytics) {
        void reportMetrics({
          componentName,
          metricName: `interaction.${interactionName}`,
          value: responseTime
        });
      }
    };
  }, [isEnabled, trackInteractions, componentName, reportToAnalytics]);
  
  // Measure DOM node size
  const measureSize = useCallback(() => {
    if (!isEnabled || !trackSize || !nodeRef.current) return;
    
    const node = nodeRef.current;
    const rect = node.getBoundingClientRect();
    const elementCount = node.querySelectorAll('*').length;
    
    metricsRef.current.domSize = {
      width: rect.width,
      height: rect.height,
      elementCount
    };
    
    if (reportToAnalytics) {
      void reportMetrics({
        componentName,
        metricName: 'domElementCount',
        value: elementCount
      });
    }
  }, [isEnabled, trackSize, componentName, reportToAnalytics]);
  
  // Set the DOM node ref
  const setNodeRef = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
    if (node && trackSize) {
      // Use ResizeObserver if available
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => {
          measureSize();
        });
        observer.observe(node);
        return () => observer.disconnect();
      } else {
        // Fallback to direct measurement
        measureSize();
      }
    }
  }, [trackSize, measureSize]);
  
  // Get the current metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    return { ...metricsRef.current };
  }, []);
  
  // Setup effect
  useEffect(() => {
    if (!isEnabled) return;
    
    // Start timing
    startTiming();
    
    // Report unmount
    return () => {
      // Final logging
      if (config.debugMode) {
        console.log(`[${componentName}] Performance metrics:`, getMetrics());
      }
    };
  }, [isEnabled, startTiming, componentName, config.debugMode, getMetrics]);
  
  // Async report metrics function with error handling
  const reportMetrics = asyncResultify(async ({ 
    componentName,
    metricName,
    value
  }: {
    componentName: string;
    metricName: string;
    value: number;
  }): Promise<Result<boolean, Error>> => {
    // Report to analytics endpoint if available
    // This is a placeholder - actual implementation would send to analytics service
    if (config.debugMode) {
      console.log(`[Analytics] ${componentName}.${metricName} = ${value}`);
    }
    return success(true);
  });
  
  return {
    startTiming,
    endTiming,
    trackInteraction,
    setNodeRef,
    getMetrics,
    isEnabled
  };
}
