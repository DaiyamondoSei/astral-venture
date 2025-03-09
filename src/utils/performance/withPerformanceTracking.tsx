
import React, { useEffect, useRef } from 'react';
import { performanceMonitor } from './performanceMonitor';

interface PerformanceTrackingOptions {
  logSlowRenders?: boolean;
  slowRenderThreshold?: number;
  trackProps?: boolean;
}

/**
 * HOC to track component render performance
 * 
 * @param Component The component to track
 * @param options Performance tracking options
 * @returns The wrapped component with performance tracking
 */
export function withPerformanceTracking<P>(
  Component: React.ComponentType<P>,
  componentName: string,
  options: PerformanceTrackingOptions = {}
): React.FC<P> {
  // Extract options with defaults
  const {
    logSlowRenders = true,
    slowRenderThreshold = 16, // 16ms is roughly 60fps threshold
    trackProps = false
  } = options;

  // Create a wrapped component with performance tracking
  const WithPerformanceTracking: React.FC<P> = (props) => {
    const renderStartTime = useRef(0);
    
    useEffect(() => {
      // Record render duration
      const renderDuration = performance.now() - renderStartTime.current;
      performanceMonitor.recordRender(componentName, renderDuration);
      
      if (logSlowRenders && renderDuration > slowRenderThreshold) {
        console.warn(`Slow render detected in ${componentName}: ${renderDuration.toFixed(2)}ms`);
      }
      
      // Record unmount
      return () => {
        performanceMonitor.recordUnmount(componentName);
      };
    });
    
    // Set render start time before rendering
    renderStartTime.current = performance.now();
    
    // Render the original component
    return <Component {...props} />;
  };

  // Set display name for debugging
  WithPerformanceTracking.displayName = `WithPerformanceTracking(${componentName})`;
  
  return WithPerformanceTracking;
}
