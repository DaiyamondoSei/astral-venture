
/**
 * Custom Hook for Performance Tracking
 * 
 * Provides component-level performance tracking capabilities with type safety.
 */

import { useEffect, useRef, useCallback } from 'react';
import performanceMonitor from '@/utils/performance/performanceMonitor';
import { 
  PerformanceTrackingOptions, 
  PerformanceTrackingResult, 
  ComponentMetrics 
} from '@/utils/performance/types';
import { Brand } from '@/utils/types/advancedTypes';

// Brand the component name for type safety
export type ComponentName = Brand<string, 'componentName'>;

// Create a validated component name
function createComponentName(name: string): ComponentName {
  if (!name || name.trim().length === 0) {
    throw new Error('Component name cannot be empty');
  }
  return name as ComponentName;
}

/**
 * Hook for tracking component performance with type safety
 */
export function usePerformanceTracking(
  options: PerformanceTrackingOptions
): PerformanceTrackingResult {
  const {
    componentName: rawComponentName,
    metricType = 'render',
    autoStart = true,
    slowThreshold = 16, // 1 frame at 60fps
    logSlowRenders = false,
    trackInteractions = false,
    trackSize = false,
    trackMemory = false
  } = options;
  
  // Validate and brand the component name
  const componentName = typeof rawComponentName === 'string' 
    ? createComponentName(rawComponentName)
    : rawComponentName;
  
  // Refs to store timing information
  const renderStartTime = useRef<number | null>(null);
  const interactionTimers = useRef<Record<string, number>>({});
  const metricsRef = useRef<ComponentMetrics | null>(null);
  
  /**
   * Start timing the render
   */
  const startTiming = useCallback(() => {
    renderStartTime.current = performance.now();
    
    // Track memory if enabled
    if (trackMemory && (performance as any).memory) {
      const memoryInfo = (performance as any).memory;
      metricsRef.current = {
        ...(metricsRef.current as ComponentMetrics || {
          componentName: componentName as string,
          renderCount: 0,
          totalRenderTime: 0,
          averageRenderTime: 0,
          lastRenderTime: 0,
          memoryUsage: 0,
          renderSizes: []
        }),
        memoryUsage: memoryInfo.usedJSHeapSize
      };
    }
  }, [trackMemory, componentName]);
  
  /**
   * End timing and record the render duration
   */
  const endTiming = useCallback(() => {
    if (renderStartTime.current === null) {
      return;
    }
    
    const endTime = performance.now();
    const duration = endTime - renderStartTime.current;
    
    // Add metric to performance monitor
    const metrics = performanceMonitor.addComponentMetric(
      componentName as string,
      duration,
      metricType
    );
    
    // Store metrics for reference
    metricsRef.current = metrics;
    
    // Log slow renders if enabled
    if (logSlowRenders && duration > slowThreshold) {
      console.warn(`Slow render in ${componentName}: ${duration.toFixed(2)}ms`);
    }
    
    // Reset start time
    renderStartTime.current = null;
  }, [componentName, metricType, logSlowRenders, slowThreshold]);
  
  /**
   * Start timing an interaction
   */
  const startInteractionTiming = useCallback((interactionName: string) => {
    if (!trackInteractions) {
      return () => {}; // No-op if interactions aren't being tracked
    }
    
    const fullName = `${componentName}-${interactionName}`;
    interactionTimers.current[fullName] = performance.now();
    
    // Return function to end timing
    return () => {
      if (interactionTimers.current[fullName]) {
        const endTime = performance.now();
        const duration = endTime - interactionTimers.current[fullName];
        
        // Add metric to performance monitor
        performanceMonitor.addComponentMetric(
          fullName,
          duration,
          'interaction'
        );
        
        // Clean up timer
        delete interactionTimers.current[fullName];
      }
    };
  }, [componentName, trackInteractions]);
  
  /**
   * Get current metrics
   */
  const getMetrics = useCallback((): ComponentMetrics | null => {
    return metricsRef.current;
  }, []);
  
  /**
   * Record component size
   */
  const recordSize = useCallback((domNode: HTMLElement | null) => {
    if (!trackSize || !domNode) return;
    
    // Record DOM node size
    try {
      const size = JSON.stringify(domNode).length;
      
      // Update metrics with size info
      if (metricsRef.current) {
        metricsRef.current = {
          ...metricsRef.current,
          renderSizes: [
            ...(metricsRef.current.renderSizes || []),
            size
          ]
        };
      }
    } catch (error) {
      console.error('Failed to measure component size', error);
    }
  }, [trackSize]);
  
  // Automatically track render time if enabled
  useEffect(() => {
    if (autoStart) {
      startTiming();
      return endTiming;
    }
    return undefined;
  }, [autoStart, startTiming, endTiming]);
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      // Report any pending interactions
      Object.keys(interactionTimers.current).forEach(key => {
        const endTime = performance.now();
        const duration = endTime - interactionTimers.current[key];
        
        performanceMonitor.addComponentMetric(
          key,
          duration,
          'interaction'
        );
      });
      
      // Clear timers
      interactionTimers.current = {};
    };
  }, []);
  
  return {
    startTiming,
    endTiming,
    startInteractionTiming,
    getMetrics,
    recordSize
  };
}

export default usePerformanceTracking;
