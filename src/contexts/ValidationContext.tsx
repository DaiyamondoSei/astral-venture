
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ValidationError } from '@/utils/validation/ValidationError';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  fieldErrors: Record<string, string>;
}

export interface ValidationContextType {
  validationErrors: Record<string, ValidationError[]>;
  fieldErrors: Record<string, Record<string, string>>;
  validateField: (formId: string, field: string, value: unknown, rules: object) => ValidationResult;
  setFieldErrors: (formId: string, field: string, errors: ValidationError[]) => void;
  clearFieldErrors: (formId: string, field?: string) => void;
  validateForm: (formId: string, data: Record<string, unknown>, schema: object) => ValidationResult;
  getFirstError: (formId: string, field: string) => string | undefined;
  hasErrors: (formId: string) => boolean;
}

const ValidationContext = createContext<ValidationContextType | null>(null);

interface ValidationProviderProps {
  children: ReactNode;
}

export const ValidationProvider: React.FC<ValidationProviderProps> = ({ children }) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationError[]>>({});
  const [fieldErrors, setAllFieldErrors] = useState<Record<string, Record<string, string>>>({});
  
  const validateField = useCallback((
    formId: string, 
    field: string, 
    value: unknown, 
    rules: object
  ): ValidationResult => {
    // This is a placeholder implementation - in a real app, we'd implement validation logic
    // or use a library like Zod, Yup, or Joi
    const errors: ValidationError[] = [];
    
    // Return validation result
    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors: errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>)
    };
  }, []);
  
  const setFieldErrors = useCallback((
    formId: string,
    field: string,
    errors: ValidationError[]
  ) => {
    setValidationErrors(prev => ({
      ...prev,
      [formId]: [
        ...(prev[formId] || []).filter(error => error.field !== field),
        ...errors
      ]
    }));
    
    setAllFieldErrors(prev => {
      const formErrors = prev[formId] || {};
      const fieldErrorMessages = errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>);
      
      return {
        ...prev,
        [formId]: {
          ...formErrors,
          [field]: errors.length > 0 ? errors[0].message : ''
        }
      };
    });
  }, []);
  
  const clearFieldErrors = useCallback((formId: string, field?: string) => {
    if (field) {
      setValidationErrors(prev => ({
        ...prev,
        [formId]: (prev[formId] || []).filter(error => error.field !== field)
      }));
      
      setAllFieldErrors(prev => {
        const formErrors = prev[formId] || {};
        const newFormErrors = { ...formErrors };
        delete newFormErrors[field];
        
        return {
          ...prev,
          [formId]: newFormErrors
        };
      });
    } else {
      // Clear all errors for the form
      setValidationErrors(prev => {
        const newValidationErrors = { ...prev };
        delete newValidationErrors[formId];
        return newValidationErrors;
      });
      
      setAllFieldErrors(prev => {
        const newFieldErrors = { ...prev };
        delete newFieldErrors[formId];
        return newFieldErrors;
      });
    }
  }, []);
  
  const validateForm = useCallback((
    formId: string,
    data: Record<string, unknown>,
    schema: object
  ): ValidationResult => {
    // This is a placeholder implementation - in a real app, we'd implement validation logic
    // or use a library like Zod, Yup, or Joi
    const errors: ValidationError[] = [];
    
    // Update validation state
    setValidationErrors(prev => ({
      ...prev,
      [formId]: errors
    }));
    
    const fieldErrorMap = errors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>);
    
    setAllFieldErrors(prev => ({
      ...prev,
      [formId]: fieldErrorMap
    }));
    
    // Return validation result
    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors: fieldErrorMap
    };
  }, []);
  
  const getFirstError = useCallback((formId: string, field: string): string | undefined => {
    const formFieldErrors = fieldErrors[formId] || {};
    return formFieldErrors[field];
  }, [fieldErrors]);
  
  const hasErrors = useCallback((formId: string): boolean => {
    return (validationErrors[formId] || []).length > 0;
  }, [validationErrors]);
  
  const contextValue: ValidationContextType = {
    validationErrors,
    fieldErrors,
    validateField,
    setFieldErrors,
    clearFieldErrors,
    validateForm,
    getFirstError,
    hasErrors
  };
  
  return (
    <ValidationContext.Provider value={contextValue}>
      {children}
    </ValidationContext.Provider>
  );
};

/**
 * Hook to access validation context
 */
export function useValidation(): ValidationContextType {
  const context = useContext(ValidationContext);
  
  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  
  return context;
}

export default ValidationContext;
