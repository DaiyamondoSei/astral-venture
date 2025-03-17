
import { useEffect, useRef } from 'react';
import { perfMetricsCollector } from '@/utils/performance/perfMetricsCollector';
import { usePerfConfig } from '@/hooks/usePerfConfig';

/**
 * Hook for tracking component performance metrics
 * 
 * @param componentName Name of the component to track
 * @param options Additional tracking options
 */
export function useComponentPerformance(
  componentName: string,
  options: {
    trackRender?: boolean;
    trackInteractions?: boolean;
    trackDomSize?: boolean;
  } = {}
) {
  const { 
    trackRender = true, 
    trackInteractions = false,
    trackDomSize = false 
  } = options;
  
  const { config } = usePerfConfig();
  const renderStartTimeRef = useRef(0);
  const componentRef = useRef<HTMLElement | null>(null);
  
  // Start timing on mount and re-renders
  useEffect(() => {
    if (trackRender && config.enablePerformanceTracking) {
      renderStartTimeRef.current = performance.now();
      
      return () => {
        const renderTime = performance.now() - renderStartTimeRef.current;
        perfMetricsCollector.trackComponentMetric(
          componentName,
          'renderTime',
          renderTime
        );
      };
    }
  });
  
  // Track DOM size if enabled
  useEffect(() => {
    if (trackDomSize && componentRef.current) {
      const element = componentRef.current;
      const { width, height } = element.getBoundingClientRect();
      const childCount = element.querySelectorAll('*').length;
      
      perfMetricsCollector.trackComponentMetric(
        componentName,
        'domSize',
        childCount,
        { width, height }
      );
    }
  }, [componentName, trackDomSize]);
  
  // Create interaction tracker
  const trackInteraction = (interactionName: string) => {
    return () => {
      if (trackInteractions && config.enablePerformanceTracking) {
        perfMetricsCollector.trackComponentMetric(
          componentName,
          interactionName,
          1
        );
      }
    };
  };
  
  return {
    componentRef,
    trackInteraction
  };
}
