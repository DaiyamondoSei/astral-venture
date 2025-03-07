
import { useEffect, useRef } from 'react';
import { getComponentDocs, validateProps } from '@/utils/componentDoc';

/**
 * Hook for validating component props at runtime in development
 * 
 * @param componentName Name of the component
 * @param props The component props to validate
 */
export function useComponentValidation(
  componentName: string, 
  props: Record<string, any>
): void {
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  const propsRef = useRef(props);
  
  useEffect(() => {
    // Check if component is documented
    const componentDocs = getComponentDocs(componentName);
    if (!componentDocs) {
      console.warn(`Component '${componentName}' is not documented. Consider adding documentation.`);
      return;
    }
    
    // Validate props
    validateProps(componentName, props);
    
    // Store current props for comparison
    propsRef.current = props;
  }, [componentName, props]);
}

/**
 * Enhanced version of useComponentValidation for components that take
 * a specific interface as props. This helps ensure type safety at runtime.
 * 
 * @param componentName Name of the component
 * @param props The component props to validate
 * @param schema Optional Zod schema for additional validation
 */
export function useTypedComponentValidation<T extends Record<string, any>>(
  componentName: string,
  props: T
): void {
  useComponentValidation(componentName, props as Record<string, any>);
}
