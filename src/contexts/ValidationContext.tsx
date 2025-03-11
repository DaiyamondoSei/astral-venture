
/**
 * Validation Context
 * 
 * This context provides centralized validation services across the application.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { ValidationResult, ValidationErrorDetail, ValidationErrorCode } from '../types/core';
import { ValidationError } from '../utils/validation/ValidationError';

interface ValidationContextType {
  validate: <T>(data: unknown, schema: any) => ValidationResult<T>;
  createError: (message: string, details?: ValidationErrorDetail[]) => ValidationError;
  formatErrors: (result: ValidationResult<any>) => Record<string, string>;
  isValid: (result: ValidationResult<any>) => boolean;
}

const ValidationContext = createContext<ValidationContextType>({
  validate: () => ({ valid: false }),
  createError: () => new ValidationError('Validation error'),
  formatErrors: () => ({}),
  isValid: () => false
});

interface ValidationProviderProps {
  children: ReactNode;
}

export function ValidationProvider({ children }: ValidationProviderProps) {
  const validate = <T,>(data: unknown, schema: any): ValidationResult<T> => {
    try {
      // This is a placeholder for actual schema validation
      // In a real implementation, this would use a validation library
      const isValid = true; // Replace with actual validation
      
      if (isValid) {
        return { valid: true, validatedData: data as T };
      } else {
        return {
          valid: false,
          error: {
            path: '',
            message: 'Validation failed',
            code: ValidationErrorCode.UNKNOWN_ERROR
          }
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: {
          path: '',
          message: error instanceof Error ? error.message : 'Unknown validation error',
          code: ValidationErrorCode.UNKNOWN_ERROR
        }
      };
    }
  };
  
  const createError = (message: string, details: ValidationErrorDetail[] = []): ValidationError => {
    return new ValidationError(message, details);
  };
  
  const formatErrors = (result: ValidationResult<any>): Record<string, string> => {
    if (result.valid) {
      return {};
    }
    
    const errors: Record<string, string> = {};
    
    if (result.error) {
      errors[result.error.path || 'general'] = result.error.message;
    }
    
    if (result.errors) {
      result.errors.forEach(error => {
        errors[error.path || 'general'] = error.message;
      });
    }
    
    return errors;
  };
  
  const isValid = (result: ValidationResult<any>): boolean => {
    return result.valid;
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
