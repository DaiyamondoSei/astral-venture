
import { useEffect, useRef } from 'react';
import { useErrorPrevention } from '@/contexts/ErrorPreventionContext';

interface ValidationOptions {
  validateOnMount?: boolean;
  validateOnChange?: boolean;
  validateOnUnmount?: boolean;
  warnOnly?: boolean;
}

/**
 * Hook for real-time component validation
 * 
 * @param componentName Name of the component to validate
 * @param props Component props to validate
 * @param options Validation options
 */
export function useRealTimeValidation(
  componentName: string,
  props: Record<string, any> = {},
  options: ValidationOptions = {}
): void {
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') return;
  
  const {
    validateOnMount = true,
    validateOnChange = true,
    validateOnUnmount = false,
    warnOnly = false
  } = options;
  
  // Get error prevention context
  const errorPrevention = useErrorPrevention();
  
  // Track initial render and mounting
  const isMountedRef = useRef(false);
  const prevPropsRef = useRef<Record<string, any>>({});
  
  // Validate on mount
  useEffect(() => {
    if (validateOnMount) {
      // Validate this component
      errorPrevention.validateComponent(componentName, props);
      isMountedRef.current = true;
    }
    
    // Validate on unmount
    return () => {
      if (validateOnUnmount && isMountedRef.current) {
        // Here we would normally validate the unmount if needed
        // But we'll just log it for now
        console.debug(`Component ${componentName} unmounted`);
      }
    };
  }, []);
  
  // Validate on prop changes
  useEffect(() => {
    if (validateOnChange && isMountedRef.current) {
      // Track prop changes
      errorPrevention.trackPropChanges(componentName, prevPropsRef.current, props);
    }
    
    // Update previous props for next change
    prevPropsRef.current = { ...props };
  });
}

export default useRealTimeValidation;
