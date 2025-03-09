import { useEffect, useRef } from 'react';
import { renderCostAnalyzer } from '@/utils/error-prevention/RenderCostAnalyzer';
import { DeepPropAnalyzer } from '@/utils/error-prevention/DeepPropAnalyzer';
import { monitorComponent, validateProps } from '@/utils/componentDoc';

/**
 * Hook to enable error prevention on a component
 * 
 * @param componentName Unique name of the component
 * @param props Current props of the component
 * @param options Configuration options
 */
export function useErrorPrevention(
  componentName: string,
  props: Record<string, any>,
  options: {
    trackRenders?: boolean;
    validateProps?: boolean;
    trackPropChanges?: boolean;
    trackStateChanges?: boolean;
    throttleInterval?: number;
    batchUpdates?: boolean;
  } = {}
) {
  const {
    trackRenders = true,
    validateProps: shouldValidateProps = true,
    trackPropChanges = true,
    trackStateChanges = false,
    throttleInterval = 0,
    batchUpdates = true
  } = options;
  
  // Keep track of previous props for comparison
  const prevPropsRef = useRef<Record<string, any> | null>(null);
  
  // Start tracking render time
  const renderStartTimeRef = useRef<number>(0);
  
  if (trackRenders) {
    renderStartTimeRef.current = performance.now();
  }
  
  // Validate props if needed
  useEffect(() => {
    if (shouldValidateProps) {
      monitorComponent(componentName, props);
    }
    
    // Track prop changes if needed
    if (trackPropChanges && prevPropsRef.current) {
      const propChanges = DeepPropAnalyzer.analyzePropChanges(prevPropsRef.current, props);
      
      if (propChanges.length > 0) {
        console.debug(`[${componentName}] Props changed:`, 
          propChanges.map(change => DeepPropAnalyzer.formatPropChange(change))
        );
      }
    }
    
    // Update prevProps for next render
    prevPropsRef.current = { ...props };
  }, [componentName, props, shouldValidateProps, trackPropChanges]);
  
  // Track render time when component renders
  useEffect(() => {
    if (trackRenders) {
      const renderEndTime = performance.now();
      const renderDuration = renderEndTime - renderStartTimeRef.current;
      
      renderCostAnalyzer.recordRender(
        componentName,
        renderDuration,
        props,
        prevPropsRef.current
      );
      
      // Log slow renders
      if (renderDuration > 16) {
        console.warn(`[${componentName}] Slow render: ${renderDuration.toFixed(2)}ms`);
      }
    }
  });
  
  return {
    // Expose any useful metrics or functions
    getComponentAnalysis: () => renderCostAnalyzer.getComponentAnalysis(componentName)
  };
}
