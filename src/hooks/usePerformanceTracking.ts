
import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

interface PerformanceTrackingOptions {
  logSlowRenders?: boolean;
  logSlowRenderThreshold?: number;
  reportToAnalytics?: boolean;
  enabled?: boolean;
  throttleInterval?: number;
  batchUpdates?: boolean;
}

/**
 * Hook for tracking component rendering performance with optimizations
 * for reduced overhead
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
    enabled = true,
    throttleInterval = 0,
    batchUpdates = true
  } = options;
  
  // Skip if not enabled
  if (!enabled) return;
  
  const renderStartTimeRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);
  const lastRecordTimeRef = useRef<number>(0);
  const recordedThisRenderRef = useRef(false);
  const batchQueueRef = useRef<{time: number, duration: number}[]>([]);
  
  // Start render timing when component renders
  renderStartTimeRef.current = performance.now();
  recordedThisRenderRef.current = false;
  
  // Create throttled recording function
  const recordRender = useCallback((duration: number) => {
    const now = performance.now();
    
    // Skip if within throttle interval
    if (throttleInterval > 0 && now - lastRecordTimeRef.current < throttleInterval) {
      return;
    }
    
    if (batchUpdates) {
      // Add to batch queue
      batchQueueRef.current.push({ time: now, duration });
      
      // Process batch if getting large or it's been a while
      if (batchQueueRef.current.length > 10 || (batchQueueRef.current.length > 0 && now - batchQueueRef.current[0].time > 2000)) {
        // We'll process batches individually since PerformanceMonitor expects a different format
        const entries = [...batchQueueRef.current];
        batchQueueRef.current = [];
        
        // Record each entry individually (still more efficient than recording during render)
        entries.forEach(entry => {
          performanceMonitor.recordRender(componentName, entry.duration);
        });
      }
    } else {
      // Record immediately if not batching
      performanceMonitor.recordRender(componentName, duration);
    }
    
    lastRecordTimeRef.current = now;
    
    // Log slow renders if enabled, only if significantly slow
    if (logSlowRenders && duration > logSlowRenderThreshold * 1.5) {
      console.warn(`[${componentName}] Slow render detected: ${duration.toFixed(2)}ms`);
    }
    
    // Report to analytics if enabled, only for very slow renders
    if (reportToAnalytics && duration > logSlowRenderThreshold * 2) {
      // This would be implemented with a real analytics service
      console.info(`[Performance Analytics] Slow render: ${componentName} (${duration.toFixed(2)}ms)`);
    }
  }, [componentName, logSlowRenders, logSlowRenderThreshold, reportToAnalytics, throttleInterval, batchUpdates]);
  
  // Track render completion and log metrics with throttling
  useEffect(() => {
    // Skip if already recorded this render cycle (prevents double recording)
    if (recordedThisRenderRef.current) return;
    
    recordedThisRenderRef.current = true;
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTimeRef.current;
    
    lastRenderTimeRef.current = renderDuration;
    
    // Record this render (throttled/batched)
    recordRender(renderDuration);
    
    return () => {
      // Process any remaining batched data on unmount
      if (batchUpdates && batchQueueRef.current.length > 0) {
        // Process remaining batched renders before unmount
        batchQueueRef.current.forEach(entry => {
          performanceMonitor.recordRender(componentName, entry.duration);
        });
        batchQueueRef.current = [];
      }
      
      // Record component unmount if needed
      performanceMonitor.recordUnmount(componentName);
    };
  });
  
  return {
    getLastRenderTime: () => lastRenderTimeRef.current,
    getComponentMetrics: () => performanceMonitor.getComponentMetrics(componentName)
  };
}
