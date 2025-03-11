
/**
 * Hook for tracking component performance
 */
import { useRef, useEffect, useState } from 'react';
import { usePerformance } from '../contexts/PerformanceContext';

export interface PerformanceData {
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  mountTime?: number;
  updateTimes: number[];
  interactionTimes: Record<string, number[]>;
}

export interface PerformanceTrackingOptions {
  componentName: string;
  trackMountTime?: boolean;
  trackUpdateTime?: boolean;
  trackInteractions?: boolean;
  enableLogging?: boolean;
}

export function usePerformanceTracking(options: PerformanceTrackingOptions) {
  const { 
    componentName, 
    trackMountTime = false, 
    trackUpdateTime = false, 
    trackInteractions = false,
    enableLogging = false
  } = options;
  
  const { trackMetric, config } = usePerformance();
  const enabled = config.enablePerformanceTracking;
  
  // Performance data refs
  const mountTimeRef = useRef<number | null>(null);
  const renderStartTimeRef = useRef<number | null>(null);
  const updateTimesRef = useRef<number[]>([]);
  const interactionTimesRef = useRef<Record<string, number[]>>({});
  const renderCountRef = useRef<number>(0);
  const totalRenderTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(false);
  
  // Start timing a render cycle
  const startTiming = () => {
    if (!enabled) return;
    renderStartTimeRef.current = performance.now();
  };
  
  // End timing a render cycle and record metrics
  const endTiming = () => {
    if (!enabled || renderStartTimeRef.current === null) return;
    
    const endTime = performance.now();
    const renderTime = endTime - renderStartTimeRef.current;
    
    // Track mount time
    if (trackMountTime && !isMountedRef.current) {
      mountTimeRef.current = renderTime;
      trackMetric(componentName, 'mountTime', renderTime);
      if (enableLogging) {
        console.log(`[Performance] ${componentName} mount time: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    // Track update time
    if (trackUpdateTime && isMountedRef.current) {
      updateTimesRef.current.push(renderTime);
      trackMetric(componentName, 'updateTime', renderTime);
      if (enableLogging) {
        console.log(`[Performance] ${componentName} update time: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    // Update general render stats
    renderCountRef.current += 1;
    totalRenderTimeRef.current += renderTime;
    
    // Track render time metric
    trackMetric(componentName, 'renderTime', renderTime);
    
    // Reset timing
    renderStartTimeRef.current = null;
    
    // Set mounted flag
    isMountedRef.current = true;
  };
  
  // Track an interaction timing
  const startInteractionTiming = (interactionName: string) => {
    if (!enabled || !trackInteractions) return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Initialize interaction array if needed
      if (!interactionTimesRef.current[interactionName]) {
        interactionTimesRef.current[interactionName] = [];
      }
      
      // Record interaction time
      interactionTimesRef.current[interactionName].push(duration);
      
      // Track metric
      trackMetric(componentName, `interaction.${interactionName}`, duration);
      
      if (enableLogging) {
        console.log(`[Performance] ${componentName} interaction '${interactionName}': ${duration.toFixed(2)}ms`);
      }
    };
  };
  
  // Get the current performance data
  const getPerformanceData = (): PerformanceData => {
    const averageRenderTime = renderCountRef.current > 0
      ? totalRenderTimeRef.current / renderCountRef.current
      : 0;
    
    return {
      renderCount: renderCountRef.current,
      totalRenderTime: totalRenderTimeRef.current,
      averageRenderTime,
      lastRenderTime: updateTimesRef.current[updateTimesRef.current.length - 1] || 0,
      mountTime: mountTimeRef.current || undefined,
      updateTimes: [...updateTimesRef.current],
      interactionTimes: { ...interactionTimesRef.current }
    };
  };
  
  // Start timing for the initial render
  useEffect(() => {
    startTiming();
    
    // End timing when the component mounts
    return () => {
      if (isMountedRef.current && enabled) {
        // Final reporting of metrics
        const data = getPerformanceData();
        if (enableLogging) {
          console.log(`[Performance] ${componentName} final stats:`, data);
        }
      }
    };
  }, []);
  
  return {
    startTiming,
    endTiming,
    startInteractionTiming,
    getPerformanceData
  };
}
