
import { useEffect, useRef } from 'react';
import { renderAnalyzer } from '@/utils/performance/RenderAnalyzer';

/**
 * Hook for tracking component render performance
 * 
 * @param componentName Name of the component
 * @param props Optional props to track for comparison
 * @param renderReasons Optional reasons for the render
 */
export function useRenderTracking(
  componentName: string,
  props?: Record<string, any>,
  renderReasons?: string[]
): void {
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') return;
  
  const renderStartTime = useRef(performance.now());
  
  // Track the render completion
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    // Record this render
    renderAnalyzer.recordRender(
      componentName,
      renderTime,
      props,
      renderReasons
    );
    
    // Prepare for next render
    renderStartTime.current = performance.now();
  });
}
