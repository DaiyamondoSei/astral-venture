import { useEffect, useRef } from 'react';
import { renderCostAnalyzer } from '@/utils/error-prevention/RenderCostAnalyzer';
import { DeepPropAnalyzer } from '@/utils/error-prevention/DeepPropAnalyzer';
import { monitorComponent } from '@/utils/componentDoc';

/**
 * Hook to enable error prevention on a component
 * 
 * @param componentName Unique name of the component
 * @param props Current props of the component
 * @param options Configuration options
 */
export function useErrorPrevention(
  componentName: string,
  props: Record<string, any> = {},
  options: {
    trackRenders?: boolean;
    validateProps?: boolean;
    trackPropChanges?: boolean;
    trackStateChanges?: boolean;
    throttleInterval?: number;
    batchUpdates?: boolean;
  } = {}
) {
  // Skip all tracking in production
  if (process.env.NODE_ENV !== 'development') return { getComponentAnalysis: () => null };
  
  const {
    trackRenders = true,
    validateProps: shouldValidateProps = true,
    trackPropChanges = true,
    trackStateChanges = false,
    throttleInterval = 1000, // Increase default throttle interval
    batchUpdates = true
  } = options;
  
  // Keep track of previous props for comparison
  const prevPropsRef = useRef<Record<string, any> | null>(null);
  
  // Start tracking render time
  const renderStartTimeRef = useRef<number>(0);
  
  // Skip tracking if outside throttle interval
  const lastTrackTimeRef = useRef<number>(0);
  const now = Date.now();
  const shouldTrack = now - lastTrackTimeRef.current > throttleInterval;
  
  if (trackRenders && shouldTrack) {
    renderStartTimeRef.current = performance.now();
    lastTrackTimeRef.current = now;
  }
  
  // Validate props if needed, but less frequently
  useEffect(() => {
    // Only run if we should be tracking
    if (!shouldTrack) return;
    
    if (shouldValidateProps) {
      monitorComponent(componentName, props);
    }
    
    // Track prop changes if needed, and we have previous props
    if (trackPropChanges && prevPropsRef.current) {
      const propChanges = DeepPropAnalyzer.analyzePropChanges(prevPropsRef.current, props);
      
      // Only log if there are significant changes
      const significantChanges = propChanges.filter(c => c.type === 'high');
      if (significantChanges.length > 0) {
        console.debug(`[${componentName}] Significant props changed:`, 
          significantChanges.map(change => DeepPropAnalyzer.formatPropChange(change))
        );
      }
    }
    
    // Update prevProps for next render
    prevPropsRef.current = { ...props };
  }, [componentName, props, shouldValidateProps, trackPropChanges, shouldTrack]);
  
  // Track render time when component renders
  useEffect(() => {
    // Skip if we're not tracking or outside throttle interval
    if (!trackRenders || !shouldTrack) return;
    
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTimeRef.current;
    
    renderCostAnalyzer.recordRender(
      componentName,
      renderDuration,
      props,
      prevPropsRef.current
    );
    
    // Only log very slow renders
    if (renderDuration > 50) { // Increased threshold from 16ms to 50ms
      console.warn(`[${componentName}] Very slow render: ${renderDuration.toFixed(2)}ms`);
    }
  }, [componentName, props, trackRenders, shouldTrack]);
  
  return {
    // Expose any useful metrics or functions
    getComponentAnalysis: () => renderCostAnalyzer.getComponentAnalysis(componentName)
  };
}
