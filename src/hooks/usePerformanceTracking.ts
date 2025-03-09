
import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { usePerfConfig } from './usePerfConfig';

interface PerformanceTrackingOptions {
  logSlowRenders?: boolean;
  logSlowRenderThreshold?: number;
  reportToAnalytics?: boolean;
  enabled?: boolean;
  throttleInterval?: number;
  batchUpdates?: boolean;
  maxBatchSize?: number;
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
  // Skip in production for performance unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !options.enabled) return;
  
  // Get config
  const { config } = usePerfConfig();
  
  const {
    logSlowRenders = true,
    logSlowRenderThreshold = 16, // 1 frame at 60fps
    reportToAnalytics = false,
    enabled = config.enableRenderTracking,
    throttleInterval = 0,
    batchUpdates = config.batchRenderUpdates,
    maxBatchSize = 20
  } = options;
  
  // Skip if not enabled
  if (!enabled) return;
  
  const renderStartTimeRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);
  const lastRecordTimeRef = useRef<number>(0);
  const recordedThisRenderRef = useRef(false);
  const batchQueueRef = useRef<number[]>([]);
  const batchTimeoutRef = useRef<number | null>(null);
  
  // Start render timing when component renders
  renderStartTimeRef.current = performance.now();
  recordedThisRenderRef.current = false;
  
  // Process the batch queue
  const processBatch = useCallback(() => {
    if (batchQueueRef.current.length === 0) return;
    
    // Use the optimized batch recording method
    performanceMonitor.recordRenderBatch(
      componentName, 
      batchQueueRef.current
    );
    
    batchQueueRef.current = [];
    
    // Clear timeout reference
    if (batchTimeoutRef.current !== null) {
      window.clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
  }, [componentName]);
  
  // Memoize the record function to prevent recreating it on every render
  const recordRender = useCallback((duration: number) => {
    const now = performance.now();
    
    // Skip if within throttle interval
    if (throttleInterval > 0 && now - lastRecordTimeRef.current < throttleInterval) {
      return;
    }
    
    if (batchUpdates) {
      // Add to batch queue
      batchQueueRef.current.push(duration);
      
      // Process batch if getting too large
      if (batchQueueRef.current.length >= maxBatchSize) {
        processBatch();
      } 
      // Schedule processing if not already scheduled
      else if (batchTimeoutRef.current === null) {
        batchTimeoutRef.current = window.setTimeout(processBatch, 2000);
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
      if (navigator.onLine && Math.random() < 0.1) { // Sample 10% of events to reduce traffic
        performanceMonitor.reportSlowRender(componentName, duration);
      }
    }
  }, [
    componentName, 
    logSlowRenders, 
    logSlowRenderThreshold, 
    reportToAnalytics, 
    throttleInterval, 
    batchUpdates,
    maxBatchSize,
    processBatch
  ]);
  
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
        processBatch();
      }
      
      // Record component unmount if needed
      performanceMonitor.recordUnmount(componentName);
      
      // Clear any pending timeouts
      if (batchTimeoutRef.current !== null) {
        window.clearTimeout(batchTimeoutRef.current);
      }
    };
  }, [componentName, recordRender, batchUpdates, processBatch]);
  
  return {
    getLastRenderTime: () => lastRenderTimeRef.current,
    getComponentMetrics: () => performanceMonitor.getComponentMetrics(componentName),
    flushMetrics: processBatch
  };
}

export default usePerformanceTracking;
