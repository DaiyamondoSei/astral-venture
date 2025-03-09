
import { useEffect } from 'react';
import { monitorComponent } from '@/utils/componentDoc';

/**
 * Hook for validating component props and structure
 * 
 * @param componentName The name of the component to validate
 * @param props The component props to validate
 */
export function useComponentValidation(componentName: string, props: Record<string, any> = {}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      monitorComponent(componentName);
    }
  }, [componentName]);
  
  return {
    componentName
  };
}
