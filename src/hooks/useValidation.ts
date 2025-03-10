
import { useState, useCallback, useMemo } from 'react';
import { usePerfConfig } from './usePerfConfig';
import { ValidationError } from '@/utils/validation/ValidationError';

export interface ValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

export interface ValidationState<T> {
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
}

export type Validator<T> = (value: any, values: Partial<T>) => string | null;

export type FieldValidators<T> = {
  [K in keyof T]?: Validator<T> | Validator<T>[];
};

export interface ValidationMethods<T> {
  validateField: (fieldName: keyof T, value: any) => string | null;
  validateAll: (values: Partial<T>) => Record<keyof T, string | null>;
  resetValidation: () => void;
  setFieldTouched: (fieldName: keyof T, isTouched?: boolean) => void;
  clearFieldError: (fieldName: keyof T) => void;
  hasError: (fieldName: keyof T) => boolean;
  handleChange: (fieldName: keyof T) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (fieldName: keyof T) => (event: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * Custom hook for form validation
 * 
 * @param validators - Object containing validation functions for each field
 * @param options - Validation options
 * @returns Validation state and methods
 */
export function useValidation<T extends Record<string, any>>(
  validators: FieldValidators<T>,
  options: ValidationOptions = {}
): [ValidationState<T>, ValidationMethods<T>] {
  const { config } = usePerfConfig();
  const enableValidation = true; // Always enable validation for now
  
  // Set defaults for options
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true
  } = options;
  
  // Create initial states
  const initialErrors = useMemo(() => {
    return Object.keys(validators).reduce((acc, key) => {
      acc[key as keyof T] = null;
      return acc;
    }, {} as Record<keyof T, string | null>);
  }, [validators]);
  
  const initialTouched = useMemo(() => {
    return Object.keys(validators).reduce((acc, key) => {
      acc[key as keyof T] = false;
      return acc;
    }, {} as Record<keyof T, boolean>);
  }, [validators]);
  
  // State
  const [errors, setErrors] = useState<Record<keyof T, string | null>>(initialErrors);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(initialTouched);
  
  // Compute if the form is valid
  const isValid = useMemo(() => {
    return Object.values(errors).every(error => error === null);
  }, [errors]);
  
  // Validate a single field
  const validateField = useCallback((fieldName: keyof T, value: any, allValues: Partial<T> = {}) => {
    if (!enableValidation) return null;
    
    const fieldValidators = validators[fieldName];
    if (!fieldValidators) return null;
    
    // Handle array of validators
    if (Array.isArray(fieldValidators)) {
      for (const validator of fieldValidators) {
        const errorMessage = validator(value, allValues);
        if (errorMessage) return errorMessage;
      }
      return null;
    }
    
    // Handle single validator
    return fieldValidators(value, allValues);
  }, [validators, enableValidation]);
  
  // Validate all fields
  const validateAll = useCallback((values: Partial<T>) => {
    if (!enableValidation) {
      return Object.keys(validators).reduce((acc, key) => {
        acc[key as keyof T] = null;
        return acc;
      }, {} as Record<keyof T, string | null>);
    }
    
    const newErrors: Record<keyof T, string | null> = { ...initialErrors };
    
    Object.keys(validators).forEach(key => {
      const fieldName = key as keyof T;
      const value = values[fieldName];
      newErrors[fieldName] = validateField(fieldName, value, values);
    });
    
    setErrors(newErrors);
    return newErrors;
  }, [validators, validateField, initialErrors, enableValidation]);
  
  // Reset validation state
  const resetValidation = useCallback(() => {
    setErrors(initialErrors);
    setTouched(initialTouched);
  }, [initialErrors, initialTouched]);
  
  // Set a field as touched
  const setFieldTouched = useCallback((fieldName: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: isTouched
    }));
  }, []);
  
  // Clear error for a specific field
  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
  }, []);
  
  // Check if a field has an error
  const hasError = useCallback((fieldName: keyof T) => {
    return Boolean(errors[fieldName] && touched[fieldName]);
  }, [errors, touched]);
  
  // Handle input change
  const handleChange = useCallback((fieldName: keyof T) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFieldTouched(fieldName);
    
    if (validateOnChange) {
      const errorMessage = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: errorMessage
      }));
    }
  }, [validateField, validateOnChange, setFieldTouched]);
  
  // Handle input blur
  const handleBlur = useCallback((fieldName: keyof T) => (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFieldTouched(fieldName);
    
    if (validateOnBlur) {
      const errorMessage = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: errorMessage
      }));
    }
  }, [validateField, validateOnBlur, setFieldTouched]);
  
  // The validation state
  const validationState: ValidationState<T> = {
    errors,
    touched,
    isValid
  };
  
  // The validation methods
  const validationMethods: ValidationMethods<T> = {
    validateField,
    validateAll,
    resetValidation,
    setFieldTouched,
    clearFieldError,
    hasError,
    handleChange,
    handleBlur
  };
  
  return [validationState, validationMethods];
}

export default useValidation;
