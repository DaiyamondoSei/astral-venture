
import { useEffect, useRef } from 'react';
import { renderCostAnalyzer } from '@/utils/error-prevention/RenderCostAnalyzer';
import { usePerfConfig } from './usePerfConfig';

interface ErrorPreventionOptions {
  trackRenders?: boolean;
  validateProps?: boolean;
  trackPropChanges?: boolean;
  throttleInterval?: number;
}

/**
 * A hook to monitor component rendering and help prevent errors
 * 
 * @param componentName The name of the component to monitor
 * @param options Options for error prevention monitoring
 */
export function useErrorPrevention(
  componentName: string,
  options: ErrorPreventionOptions = {}
) {
  const startTimeRef = useRef(performance.now());
  const renderCountRef = useRef(0);
  const perfConfig = usePerfConfig();
  
  // Skip most logic in production
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  const shouldTrack = perfConfig.enableRenderTracking && (options.trackRenders !== false);
  
  // Track render start time
  useEffect(() => {
    if (!shouldTrack) return;
    
    renderCountRef.current += 1;
    const renderTime = performance.now() - startTimeRef.current;
    
    // Only record if render took more than 5ms
    if (renderTime > 5) {
      renderCostAnalyzer.recordRender(componentName, renderTime);
      
      // Log slow renders
      if (renderTime > 50 && perfConfig.enableDebugLogging) {
        console.warn(
          `[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }
    }
    
    // Reset for next render
    startTimeRef.current = performance.now();
    
    // Simplified impact analysis - only run occasionally
    if (renderCountRef.current % 10 === 0) {
      const analysis = renderCostAnalyzer.getComponentAnalysis(componentName);
      
      if (analysis && analysis.suggestions.length > 0) {
        const highPriorityIssues = analysis.suggestions.filter(s => s.priority === 'high' || s.priority === 'critical');
        
        if (highPriorityIssues.length > 0 && perfConfig.enableDebugLogging) {
          console.warn(
            `[Performance] Issues detected in ${componentName}:`,
            highPriorityIssues.map(i => i.description).join('\n')
          );
        }
      }
    }
  });
  
  // Simplified props validation
  if (perfConfig.enableValidation && options.validateProps) {
    // This would use prop validation logic, simplified for now
  }
  
  return {
    componentName,
    renderCount: renderCountRef.current
  };
}
