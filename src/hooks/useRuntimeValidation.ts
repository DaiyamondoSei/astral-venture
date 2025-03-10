
import { useState, useCallback } from 'react';
import { ValidationError } from '../utils/validation/ValidationError';
import { handleError } from '../utils/errorHandling/handleError';

export interface ValidationResult<T = any> {
  isValid: boolean;
  errors: Record<string, string>;
  data: T | null;
}

export interface ValidationOptions {
  validateOnChange?: boolean;
  abortEarly?: boolean;
  showToasts?: boolean;
}

/**
 * Hook for runtime validation with consistent error handling
 */
export function useRuntimeValidation<T extends Record<string, any>>(
  initialData: Partial<T> = {},
  validationSchema?: any,
  options: ValidationOptions = {}
) {
  const {
    validateOnChange = true,
    abortEarly = false,
    showToasts = false
  } = options;

  const [data, setData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Update a single field
  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prevData => ({ ...prevData, [field]: value }));
    setTouchedFields(prev => new Set(prev).add(field as string));
    setIsDirty(true);

    if (validateOnChange && validationSchema) {
      validateField(field as string, value);
    }
  }, [validateOnChange, validationSchema]);

  // Validate a single field
  const validateField = useCallback((field: string, value: any): boolean => {
    try {
      if (!validationSchema) return true;

      // This is a placeholder for actual schema validation
      // In a real app, you'd use something like Zod, Yup, etc.
      const fieldSchema = validationSchema.fields?.[field];
      if (!fieldSchema) return true;

      fieldSchema.validateSync(value, { abortEarly });
      
      // Field is valid, remove any existing error
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      // Update overall validity
      setIsValid(Object.keys(errors).length === 0);
      return true;
    } catch (error) {
      // Handle validation error
      if (error instanceof ValidationError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.message
        }));
        
        if (showToasts) {
          handleError(error, { showToast: true, logToServer: false });
        }
      } else if (error instanceof Error) {
        setErrors(prev => ({
          ...prev,
          [field]: error.message
        }));
      }
      
      setIsValid(false);
      return false;
    }
  }, [validationSchema, abortEarly, errors, showToasts]);

  // Validate all data
  const validateAll = useCallback((): ValidationResult<T> => {
    try {
      if (!validationSchema) {
        return { isValid: true, errors: {}, data: data as T };
      }

      // This is a placeholder for actual schema validation
      // In a real app, you'd use something like Zod, Yup, etc.
      const validatedData = validationSchema.validateSync(data, { abortEarly });
      
      // Clear all errors
      setErrors({});
      setIsValid(true);
      
      return {
        isValid: true,
        errors: {},
        data: validatedData
      };
    } catch (error) {
      const newErrors: Record<string, string> = {};
      
      if (error instanceof ValidationError) {
        newErrors[error.field] = error.message;
        
        if (showToasts) {
          handleError(error, { showToast: true, logToServer: false });
        }
      } else if (error instanceof Error) {
        // Generic error without field information
        newErrors._form = error.message;
      }
      
      setErrors(newErrors);
      setIsValid(false);
      
      return {
        isValid: false,
        errors: newErrors,
        data: null
      };
    }
  }, [data, validationSchema, showToasts]);

  // Reset the form
  const reset = useCallback((newData: Partial<T> = {}) => {
    setData(newData);
    setErrors({});
    setIsValid(true);
    setIsDirty(false);
    setTouchedFields(new Set());
  }, []);

  // Check if a field has been touched
  const isTouched = useCallback((field: string) => {
    return touchedFields.has(field);
  }, [touchedFields]);

  // Set multiple fields at once
  const setFields = useCallback((fields: Partial<T>) => {
    setData(prev => ({ ...prev, ...fields }));
    setIsDirty(true);
    
    // Mark all updated fields as touched
    const newTouched = new Set(touchedFields);
    Object.keys(fields).forEach(field => newTouched.add(field));
    setTouchedFields(newTouched);
    
    if (validateOnChange && validationSchema) {
      // Validate each changed field
      Object.entries(fields).forEach(([field, value]) => {
        validateField(field, value);
      });
    }
  }, [validateOnChange, validationSchema, touchedFields, validateField]);

  return {
    data,
    errors,
    isValid,
    isDirty,
    updateField,
    validateField,
    validateAll,
    reset,
    setFields,
    isTouched,
    touchedFields: Array.from(touchedFields)
  };
}

export default useRuntimeValidation;
