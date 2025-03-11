
import { useRef, useEffect, useMemo } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';
import { metricsCollector } from '@/utils/performance/metricsCollector';

export interface PerformanceTrackingOptions {
  componentName: string;
  enableMetrics?: boolean;
}

export function usePerformanceTracking(options: PerformanceTrackingOptions) {
  const { componentName, enableMetrics = true } = options;
  const { deviceCapability } = usePerformance();
  const startTimeRef = useRef<number>(0);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enableMetrics || !componentName) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        metricsCollector.trackComponentMetric(
          componentName,
          entry.name,
          entry.duration,
          'render'
        );
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    return () => observer.disconnect();
  }, [enableMetrics, componentName]);

  const api = useMemo(() => ({
    startTiming: () => {
      startTimeRef.current = performance.now();
    },
    endTiming: () => {
      if (startTimeRef.current) {
        const duration = performance.now() - startTimeRef.current;
        metricsCollector.trackComponentMetric(componentName, 'render', duration);
      }
    },
    trackInteraction: (name: string) => {
      const start = performance.now();
      return () => {
        const duration = performance.now() - start;
        metricsCollector.trackComponentMetric(componentName, name, duration, 'interaction');
      };
    },
    ref: elementRef
  }), [componentName]);

  return api;
}

export default usePerformanceTracking;
