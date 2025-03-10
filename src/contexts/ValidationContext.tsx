
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ValidationError, isValidationError } from '@/utils/validation/ValidationError';
import { toast } from '@/hooks/use-toast';

interface ValidationContextType {
  validateInput: <T>(validationFn: () => T, fieldName?: string) => T | undefined;
  handleValidationError: (error: unknown, field?: string) => void;
  clearErrors: () => void;
  errors: Record<string, string>;
  hasErrors: boolean;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export const ValidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Safely run a validation function
  const validateInput = useCallback(<T,>(validationFn: () => T, fieldName?: string): T | undefined => {
    try {
      // Clear previous error for this field
      if (fieldName && errors[fieldName]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
      
      // Run the validation function
      return validationFn();
    } catch (error) {
      // Handle validation errors
      handleValidationError(error, fieldName);
      return undefined;
    }
  }, [errors]);

  // Handle validation errors
  const handleValidationError = useCallback((error: unknown, field?: string) => {
    if (isValidationError(error)) {
      // Store errors by field
      setErrors(prev => ({
        ...prev,
        [field || error.field]: error.message
      }));
      
      // Show toast for validation errors
      toast({
        title: 'Validation Error',
        description: error.message,
        variant: 'destructive',
      });
    } else if (error instanceof Error) {
      // Handle other errors
      setErrors(prev => ({
        ...prev,
        [field || 'general']: error.message
      }));
      
      // Show toast for other errors
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, []);

  // Clear all validation errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const value = {
    validateInput,
    handleValidationError,
    clearErrors,
    errors,
    hasErrors: Object.keys(errors).length > 0
  };

  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
};

// Hook to use the validation context
export function useValidation() {
  const context = useContext(ValidationContext);
  
  if (context === undefined) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  
  return context;
}

export default ValidationContext;
