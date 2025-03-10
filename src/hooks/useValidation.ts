
import { useState, useCallback } from 'react';
import { ValidationError } from '@/utils/validation/runtimeValidation';
import { usePerfConfig } from './usePerfConfig';

/**
 * Validation result interface
 */
export interface ValidationState<T = unknown> {
  /** Whether the validation is in progress */
  isValidating: boolean;
  /** Whether the data is valid */
  isValid: boolean;
  /** Validation errors (if any) */
  errors: ValidationError[];
  /** Validated data (if valid) */
  validData: T | null;
}

/**
 * Validation options interface
 */
export interface ValidationOptions {
  /** Whether to validate on mount */
  validateOnMount?: boolean;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Initial data to validate */
  initialData?: unknown;
}

/**
 * Custom hook for data validation
 * 
 * @param validator - Validation function that throws ValidationError on invalid data
 * @param options - Validation options
 * @returns Validation state and functions
 */
export function useValidation<T>(
  validator: (data: unknown) => T,
  options: ValidationOptions = {}
) {
  const { 
    validateOnMount = false, 
    validateOnChange = true,
    initialData = null
  } = options;
  
  const perfConfig = usePerfConfig();
  const enableValidation = perfConfig.config.enableValidation !== false;
  
  const [validationState, setValidationState] = useState<ValidationState<T>>({
    isValidating: validateOnMount,
    isValid: false,
    errors: [],
    validData: null
  });
  
  /**
   * Validate data using the provided validator
   */
  const validate = useCallback((data: unknown) => {
    if (!enableValidation) {
      // If validation is disabled, just return the data as valid
      setValidationState({
        isValidating: false,
        isValid: true,
        errors: [],
        validData: data as T
      });
      return true;
    }
    
    setValidationState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const validData = validator(data);
      
      setValidationState({
        isValidating: false,
        isValid: true,
        errors: [],
        validData
      });
      
      return true;
    } catch (error) {
      const errors = [];
      
      if (error instanceof ValidationError) {
        errors.push(error);
      } else if (error instanceof Error) {
        errors.push(new ValidationError(error.message));
      } else {
        errors.push(new ValidationError('Unknown validation error'));
      }
      
      setValidationState({
        isValidating: false,
        isValid: false,
        errors,
        validData: null
      });
      
      return false;
    }
  }, [validator, enableValidation]);
  
  /**
   * Reset validation state
   */
  const reset = useCallback(() => {
    setValidationState({
      isValidating: false,
      isValid: false,
      errors: [],
      validData: null
    });
  }, []);
  
  // Validate initial data if requested
  useState(() => {
    if (validateOnMount && initialData !== null) {
      validate(initialData);
    }
  });
  
  return {
    ...validationState,
    validate,
    reset
  };
}

export default useValidation;
