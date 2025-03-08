
import { useRef, useEffect } from 'react';
import { renderCostAnalyzer } from '@/utils/error-prevention/RenderCostAnalyzer';

interface RenderTrackingOptions {
  complexity?: number;
  dependencies?: string[];
  hooks?: string[];
  childComponents?: string[];
  enabled?: boolean;
}

/**
 * Hook to track component renders and provide optimization suggestions
 * 
 * @param componentName Name of the component to track
 * @param options Additional component metadata
 */
export function useRenderTracking(
  componentName: string,
  options: RenderTrackingOptions = {}
): void {
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') return;
  
  const {
    complexity = 0,
    dependencies = [],
    hooks = [],
    childComponents = [],
    enabled = true
  } = options;
  
  // Skip if tracking is disabled
  if (!enabled) return;
  
  const renderCountRef = useRef(0);
  const renderStartTimeRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const recordedThisRenderRef = useRef(false);
  
  // Track render start time
  renderStartTimeRef.current = performance.now();
  recordedThisRenderRef.current = false;
  
  // Track render completion
  useEffect(() => {
    // Skip if already recorded this render cycle
    if (recordedThisRenderRef.current) return;
    
    recordedThisRenderRef.current = true;
    const renderDuration = performance.now() - renderStartTimeRef.current;
    renderCountRef.current++;
    lastRenderTimeRef.current = renderDuration;
    
    // Record render in analyzer
    renderCostAnalyzer.recordRender(componentName, renderDuration);
    
    // Log slow renders (over 16ms) but only if it's not a common component
    if (renderDuration > 16) {
      console.warn(`[${componentName}] Slow render detected: ${renderDuration.toFixed(2)}ms`);
      console.info(`Component info:`, options);
    }
    
    // Only check for optimizations every 5 renders to reduce overhead
    if (renderCountRef.current % 5 === 0) {
      const analysis = renderCostAnalyzer.getComponentAnalysis(componentName);
      
      if (analysis && analysis.suggestions.some(s => s.priority === 'critical')) {
        console.warn(`[${componentName}] Critical optimization suggestions:`);
      }
    }
  });
  
  return;
}
