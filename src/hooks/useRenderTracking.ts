
import { useRef, useEffect } from 'react';
import { renderCostAnalyzer } from '@/utils/error-prevention/RenderCostAnalyzer';

interface RenderTrackingOptions {
  complexity?: number;
  dependencies?: string[];
  hooks?: string[];
  childComponents?: string[];
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
  
  const renderCountRef = useRef(0);
  const renderStartTimeRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  
  // Track render start time
  renderStartTimeRef.current = performance.now();
  
  // Track render completion
  useEffect(() => {
    const renderDuration = performance.now() - renderStartTimeRef.current;
    renderCountRef.current++;
    lastRenderTimeRef.current = renderDuration;
    
    // Record render in analyzer
    renderCostAnalyzer.recordRender(componentName, renderDuration);
    
    // Log slow renders (over 16ms)
    if (renderDuration > 16) {
      console.warn(`[${componentName}] Slow render detected: ${renderDuration.toFixed(2)}ms`);
      console.info(`Component info:`, options);
    }
    
    // Every 5 renders, check if we should suggest optimizations
    if (renderCountRef.current % 5 === 0) {
      const analysis = renderCostAnalyzer.getComponentAnalysis(componentName);
      
      if (analysis && analysis.suggestions.length > 0) {
        const criticalSuggestions = analysis.suggestions.filter(s => s.priority === 'critical');
        
        if (criticalSuggestions.length > 0) {
          console.warn(`[${componentName}] Critical optimization suggestions:`, 
            criticalSuggestions.map(s => s.description)
          );
        }
      }
    }
  });
  
  return;
}
