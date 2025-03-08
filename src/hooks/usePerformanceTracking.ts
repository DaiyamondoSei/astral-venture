
import { useEffect, useRef } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

interface PerformanceTrackingOptions {
  logSlowRenders?: boolean;
  logSlowRenderThreshold?: number;
  reportToAnalytics?: boolean;
  enabled?: boolean;
}

/**
 * Hook for tracking component rendering performance
 * 
 * @param componentName Name of the component to track
 * @param options Configuration options
 */
export function usePerformanceTracking(
  componentName: string,
  options: PerformanceTrackingOptions = {}
) {
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') return;
  
  const {
    logSlowRenders = true,
    logSlowRenderThreshold = 16, // 1 frame at 60fps
    reportToAnalytics = false,
    enabled = true
  } = options;
  
  // Skip if not enabled
  if (!enabled) return;
  
  const renderStartTimeRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);
  const recordedThisRenderRef = useRef(false);
  
  // Start render timing when component renders
  renderStartTimeRef.current = performance.now();
  recordedThisRenderRef.current = false;
  
  // Track render completion and log metrics with throttling
  useEffect(() => {
    // Skip if already recorded this render cycle (prevents double recording)
    if (recordedThisRenderRef.current) return;
    
    recordedThisRenderRef.current = true;
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTimeRef.current;
    
    lastRenderTimeRef.current = renderDuration;
    
    // Record component render in performance monitor
    performanceMonitor.recordRender(componentName, renderDuration);
    
    // Log slow renders if enabled
    if (logSlowRenders && renderDuration > logSlowRenderThreshold) {
      console.warn(`[${componentName}] Slow render detected: ${renderDuration.toFixed(2)}ms`);
    }
    
    // Report to analytics if enabled
    if (reportToAnalytics) {
      // This would be implemented with a real analytics service
      // For now, just log to console
      if (renderDuration > logSlowRenderThreshold) {
        console.info(`[Performance Analytics] Slow render: ${componentName} (${renderDuration.toFixed(2)}ms)`);
      }
    }
    
    return () => {
      // Record component unmount if needed
      performanceMonitor.recordUnmount(componentName);
    };
  });
  
  return {
    getLastRenderTime: () => lastRenderTimeRef.current,
    getComponentMetrics: () => performanceMonitor.getComponentMetrics(componentName)
  };
}
