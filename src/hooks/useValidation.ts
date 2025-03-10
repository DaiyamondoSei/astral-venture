
import { useState, useCallback } from 'react';
import { ValidationError } from '@/utils/validation/runtimeValidation';
import { toast } from 'sonner';

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  isValid: boolean;
  validatedData?: T;
  errors: Record<string, string>;
  error?: string;
}

/**
 * Props for the useValidation hook
 */
export interface UseValidationProps {
  /**
   * Whether to show toast notifications for validation errors
   */
  showToasts?: boolean;
  
  /**
   * Custom message for toast notifications
   */
  toastMessage?: string;
  
  /**
   * Whether to throw errors instead of returning them
   */
  throwErrors?: boolean;
}

/**
 * Hook for easy form validation with detailed error reporting
 * 
 * @param options - Hook options
 * @returns Validation utilities
 */
export const useValidation = <T>(options: UseValidationProps = {}) => {
  const { showToasts = true, toastMessage = 'Validation failed', throwErrors = false } = options;
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  /**
   * Validates a value using a provided validator function
   * 
   * @param validator - Validation function that may throw ValidationError
   * @param value - Value to validate
   * @param fieldName - Optional field name for structured errors
   * @returns Validation result
   */
  const validate = useCallback(<V>(
    validator: (value: any) => V,
    value: any,
    fieldName?: string
  ): ValidationResult<V> => {
    try {
      const validatedData = validator(value);
      
      // Clear errors for this field if provided
      if (fieldName) {
        setErrors(prev => {
          const { [fieldName]: _, ...rest } = prev;
          return rest;
        });
      } else {
        // Clear all errors if no specific field
        setErrors({});
      }
      
      return {
        isValid: true,
        validatedData,
        errors: {}
      };
    } catch (err) {
      let errorMessage = '';
      let fieldErrors: Record<string, string> = {};
      
      if (err instanceof ValidationError) {
        errorMessage = err.message;
        
        // Handle structured errors if available
        if (err.details?.errors && typeof err.details.errors === 'object') {
          fieldErrors = err.details.errors as Record<string, string>;
        } else if (fieldName) {
          // Set error for specific field
          fieldErrors = { [fieldName]: errorMessage };
        }
      } else {
        errorMessage = err instanceof Error ? err.message : String(err);
        if (fieldName) {
          fieldErrors = { [fieldName]: errorMessage };
        }
      }
      
      // Update errors state
      setErrors(prev => ({
        ...prev,
        ...fieldErrors
      }));
      
      // Show toast notification if enabled
      if (showToasts) {
        toast.error(toastMessage);
      }
      
      const result: ValidationResult<V> = {
        isValid: false,
        errors: fieldErrors,
        error: errorMessage
      };
      
      // Throw the error if configured to do so
      if (throwErrors) {
        throw err;
      }
      
      return result;
    }
  }, [showToasts, toastMessage, throwErrors]);
  
  /**
   * Validates an entire form object against a schema of validators
   * 
   * @param schema - Record of field validators
   * @param formData - Form data to validate
   * @returns Validation result for the entire form
   */
  const validateForm = useCallback(<V extends Record<string, any>>(
    schema: Record<keyof V, (value: any) => any>,
    formData: Record<string, any>
  ): ValidationResult<V> => {
    const validatedData: Record<string, any> = {};
    const fieldErrors: Record<string, string> = {};
    let isValid = true;
    
    for (const [field, validator] of Object.entries(schema)) {
      try {
        validatedData[field] = validator(formData[field]);
      } catch (err) {
        isValid = false;
        if (err instanceof ValidationError) {
          fieldErrors[field] = err.message;
        } else {
          fieldErrors[field] = err instanceof Error ? err.message : String(err);
        }
      }
    }
    
    // Update errors state
    setErrors(fieldErrors);
    
    // Show toast notification if there are errors and toasts are enabled
    if (!isValid && showToasts) {
      toast.error(toastMessage);
    }
    
    const result: ValidationResult<V> = {
      isValid,
      errors: fieldErrors,
      ...(isValid ? { validatedData: validatedData as V } : {})
    };
    
    // Throw combined validation error if configured to do so
    if (!isValid && throwErrors) {
      throw new ValidationError('Form validation failed', {
        code: 'FORM_VALIDATION_ERROR',
        details: { errors: fieldErrors }
      });
    }
    
    return result;
  }, [showToasts, toastMessage, throwErrors]);
  
  /**
   * Clears all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  /**
   * Clears validation error for a specific field
   * 
   * @param fieldName - Field name to clear errors for
   */
  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const { [fieldName]: _, ...rest } = prev;
      return rest;
    });
  }, []);
  
  /**
   * Sets a manual error for a field
   * 
   * @param fieldName - Field name
   * @param errorMessage - Error message
   */
  const setError = useCallback((fieldName: string, errorMessage: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));
  }, []);
  
  return {
    errors,
    validate,
    validateForm,
    clearErrors,
    clearError,
    setError,
    hasErrors: Object.keys(errors).length > 0
  };
};

export default useValidation;
