
/**
 * Custom Hook for Performance Tracking
 * 
 * Provides component-level performance tracking capabilities.
 */

import { useEffect, useRef, useCallback } from 'react';
import performanceMonitor from '@/utils/performance/performanceMonitor';
import { MetricType } from '@/utils/performance/types';

interface PerformanceTrackingOptions {
  /** Name of the component being tracked */
  componentName: string;
  
  /** Type of metric being tracked */
  metricType?: MetricType;
  
  /** Whether to automatically track render time */
  autoStart?: boolean;
  
  /** Threshold for slow render detection (ms) */
  slowThreshold?: number;
  
  /** Whether to log slow renders to console */
  logSlowRenders?: boolean;
  
  /** Whether to track interaction timings */
  trackInteractions?: boolean;
}

/**
 * Hook for tracking component performance
 */
export const usePerformanceTracking = (options: PerformanceTrackingOptions) => {
  const {
    componentName,
    metricType = 'render',
    autoStart = true,
    slowThreshold = 16, // 1 frame at 60fps
    logSlowRenders = false,
    trackInteractions = false
  } = options;
  
  // Refs to store timing information
  const renderStartTime = useRef<number | null>(null);
  const interactionTimers = useRef<Record<string, number>>({});
  
  /**
   * Start timing the render
   */
  const startTiming = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);
  
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
    performanceMonitor.addComponentMetric(
      componentName,
      duration,
      metricType
    );
    
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
  
  // Automatically track render time if enabled
  useEffect(() => {
    if (autoStart) {
      startTiming();
      return endTiming;
    }
    return undefined;
  }, [autoStart, startTiming, endTiming]);
  
  return {
    startTiming,
    endTiming,
    startInteractionTiming
  };
};

export default usePerformanceTracking;
