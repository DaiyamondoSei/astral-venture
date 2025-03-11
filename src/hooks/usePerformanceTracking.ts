
/**
 * Hook for tracking component performance
 */
import { useRef, useEffect, useState, useCallback, MutableRefObject } from 'react';
import { usePerformance } from '../contexts/PerformanceContext';

export interface PerformanceData {
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  mountTime?: number;
  updateTimes: number[];
  interactionTimes: Record<string, number[]>;
  domSize?: {
    width: number;
    height: number;
    elements: number;
  };
}

export interface PerformanceTrackingOptions {
  componentName: string;
  trackMountTime?: boolean;
  trackUpdateTime?: boolean;
  trackInteractions?: boolean;
  trackDomSize?: boolean;
  enableLogging?: boolean;
}

export function usePerformanceTracking(options: PerformanceTrackingOptions) {
  const { 
    componentName, 
    trackMountTime = false, 
    trackUpdateTime = false, 
    trackInteractions = false,
    trackDomSize = false,
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
  const elementRef = useRef<HTMLElement | null>(null);
  
  // Start timing a render cycle
  const startTiming = useCallback(() => {
    if (!enabled) return;
    renderStartTimeRef.current = performance.now();
  }, [enabled]);
  
  // End timing a render cycle and record metrics
  const endTiming = useCallback(() => {
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
  }, [enabled, trackMountTime, trackUpdateTime, trackMetric, componentName, enableLogging]);
  
  // Track an interaction timing
  const trackInteraction = useCallback((interactionName: string) => {
    if (!enabled || !trackInteractions) return () => {};
    
    const startTime = performance.now();
    
    trackMetric(componentName, `interaction.started.${interactionName}`, 1, { 
      timestamp: startTime 
    });
    
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
  }, [enabled, trackInteractions, trackMetric, componentName, enableLogging]);
  
  // Measure DOM size
  const measureDomSize = useCallback((element: HTMLElement) => {
    if (!enabled || !trackDomSize) return;
    
    elementRef.current = element;
    
    // Measure on next animation frame for accurate results
    requestAnimationFrame(() => {
      if (!elementRef.current) return;
      
      const rect = elementRef.current.getBoundingClientRect();
      const elementCount = elementRef.current.querySelectorAll('*').length;
      
      // Track metrics
      trackMetric(componentName, 'domSize.width', rect.width);
      trackMetric(componentName, 'domSize.height', rect.height);
      trackMetric(componentName, 'domSize.elements', elementCount);
      
      if (enableLogging) {
        console.log(`[Performance] ${componentName} DOM size:`, {
          width: rect.width,
          height: rect.height,
          elements: elementCount
        });
      }
    });
  }, [enabled, trackDomSize, trackMetric, componentName, enableLogging]);
  
  // Get the current performance data
  const getPerformanceData = useCallback((): PerformanceData => {
    const averageRenderTime = renderCountRef.current > 0
      ? totalRenderTimeRef.current / renderCountRef.current
      : 0;
    
    const domSizeData = elementRef.current ? {
      width: elementRef.current.getBoundingClientRect().width,
      height: elementRef.current.getBoundingClientRect().height,
      elements: elementRef.current.querySelectorAll('*').length
    } : undefined;
    
    return {
      renderCount: renderCountRef.current,
      totalRenderTime: totalRenderTimeRef.current,
      averageRenderTime,
      lastRenderTime: updateTimesRef.current[updateTimesRef.current.length - 1] || 0,
      mountTime: mountTimeRef.current || undefined,
      updateTimes: [...updateTimesRef.current],
      interactionTimes: { ...interactionTimesRef.current },
      domSize: domSizeData
    };
  }, []);
  
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
  }, [enabled, componentName, startTiming, getPerformanceData, enableLogging]);
  
  return {
    startTiming,
    endTiming,
    trackInteraction,
    measureDomSize,
    getPerformanceData,
    ref: elementRef as MutableRefObject<HTMLElement>
  };
}

export default usePerformanceTracking;
