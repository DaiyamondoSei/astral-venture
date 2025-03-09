
import { useRef, useEffect } from 'react';
import { useErrorPrevention as useErrorPreventionContext } from '@/contexts/ErrorPreventionContext';

interface ErrorPreventionOptions {
  trackRenders?: boolean;
  validateProps?: boolean;
  trackPropChanges?: boolean;
  throttleInterval?: number;
}

/**
 * Hook for component error prevention, validation, and performance tracking
 * 
 * @param componentName Name of the component to monitor
 * @param props Component props to validate and track
 * @param options Configuration options
 */
export function useErrorPrevention(
  componentName: string,
  props: Record<string, any> = {},
  options: ErrorPreventionOptions = {}
): void {
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') return;
  
  const {
    trackRenders = false,
    validateProps = false,
    trackPropChanges = false,
    throttleInterval = 0
  } = options;
  
  // Get error prevention context
  const errorPrevention = useErrorPreventionContext();
  
  // Store previous render timestamp and props
  const lastRenderTimeRef = useRef<number>(0);
  const prevPropsRef = useRef<Record<string, any>>({});
  
  // Record render start time
  const renderStartTimeRef = useRef<number>(performance.now());
  
  // Validate props on render if enabled
  useEffect(() => {
    if (validateProps) {
      errorPrevention.validateComponent(componentName, props);
    }
    
    // Track prop changes between renders if enabled
    if (trackPropChanges && prevPropsRef.current) {
      errorPrevention.trackPropChanges(componentName, prevPropsRef.current, props);
    }
    
    // Save current props for next render comparison
    prevPropsRef.current = { ...props };
    
    // Track render time if enabled
    if (trackRenders) {
      const now = performance.now();
      const renderTime = now - renderStartTimeRef.current;
      
      // Apply throttling if configured
      if (throttleInterval <= 0 || now - lastRenderTimeRef.current >= throttleInterval) {
        errorPrevention.recordRender(componentName, renderTime);
        lastRenderTimeRef.current = now;
      }
    }
    
    // Clean up on unmount
    return () => {
      // No cleanup needed for this hook
    };
  });
}

export default useErrorPrevention;
