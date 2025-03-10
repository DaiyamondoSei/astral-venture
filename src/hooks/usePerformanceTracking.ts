
/**
 * Hook for tracking component performance metrics
 * Part of the performance monitoring system
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { logEvent } from '@/utils/logging';

export interface PerformanceTrackingOptions {
  /**
   * Automatically start tracking on component mount
   */
  autoStart?: boolean;
  
  /**
   * Threshold in ms for slow renders
   */
  slowRenderThreshold?: number;
  
  /**
   * Track user interactions in the component
   */
  trackInteractions?: boolean;
  
  /**
   * Log slow renders to console
   */
  logSlowRenders?: boolean;
  
  /**
   * Send metrics to backend for analysis
   */
  reportToBackend?: boolean;
  
  /**
   * Track memory usage if available
   */
  trackMemoryUsage?: boolean;
  
  /**
   * Custom tags for categorizing metrics
   */
  tags?: string[];
}

export interface TimingResult {
  /**
   * Duration of the operation in milliseconds
   */
  duration: number;
  
  /**
   * Start timestamp
   */
  startTime: number;
  
  /**
   * End timestamp
   */
  endTime: number;
  
  /**
   * Name of the interaction
   */
  name: string;
}

export interface PerformanceMetrics {
  /**
   * Total render count
   */
  renderCount: number;
  
  /**
   * Average render time in ms
   */
  averageRenderTime: number;
  
  /**
   * Latest render time in ms
   */
  lastRenderTime: number;
  
  /**
   * Longest render time in ms
   */
  longestRenderTime: number;
  
  /**
   * Count of slow renders
   */
  slowRenderCount: number;
  
  /**
   * User interactions with timing
   */
  interactions: Record<string, TimingResult[]>;
  
  /**
   * Last update timestamp
   */
  lastUpdated: number;
  
  /**
   * Memory usage in MB if available
   */
  memoryUsage?: number;
  
  /**
   * Custom performance markers
   */
  markers: Record<string, number>;
}

/**
 * Hook for tracking and analyzing component performance
 */
export function usePerformanceTracking(
  componentName: string,
  options: PerformanceTrackingOptions = {}
) {
  // Default options
  const {
    autoStart = false,
    slowRenderThreshold = 50,
    trackInteractions = false,
    logSlowRenders = true,
    reportToBackend = false,
    trackMemoryUsage = false,
    tags = []
  } = options;
  
  // Performance state
  const [isTracking, setIsTracking] = useState(autoStart);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    longestRenderTime: 0,
    slowRenderCount: 0,
    interactions: {},
    lastUpdated: Date.now(),
    markers: {}
  });
  
  // Timing references
  const renderStartTimeRef = useRef<number | null>(null);
  const totalRenderTimeRef = useRef(0);
  const interactionTimingRef = useRef<Record<string, number>>({});
  
  // Track memory usage if enabled and supported
  useEffect(() => {
    if (isTracking && trackMemoryUsage && 'memory' in performance) {
      const interval = setInterval(() => {
        const memory = (performance as any).memory;
        if (memory) {
          setMetrics(prev => ({
            ...prev,
            memoryUsage: Math.round(memory.usedJSHeapSize / (1024 * 1024)),
            lastUpdated: Date.now()
          }));
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isTracking, trackMemoryUsage]);
  
  // Start timing the current render
  useEffect(() => {
    if (isTracking) {
      renderStartTimeRef.current = performance.now();
      
      return () => {
        if (renderStartTimeRef.current !== null) {
          const renderTime = performance.now() - renderStartTimeRef.current;
          renderStartTimeRef.current = null;
          
          totalRenderTimeRef.current += renderTime;
          
          setMetrics(prev => {
            const newRenderCount = prev.renderCount + 1;
            const newAverageTime = totalRenderTimeRef.current / newRenderCount;
            const isSlowRender = renderTime > slowRenderThreshold;
            
            if (isSlowRender && logSlowRenders) {
              logEvent('performance', `Slow render detected in ${componentName}`, {
                renderTime,
                threshold: slowRenderThreshold,
                componentName
              });
            }
            
            return {
              renderCount: newRenderCount,
              averageRenderTime: newAverageTime,
              lastRenderTime: renderTime,
              longestRenderTime: Math.max(prev.longestRenderTime, renderTime),
              slowRenderCount: isSlowRender ? prev.slowRenderCount + 1 : prev.slowRenderCount,
              interactions: { ...prev.interactions },
              lastUpdated: Date.now(),
              memoryUsage: prev.memoryUsage,
              markers: { ...prev.markers }
            };
          });
        }
      };
    }
  }, [isTracking, componentName, slowRenderThreshold, logSlowRenders]);
  
  // Start performance tracking
  const startTracking = useCallback(() => {
    setIsTracking(true);
  }, []);
  
  // Stop performance tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);
  
  // Reset metrics
  const resetMetrics = useCallback(() => {
    totalRenderTimeRef.current = 0;
    interactionTimingRef.current = {};
    
    setMetrics({
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      longestRenderTime: 0,
      slowRenderCount: 0,
      interactions: {},
      lastUpdated: Date.now(),
      memoryUsage: undefined,
      markers: {}
    });
  }, []);
  
  // Start timing an interaction
  const startInteractionTiming = useCallback((interactionName: string) => {
    if (!isTracking || !trackInteractions) return () => {};
    
    const startTime = performance.now();
    interactionTimingRef.current[interactionName] = startTime;
    
    return (metadata?: Record<string, unknown>) => {
      const endTime = performance.now();
      const startTimeValue = interactionTimingRef.current[interactionName];
      
      if (startTimeValue) {
        const duration = endTime - startTimeValue;
        
        setMetrics(prev => {
          const interactions = { ...prev.interactions };
          const existing = interactions[interactionName] || [];
          
          const timingResult: TimingResult = {
            duration,
            startTime: startTimeValue,
            endTime,
            name: interactionName
          };
          
          interactions[interactionName] = [...existing, timingResult];
          
          if (logSlowRenders && duration > slowRenderThreshold) {
            logEvent('performance', `Slow interaction detected in ${componentName}`, {
              interactionName,
              duration,
              threshold: slowRenderThreshold,
              componentName,
              ...metadata
            });
          }
          
          return {
            ...prev,
            interactions,
            lastUpdated: Date.now()
          };
        });
        
        delete interactionTimingRef.current[interactionName];
      }
    };
  }, [isTracking, trackInteractions, componentName, slowRenderThreshold, logSlowRenders]);
  
  // Add a performance marker
  const addMarker = useCallback((markerName: string, value?: number) => {
    if (!isTracking) return;
    
    const markerValue = value ?? performance.now();
    
    setMetrics(prev => ({
      ...prev,
      markers: {
        ...prev.markers,
        [markerName]: markerValue
      },
      lastUpdated: Date.now()
    }));
  }, [isTracking]);
  
  // Send metrics to backend if enabled
  useEffect(() => {
    if (reportToBackend && metrics.renderCount > 0) {
      const reportInterval = setInterval(() => {
        // This would be implemented to send metrics to your API
        // Using a debounce to prevent too frequent updates
      }, 30000); // Report every 30 seconds
      
      return () => clearInterval(reportInterval);
    }
  }, [reportToBackend, metrics]);
  
  // Fetch component performance history from backend
  const { data: performanceHistory } = useQuery({
    queryKey: ['componentPerformance', componentName, ...tags],
    queryFn: async () => {
      // This would fetch historical performance data
      return [];
    },
    enabled: reportToBackend,
    refetchOnWindowFocus: false
  });
  
  return {
    metrics,
    isTracking,
    startTracking,
    stopTracking,
    resetMetrics,
    startInteractionTiming,
    addMarker,
    performanceHistory
  };
}
