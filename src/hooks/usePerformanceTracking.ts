
import { useEffect, useRef, useCallback } from 'react';
import { usePerformanceContext } from '@/contexts/PerfConfigContext';
import performanceMonitor, { MetricType } from '@/utils/performance/performanceMonitor';

export interface UsePerformanceTrackingOptions {
  componentName: string;
  autoStart?: boolean;
  logSlowRenders?: boolean;
  logToConsole?: boolean;
  trackChildRenders?: boolean;
  trackInteractions?: boolean;
  interactionThreshold?: number;
}

export function usePerformanceTracking(options: UsePerformanceTrackingOptions) {
  const {
    componentName,
    autoStart = true,
    logSlowRenders = false,
    logToConsole = false,
    trackChildRenders = false,
    trackInteractions = true
  } = options;

  const { enablePerformanceTracking, samplingRate } = usePerformanceContext || {
    enablePerformanceTracking: true,
    samplingRate: 0.1
  };

  const renderStartTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const shouldTrackRef = useRef<boolean>(Math.random() < (samplingRate ?? 0.1));

  // Track render start time
  useEffect(() => {
    if (!enablePerformanceTracking || !shouldTrackRef.current) return;

    renderStartTimeRef.current = performance.now();
    renderCountRef.current += 1;

    return () => {
      // Measure render duration on unmount
      if (renderStartTimeRef.current > 0) {
        const renderEndTime = performance.now();
        const renderDuration = renderEndTime - renderStartTimeRef.current;

        performanceMonitor.addComponentMetric(
          componentName,
          renderDuration,
          MetricType.RENDER
        );

        if (logToConsole) {
          console.log(`[${componentName}] Render time: ${renderDuration.toFixed(2)}ms`);
        }
      }
    };
  }, [componentName, enablePerformanceTracking, logToConsole, shouldTrackRef]);

  // Track interaction timing
  const startInteractionTiming = useCallback((interactionName: string) => {
    if (!enablePerformanceTracking || !trackInteractions || !shouldTrackRef.current) {
      return () => {}; // Return no-op if tracking disabled
    }

    const startTime = performance.now();
    const fullName = `${componentName}:${interactionName}`;

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceMonitor.addComponentMetric(
        fullName,
        duration,
        MetricType.INTERACTION
      );

      if (logToConsole) {
        console.log(`[${fullName}] Interaction time: ${duration.toFixed(2)}ms`);
      }

      return duration;
    };
  }, [componentName, enablePerformanceTracking, logToConsole, trackInteractions, shouldTrackRef]);

  // Create full API
  return {
    startInteractionTiming,
    recordRenderTime: (time: number) => {
      if (enablePerformanceTracking && shouldTrackRef.current) {
        performanceMonitor.addComponentMetric(componentName, time, MetricType.RENDER);
      }
    },
    trackEvent: (eventName: string, duration: number) => {
      if (enablePerformanceTracking && shouldTrackRef.current) {
        performanceMonitor.addComponentMetric(
          `${componentName}:${eventName}`,
          duration,
          MetricType.INTERACTION
        );
      }
    }
  };
}

export default usePerformanceTracking;
