
import { useState, useCallback } from 'react';
import * as validators from '@/utils/validation/runtimeValidation';
import { ValidationError } from '@/utils/validation/runtimeValidation';
import { handleError, ErrorCategory } from '@/utils/errorHandling';

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  isValid: boolean;
  value: T | undefined;
  error: string | null;
}

/**
 * Options for the useValidation hook
 */
export interface UseValidationOptions {
  /** Whether to show toast notifications for validation errors */
  showToasts?: boolean;
  
  /** Context name for error handling */
  context?: string;
}

/**
 * Custom hook for validating form values and other user inputs
 * 
 * @param options - Validation options
 * @returns Validation utility functions
 */
export function useValidation(options: UseValidationOptions = {}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  /**
   * Validate a value using a validation function
   * 
   * @param value - The value to validate
   * @param validator - The validation function to use
   * @param fieldName - The name of the field being validated
   * @returns Validation result
   */
  const validate = useCallback(<T>(
    value: unknown,
    validator: (value: unknown, name: string) => T,
    fieldName: string
  ): ValidationResult<T> => {
    try {
      // Run the validator
      const validatedValue = validator(value, fieldName);
      
      // Clear any existing error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      
      // Return successful result
      return {
        isValid: true,
        value: validatedValue,
        error: null
      };
    } catch (error) {
      // Get error message
      let errorMessage = 'Invalid value';
      
      if (error instanceof ValidationError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Update errors state
      setErrors(prev => ({
        ...prev,
        [fieldName]: errorMessage
      }));
      
      // Log the validation error
      handleError(error, {
        category: ErrorCategory.VALIDATION,
        context: options.context || 'Validation',
        showToast: options.showToasts,
        customMessage: errorMessage
      });
      
      // Return error result
      return {
        isValid: false,
        value: undefined,
        error: errorMessage
      };
    }
  }, [options.context, options.showToasts]);
  
  /**
   * Validate a required string
   * 
   * @param value - The value to validate
   * @param fieldName - The name of the field being validated
   * @returns Validation result
   */
  const validateRequiredString = useCallback((
    value: unknown,
    fieldName: string
  ): ValidationResult<string> => {
    return validate(value, validators.validateString, fieldName);
  }, [validate]);
  
  /**
   * Validate a required number
   * 
   * @param value - The value to validate
   * @param fieldName - The name of the field being validated
   * @returns Validation result
   */
  const validateRequiredNumber = useCallback((
    value: unknown,
    fieldName: string
  ): ValidationResult<number> => {
    return validate(value, validators.validateNumber, fieldName);
  }, [validate]);
  
  /**
   * Validate a required boolean
   * 
   * @param value - The value to validate
   * @param fieldName - The name of the field being validated
   * @returns Validation result
   */
  const validateRequiredBoolean = useCallback((
    value: unknown,
    fieldName: string
  ): ValidationResult<boolean> => {
    return validate(value, validators.validateBoolean, fieldName);
  }, [validate]);
  
  /**
   * Validate a number within a range
   * 
   * @param value - The value to validate
   * @param min - The minimum allowed value
   * @param max - The maximum allowed value
   * @param fieldName - The name of the field being validated
   * @returns Validation result
   */
  const validateNumberRange = useCallback((
    value: unknown,
    min: number,
    max: number,
    fieldName: string
  ): ValidationResult<number> => {
    return validate(
      value,
      (val, name) => validators.validateRange(val, min, max, name),
      fieldName
    );
  }, [validate]);
  
  /**
   * Validate an email address
   * 
   * @param value - The value to validate
   * @param fieldName - The name of the field being validated
   * @returns Validation result
   */
  const validateEmailAddress = useCallback((
    value: unknown,
    fieldName: string
  ): ValidationResult<string> => {
    return validate(
      value,
      validators.validateEmail,
      fieldName
    );
  }, [validate]);
  
  /**
   * Validate a URL
   * 
   * @param value - The value to validate
   * @param fieldName - The name of the field being validated
   * @returns Validation result
   */
  const validateURL = useCallback((
    value: unknown,
    fieldName: string
  ): ValidationResult<string> => {
    return validate(
      value,
      validators.validateUrl,
      fieldName
    );
  }, [validate]);
  
  /**
   * Clear all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  /**
   * Clear a specific validation error
   * 
   * @param fieldName - The name of the field to clear errors for
   */
  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);
  
  // Return the validation utility functions and current errors
  return {
    errors,
    hasErrors: Object.keys(errors).length > 0,
    validate,
    validateRequiredString,
    validateRequiredNumber,
    validateRequiredBoolean,
    validateNumberRange,
    validateEmailAddress,
    validateURL,
    clearErrors,
    clearError
  };
}

export default useValidation;
