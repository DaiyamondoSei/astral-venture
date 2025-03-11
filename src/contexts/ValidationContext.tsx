
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ValidationError } from '../utils/validation/types';

interface ValidationContextType {
  errors: ValidationError[];
  addError: (error: ValidationError) => void;
  clearErrors: () => void;
  hasErrors: boolean;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export function ValidationProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const addError = (error: ValidationError) => {
    setErrors(prev => [...prev, error]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <ValidationContext.Provider 
      value={{
        errors,
        addError,
        clearErrors,
        hasErrors: errors.length > 0
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidation() {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
}
