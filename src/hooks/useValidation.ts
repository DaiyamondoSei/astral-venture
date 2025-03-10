
import { useState, useCallback } from 'react';
import {
  ValidationError,
  validateDefined,
  validateNonEmptyString,
  validateNumber,
  validateOneOf,
  validatePattern,
  validateRange,
  validateArray,
  validateObject,
  validateMinLength,
  validateMaxLength
} from '@/utils/validation/runtimeValidation';
import { ErrorCategory, ErrorSeverity, handleError } from '@/utils/errorHandling';

/**
 * Validation result type
 */
interface ValidationResult<T> {
  /** Whether the validation was successful */
  isValid: boolean;
  /** Validated value (if successful) */
  value?: T;
  /** Error message (if unsuccessful) */
  error?: string;
}

/**
 * Hook for form validation
 */
export function useValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  /**
   * Clear validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  /**
   * Clear a specific validation error
   * 
   * @param field - Field name to clear error for
   */
  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);
  
  /**
   * Set an error for a specific field
   * 
   * @param field - Field name
   * @param errorMessage - Error message
   */
  const setError = useCallback((field: string, errorMessage: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: errorMessage
    }));
  }, []);
  
  /**
   * Run a validation function safely
   * 
   * @param field - Field name
   * @param validationFn - Validation function
   * @returns Validation result
   */
  const validate = useCallback(<T>(
    field: string,
    validationFn: () => T
  ): ValidationResult<T> => {
    try {
      // Clear any existing error for this field
      clearError(field);
      
      // Run the validation function
      const value = validationFn();
      
      return { isValid: true, value };
    } catch (error) {
      // Handle validation errors
      if (error instanceof ValidationError) {
        const errorMessage = error.message;
        
        // Set the error in state
        setError(field, errorMessage);
        
        // Log the error (warning level since it's expected during form validation)
        handleError(error, {
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.WARNING,
          context: `Field validation (${field})`,
          showToast: false,
          metadata: {
            field,
            code: error.code
          }
        });
        
        return { isValid: false, error: errorMessage };
      }
      
      // Handle unexpected errors
      const unexpectedError = error instanceof Error 
        ? error 
        : new Error(String(error));
      
      // Set a generic error message
      const errorMessage = 'Validation failed unexpectedly';
      setError(field, errorMessage);
      
      // Log the unexpected error
      handleError(unexpectedError, {
        category: ErrorCategory.UNEXPECTED,
        severity: ErrorSeverity.ERROR,
        context: `Field validation (${field})`,
        showToast: false
      });
      
      return { isValid: false, error: errorMessage };
    }
  }, [clearError, setError]);
  
  /**
   * Validate a required field
   * 
   * @param value - Field value
   * @param field - Field name
   * @returns Validation result
   */
  const validateRequired = useCallback(
    <T>(value: T | null | undefined, field: string): ValidationResult<T> => {
      return validate(field, () => validateDefined(value, field));
    },
    [validate]
  );
  
  /**
   * Validate a required string field
   * 
   * @param value - Field value
   * @param field - Field name
   * @returns Validation result
   */
  const validateRequiredString = useCallback(
    (value: string | null | undefined, field: string): ValidationResult<string> => {
      return validate(field, () => validateNonEmptyString(value, field));
    },
    [validate]
  );
  
  /**
   * Validate a number field
   * 
   * @param value - Field value
   * @param field - Field name
   * @returns Validation result
   */
  const validateNumeric = useCallback(
    (value: unknown, field: string): ValidationResult<number> => {
      return validate(field, () => validateNumber(value, field));
    },
    [validate]
  );
  
  /**
   * Validate a field against allowed values
   * 
   * @param value - Field value
   * @param allowedValues - Array of allowed values
   * @param field - Field name
   * @returns Validation result
   */
  const validateAllowed = useCallback(
    <T extends string | number>(
      value: T,
      allowedValues: T[],
      field: string
    ): ValidationResult<T> => {
      return validate(field, () => validateOneOf(value, allowedValues, field));
    },
    [validate]
  );
  
  /**
   * Validate a field against a pattern
   * 
   * @param value - Field value
   * @param pattern - Regular expression pattern
   * @param field - Field name
   * @returns Validation result
   */
  const validateRegex = useCallback(
    (value: string, pattern: RegExp, field: string): ValidationResult<string> => {
      return validate(field, () => validatePattern(value, pattern, field));
    },
    [validate]
  );
  
  /**
   * Validate a number within a range
   * 
   * @param value - Field value
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value
   * @param field - Field name
   * @returns Validation result
   */
  const validateRangeValue = useCallback(
    (value: number, min: number, max: number, field: string): ValidationResult<number> => {
      return validate(field, () => validateRange(value, min, max, field));
    },
    [validate]
  );
  
  /**
   * Validate string length
   * 
   * @param value - Field value
   * @param options - Validation options
   * @param field - Field name
   * @returns Validation result
   */
  const validateLength = useCallback(
    (
      value: string,
      options: { min?: number; max?: number },
      field: string
    ): ValidationResult<string> => {
      return validate(field, () => {
        let result = value;
        
        if (options.min !== undefined) {
          result = validateMinLength(result, options.min, field);
        }
        
        if (options.max !== undefined) {
          result = validateMaxLength(result, options.max, field);
        }
        
        return result;
      });
    },
    [validate]
  );
  
  /**
   * Validate an array
   * 
   * @param value - Field value
   * @param field - Field name
   * @returns Validation result
   */
  const validateArrayField = useCallback(
    <T>(value: unknown, field: string): ValidationResult<T[]> => {
      return validate(field, () => validateArray<T>(value, field));
    },
    [validate]
  );
  
  /**
   * Validate an object
   * 
   * @param value - Field value
   * @param field - Field name
   * @returns Validation result
   */
  const validateObjectField = useCallback(
    <T extends Record<string, unknown>>(value: unknown, field: string): ValidationResult<T> => {
      return validate(field, () => validateObject<T>(value, field));
    },
    [validate]
  );
  
  /**
   * Run multiple validations
   * 
   * @param validations - Array of validation functions
   * @returns Whether all validations passed
   */
  const runValidations = useCallback(
    (validations: Array<() => ValidationResult<unknown>>): boolean => {
      const results = validations.map(validation => validation());
      return results.every(result => result.isValid);
    },
    []
  );
  
  return {
    errors,
    clearErrors,
    clearError,
    setError,
    validate,
    validateRequired,
    validateRequiredString,
    validateNumeric,
    validateAllowed,
    validateRegex,
    validateRangeValue,
    validateLength,
    validateArrayField,
    validateObjectField,
    runValidations,
    hasErrors: Object.keys(errors).length > 0
  };
}

export default useValidation;
