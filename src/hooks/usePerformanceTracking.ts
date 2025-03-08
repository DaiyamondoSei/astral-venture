
import { useEffect, useRef } from 'react';
import { performanceMonitor } from '@/utils/performance/PerformanceMonitor';

/**
 * Hook for tracking component performance in development
 * 
 * @param componentName Name of the component being monitored
 * @param props Component props for analysis
 * @param state Component state for analysis
 */
export function usePerformanceTracking(
  componentName: string,
  props?: Record<string, any>,
  state?: Record<string, any>
): void {
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') return;
  
  const renderStartTimeRef = useRef<number>(0);
  
  // Track component mount and render
  useEffect(() => {
    // Record component mount
    renderStartTimeRef.current = performanceMonitor.startComponentRender(componentName);
    
    return () => {
      // Record component unmount
      performanceMonitor.endComponentRender(
        componentName,
        renderStartTimeRef.current,
        props,
        state
      );
    };
  }, [componentName, props, state]);
  
  // Track each render
  renderStartTimeRef.current = performanceMonitor.startComponentRender(componentName);
  
  // Use a different effect for tracking the render completion
  useEffect(() => {
    // This runs after render completes
    performanceMonitor.endComponentRender(
      componentName,
      renderStartTimeRef.current,
      props,
      state
    );
  });
}
