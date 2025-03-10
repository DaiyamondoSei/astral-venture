
/**
 * Performance Tracking Hook
 * 
 * Custom hook for tracking component performance including render times
 * and user interactions.
 */

import { useCallback, useEffect, useRef } from 'react';
import { usePerfConfig } from './usePerfConfig';
import performanceMonitor from '@/utils/performance/performanceMonitor';
import type { MetricType } from '@/utils/performance/types';

export interface UsePerformanceTrackingOptions {
  /**
   * Name of the component being tracked
   */
  componentName?: string;
  
  /**
   * Whether to track interactions
   */
  trackInteractions?: boolean;
  
  /**
   * Whether to track renders
   */
  trackRenders?: boolean;
  
  /**
   * Whether to disable automatic reporting
   */
  disableAutoReport?: boolean;
  
  /**
   * Interval for automatic reporting in milliseconds
   */
  reportInterval?: number;
  
  /**
   * Whether to log slow renders to the console
   */
  logSlowRenders?: boolean;
  
  /**
   * Custom threshold for slow renders in milliseconds
   */
  slowRenderThreshold?: number;
  
  /**
   * Categories for this component, used for filtering
   */
  categories?: string[];
  
  /**
   * Whether to auto-start tracking
   */
  autoStart?: boolean;
}

/**
 * Hook for tracking component performance
 * 
 * Provides utilities for measuring and reporting component performance metrics
 * like render times and user interactions.
 */
export function usePerformanceTracking(
  options: UsePerformanceTrackingOptions = {}
) {
  const {
    componentName = 'UnnamedComponent',
    trackInteractions = true,
    trackRenders = true,
    disableAutoReport = false,
    reportInterval = 30000, // 30 seconds
    logSlowRenders = false,
    slowRenderThreshold = 16, // 16ms = 1 frame at 60fps
    categories = [],
    autoStart = true,
  } = options;

  const { config } = usePerfConfig();
  const reportIntervalRef = useRef<number | null>(null);
  const interactionTimers = useRef<Record<string, number>>({});
  const lastRenderTime = useRef<number | null>(null);
  const enabled = useRef(autoStart);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (reportIntervalRef.current) {
        window.clearInterval(reportIntervalRef.current);
      }
    };
  }, []);

  // Set up auto-reporting
  useEffect(() => {
    if (config.enablePerformanceTracking && !disableAutoReport) {
      // Clear any existing interval
      if (reportIntervalRef.current) {
        window.clearInterval(reportIntervalRef.current);
      }

      // Set up new interval
      reportIntervalRef.current = window.setInterval(() => {
        performanceMonitor.reportNow();
      }, reportInterval);

      // Report on unmount
      return () => {
        if (reportIntervalRef.current) {
          window.clearInterval(reportIntervalRef.current);
        }
        performanceMonitor.reportNow();
      };
    }
  }, [config.enablePerformanceTracking, disableAutoReport, reportInterval]);

  /**
   * Records a component render time
   */
  const recordRenderTime = useCallback((time: number) => {
    if (!enabled.current) return;
    if (config.enablePerformanceTracking && trackRenders) {
      performanceMonitor.addComponentMetric(componentName, time, 'render');
      
      if (logSlowRenders && time > slowRenderThreshold) {
        console.warn(`Slow render detected in ${componentName}: ${time.toFixed(2)}ms`);
      }
      
      lastRenderTime.current = time;
    }
  }, [componentName, config.enablePerformanceTracking, trackRenders, logSlowRenders, slowRenderThreshold]);

  /**
   * Starts timing an interaction and returns a function to stop and record it
   */
  const startInteractionTiming = useCallback((interactionName: string) => {
    if (!enabled.current) return () => {};
    if (!config.enablePerformanceTracking || !trackInteractions) {
      return () => {}; // No-op
    }

    const fullName = `${componentName}:${interactionName}`;
    interactionTimers.current[interactionName] = performance.now();

    return () => {
      const startTime = interactionTimers.current[interactionName];
      if (startTime) {
        const duration = performance.now() - startTime;
        performanceMonitor.addComponentMetric(fullName, duration, 'interaction');
        delete interactionTimers.current[interactionName];
      }
    };
  }, [componentName, config.enablePerformanceTracking, trackInteractions]);

  /**
   * Tracks a simple user interaction and returns metadata
   */
  const trackInteraction = useCallback((interactionName: string) => {
    if (!enabled.current) return () => {};
    const endTiming = startInteractionTiming(interactionName);
    
    return () => {
      endTiming();
      return {
        componentName,
        interactionName,
        timestamp: new Date().toISOString()
      };
    };
  }, [componentName, startInteractionTiming]);

  /**
   * Tracks an event with a manually specified duration
   */
  const trackEvent = useCallback((eventName: string, duration: number) => {
    if (!enabled.current) return;
    if (config.enablePerformanceTracking) {
      const fullName = `${componentName}:${eventName}`;
      performanceMonitor.addComponentMetric(fullName, duration, 'interaction');
    }
  }, [componentName, config.enablePerformanceTracking]);

  /**
   * Enables or disables performance tracking
   */
  const setEnabled = useCallback((value: boolean) => {
    enabled.current = value;
  }, []);

  return {
    recordRenderTime,
    startInteractionTiming,
    trackInteraction,
    trackEvent,
    setEnabled,
    isEnabled: enabled.current
  };
}

export default usePerformanceTracking;
