
/**
 * Validation Context
 * 
 * This context provides centralized validation services across the application.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  ValidationResult, 
  ValidationErrorDetail, 
  ValidationSchema,
  ValidationErrorCode
} from '../types/core/validation/types';
import {
  ValidationErrorCodes,
  ErrorSeverities
} from '../types/core/validation/constants';
import { ValidationError } from '../types/core/validation/results';

interface ValidationContextType {
  validate: <T>(data: unknown, schema: ValidationSchema) => ValidationResult<T>;
  createError: (message: string, field?: string) => ValidationError;
  formatErrors: (result: ValidationResult<any>) => Record<string, string>;
  isValid: (result: ValidationResult<any>) => boolean;
}

const ValidationContext = createContext<ValidationContextType>({
  validate: () => ({ isValid: false, errors: [] }),
  createError: () => new ValidationError('Validation error'),
  formatErrors: () => ({}),
  isValid: () => false
});

interface ValidationProviderProps {
  children: ReactNode;
}

export function ValidationProvider({ children }: ValidationProviderProps) {
  const validate = <T,>(data: unknown, schema: ValidationSchema): ValidationResult<T> => {
    try {
      // This is a placeholder for actual schema validation
      // In a real implementation, this would use a validation library
      const isValid = true; // Replace with actual validation
      
      if (isValid) {
        return { isValid: true, errors: [], value: data as T, validatedData: data as T };
      } else {
        return {
          isValid: false,
          errors: [{
            path: '',
            message: 'Validation failed',
            code: ValidationErrorCodes.VALIDATION_FAILED,
            severity: ErrorSeverities.ERROR
          }]
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          path: '',
          message: error instanceof Error ? error.message : 'Unknown validation error',
          code: ValidationErrorCodes.UNKNOWN_ERROR,
          severity: ErrorSeverities.ERROR
        }]
      };
    }
  };
  
  const createError = (message: string, field: string = ''): ValidationError => {
    return new ValidationError(message, field);
  };
  
  const formatErrors = (result: ValidationResult<any>): Record<string, string> => {
    if (result.isValid) {
      return {};
    }
    
    const errors: Record<string, string> = {};
    
    result.errors.forEach(error => {
      errors[error.path || 'general'] = error.message;
    });
    
    return errors;
  };
  
  const isValid = (result: ValidationResult<any>): boolean => {
    return result.isValid;
  };
  
  return (
    <ValidationContext.Provider value={{ validate, createError, formatErrors, isValid }}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidation() {
  return useContext(ValidationContext);
}
