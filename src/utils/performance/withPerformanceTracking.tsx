
import React, { ComponentType, useEffect, useRef } from 'react';
import { usePerfMetricsReporter } from '@/hooks/usePerfMetricsReporter';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { PerformanceMonitor } from './performanceMonitor';

/**
 * Higher-order component to track component render performance
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: {
    componentName?: string;
    trackProps?: boolean;
    trackLifecycle?: boolean;
  } = {}
) {
  // Use the component display name or function name
  const displayName = options.componentName || 
    WrappedComponent.displayName || 
    WrappedComponent.name || 
    'Component';
  
  // Create a wrapped component that tracks performance
  const WithPerformanceTracking = (props: P) => {
    const { config } = usePerfConfig();
    const { addComponentMetric } = usePerfMetricsReporter();
    const renderStartTime = useRef(0);
    
    // Skip tracking if disabled
    const shouldTrack = config.enablePerformanceTracking;
    
    // Track component mount
    useEffect(() => {
      if (!shouldTrack) return;
      
      // Record load/mount time
      const mountTime = performance.now() - renderStartTime.current;
      addComponentMetric(`${displayName}:mount`, mountTime, 'load');
      
      const performanceMonitor = PerformanceMonitor.getInstance();
      
      // Record unmount on cleanup
      return () => {
        if (config.enablePerformanceTracking && options.trackLifecycle) {
          // Since we can't directly measure unmount time, we just record the event
          performanceMonitor.recordRender(displayName, 0); // Placeholder
          addComponentMetric(`${displayName}:unmount`, 0, 'load');
        }
      };
    }, [shouldTrack]);
    
    // Track component rendering time
    if (shouldTrack) {
      renderStartTime.current = performance.now();
    }
    
    // Track props changes if enabled
    if (shouldTrack && options.trackProps) {
      // Log current props for debugging
      console.debug(`[Performance] ${displayName} props:`, props);
    }
    
    // Render the wrapped component
    const result = <WrappedComponent {...props} />;
    
    // Record render time after rendering
    if (shouldTrack) {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime.current;
      
      // Track in both local monitor and reporter
      PerformanceMonitor.getInstance().recordRender(displayName, renderTime);
      addComponentMetric(displayName, renderTime);
      
      // Log slow renders
      if (renderTime > 16.67) { // Slow render (exceeds 60fps frame budget)
        console.debug(`[Performance] Slow render of ${displayName}: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    return result;
  };
  
  // Set display name for better debugging
  WithPerformanceTracking.displayName = `WithPerformanceTracking(${displayName})`;
  
  return WithPerformanceTracking;
}

export default withPerformanceTracking;
