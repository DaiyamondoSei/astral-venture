
import { useEffect, useRef, useState } from 'react';
import { useErrorPrevention } from '@/contexts/ErrorPreventionContext';

/**
 * Hook for providing real-time validation of components
 */
export function useRealTimeValidation(componentName: string, props: Record<string, any> = {}) {
  const errorPrevention = useErrorPrevention();
  const [isValid, setIsValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const timeoutRef = useRef<number | null>(null);
  
  // Skip if not enabled or in production
  if (!errorPrevention.isEnabled || process.env.NODE_ENV !== 'development') {
    return { isValid: true, errors: [], validateNow: () => {} };
  }
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Function to run validation immediately
  const validateNow = () => {
    try {
      const result = errorPrevention.validateAllComponents();
      setIsValid(result.valid);
      setValidationErrors(result.errors);
      return result;
    } catch (error) {
      console.error(`Validation error in ${componentName}:`, error);
      setIsValid(false);
      setValidationErrors([`Error during validation: ${error}`]);
      return { valid: false, errors: [`Error during validation: ${error}`] };
    }
  };
  
  return { 
    isValid, 
    errors: validationErrors, 
    validateNow 
  };
}
