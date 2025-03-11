
/**
 * Performance monitoring hook for React components
 * 
 * Provides comprehensive performance tracking with optimized memory usage
 * and minimal runtime overhead.
 */
import { useRef, useEffect, useCallback, useState } from 'react';
import { usePerfConfig } from './usePerfConfig';
import { perfMetricsCollector } from '../utils/performance/perfMetricsCollector';

export interface PerformanceData {
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  firstRenderTime?: number;
  slowRenderCount: number;
  updateTimes: number[];
  interactionTimes?: Record<string, number[]>;
  domSize?: {
    width: number;
    height: number;
    elements?: number;
  };
}

export interface PerformanceMonitorOptions {
  componentName: string;
  trackMountTime?: boolean;
  trackUpdateTime?: boolean;
  trackInteractions?: boolean;
  trackDomSize?: boolean;
  slowThreshold?: number;
  enableLogging?: boolean;
  enableReporting?: boolean;
}

/**
 * Hook for monitoring component performance
 */
export function usePerformanceMonitor(options: PerformanceMonitorOptions) {
  const {
    componentName,
    trackMountTime = true,
    trackUpdateTime = true,
    trackInteractions = false,
    trackDomSize = false,
    slowThreshold,
    enableLogging = false,
    enableReporting = true
  } = options;
  
  const { config } = usePerfConfig();
  const enabled = config.enablePerformanceTracking && !!componentName;
  
  // Use refs to avoid re-renders when updating metrics
  const renderStartTimeRef = useRef<number | null>(null);
  const renderCountRef = useRef<number>(0);
  const totalRenderTimeRef = useRef<number>(0);
  const firstRenderTimeRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number | null>(null);
  const slowRenderCountRef = useRef<number>(0);
  const updateTimesRef = useRef<number[]>([]);
  const interactionTimesRef = useRef<Record<string, number[]>>({});
  const domSizeRef = useRef<{ width: number; height: number; elements?: number } | null>(null);
  const componentRef = useRef<HTMLElement | null>(null);
  const isMountedRef = useRef<boolean>(false);
  
  // Get configured slow threshold
  const effectiveSlowThreshold = slowThreshold ?? config.slowRenderThreshold;
  
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
    
    // Store basic timing info
    renderCountRef.current += 1;
    totalRenderTimeRef.current += renderTime;
    lastRenderTimeRef.current = renderTime;
    
    // For first render
    if (!isMountedRef.current) {
      firstRenderTimeRef.current = renderTime;
      
      if (trackMountTime && enableReporting) {
        perfMetricsCollector.trackComponentRender(componentName, renderTime, {
          phase: 'mount',
          deviceCapability: config.deviceCapability
        });
      }
      
      isMountedRef.current = true;
      
      if (enableLogging) {
        console.log(`[Performance] 📊 ${componentName} mount: ${renderTime.toFixed(2)}ms`);
      }
    } 
    // For subsequent updates
    else if (trackUpdateTime) {
      updateTimesRef.current.push(renderTime);
      
      if (enableReporting) {
        perfMetricsCollector.trackComponentRender(componentName, renderTime, {
          phase: 'update',
          updateCount: renderCountRef.current,
          deviceCapability: config.deviceCapability
        });
      }
      
      if (enableLogging) {
        console.log(`[Performance] 🔄 ${componentName} update: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    // Check for slow renders
    if (renderTime > effectiveSlowThreshold) {
      slowRenderCountRef.current += 1;
      
      if (enableLogging) {
        console.warn(
          `[Performance] ⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms ` +
          `(threshold: ${effectiveSlowThreshold}ms)`
        );
      }
    }
    
    // Reset timing
    renderStartTimeRef.current = null;
  }, [
    enabled, 
    componentName, 
    trackMountTime, 
    trackUpdateTime, 
    effectiveSlowThreshold, 
    enableLogging, 
    enableReporting,
    config.deviceCapability
  ]);
  
  // Track an interaction timing
  const trackInteraction = useCallback((interactionName: string) => {
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
      
      // Report the interaction
      if (enableReporting) {
        perfMetricsCollector.trackInteraction(
          `${componentName}.${interactionName}`,
          duration,
          { deviceCapability: config.deviceCapability }
        );
      }
      
      if (enableLogging) {
        console.log(
          `[Performance] 👆 ${componentName} interaction '${interactionName}': ${duration.toFixed(2)}ms`
        );
      }
    };
  }, [
    enabled, 
    trackInteractions, 
    componentName, 
    enableLogging, 
    enableReporting,
    config.deviceCapability
  ]);
  
  // Measure DOM element size
  const measureDomSize = useCallback((element: HTMLElement | null) => {
    if (!enabled || !trackDomSize || !element) return;
    
    // Store reference to the component DOM element
    componentRef.current = element;
    
    // Get element dimensions
    const rect = element.getBoundingClientRect();
    
    // Optionally count child elements
    const elementCount = config.trackComponentSize ? element.querySelectorAll('*').length : undefined;
    
    // Store size info
    domSizeRef.current = {
      width: rect.width,
      height: rect.height,
      elements: elementCount
    };
    
    if (enableLogging) {
      console.log(
        `[Performance] 📏 ${componentName} size: ${rect.width.toFixed(0)}×${rect.height.toFixed(0)}px` +
        (elementCount ? `, ${elementCount} elements` : '')
      );
    }
  }, [
    enabled, 
    trackDomSize, 
    componentName, 
    enableLogging,
    config.trackComponentSize
  ]);
  
  // Get the current performance data
  const getPerformanceData = useCallback((): PerformanceData => {
    const renderCount = renderCountRef.current;
    const totalRenderTime = totalRenderTimeRef.current;
    
    return {
      renderCount,
      totalRenderTime,
      averageRenderTime: renderCount > 0 ? totalRenderTime / renderCount : 0,
      lastRenderTime: lastRenderTimeRef.current || 0,
      firstRenderTime: firstRenderTimeRef.current,
      slowRenderCount: slowRenderCountRef.current,
      updateTimes: [...updateTimesRef.current],
      interactionTimes: { ...interactionTimesRef.current },
      domSize: domSizeRef.current || undefined
    };
  }, []);
  
  // Start timing for the initial render
  useEffect(() => {
    if (!enabled) return;
    
    startTiming();
    
    // End timing when the component mounts
    return () => {
      if (enabled) {
        // Report final metrics
        if (enableReporting && renderCountRef.current > 0) {
          const data = getPerformanceData();
          
          perfMetricsCollector.addMetric({
            component_name: componentName,
            metric_name: 'componentSummary',
            value: data.averageRenderTime,
            category: 'component',
            type: 'summary',
            metadata: {
              renderCount: data.renderCount,
              slowRenderCount: data.slowRenderCount,
              totalRenderTime: data.totalRenderTime,
              firstRenderTime: data.firstRenderTime,
              deviceCapability: config.deviceCapability
            }
          });
        }
        
        if (enableLogging) {
          console.log(`[Performance] 🏁 ${componentName} unmounted:`, getPerformanceData());
        }
      }
    };
  }, [enabled, componentName, enableLogging, enableReporting, getPerformanceData, startTiming, config.deviceCapability]);
  
  return {
    startTiming,
    endTiming,
    trackInteraction,
    measureDomSize,
    getPerformanceData,
    ref: componentRef
  };
}

export default usePerformanceMonitor;
