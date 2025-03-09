
import { useState, useEffect } from 'react';
import { monitorComponent } from '@/utils/componentDoc';

/**
 * Hook for validating components and their props
 */
export function useComponentValidation(componentName: string, props: any) {
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') {
    return { isValid: true, errors: [] };
  }
  
  useEffect(() => {
    try {
      // Monitor component with props
      monitorComponent(componentName, props);
      setIsValid(true);
      setErrors([]);
    } catch (error) {
      setIsValid(false);
      setErrors([`${error}`]);
      console.error(`[${componentName}] Validation error:`, error);
    }
  }, [componentName, props]);
  
  return { isValid, errors };
}
