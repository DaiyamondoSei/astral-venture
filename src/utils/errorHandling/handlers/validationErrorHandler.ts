
import { handleError, ErrorHandlingOptions } from '../handleError';
import { ValidationError } from '../../validation/ValidationError';
import { ErrorSeverity, ErrorCategory } from '../AppError';

/**
 * Specialized options for validation error handling
 */
export interface ValidationErrorHandlingOptions extends ErrorHandlingOptions {
  formId?: string;
  fieldContext?: Record<string, unknown>;
}

/**
 * Specialized handler for validation errors
 */
export function handleValidationError(
  error: ValidationError,
  options: ValidationErrorHandlingOptions = {}
) {
  const { formId, fieldContext, ...baseOptions } = options;
  
  // Create enhanced context with validation-specific information
  const validationContext = {
    ...baseOptions.context,
    formId,
    field: error.field,
    fieldContext
  };
  
  // Use standardized error handling with validation-specific defaults
  return handleError(error, {
    showToast: true, 
    logToServer: false, // Usually don't need to log validation errors to server
    throwError: false,
    severity: ErrorSeverity.WARNING,
    category: ErrorCategory.VALIDATION,
    context: validationContext,
    ...baseOptions
  });
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return ValidationError.isValidationError(error);
}

/**
 * Extract field errors from a validation error or return empty object
 */
export function extractFieldErrors(error: unknown): Record<string, string> {
  if (isValidationError(error)) {
    return { [error.field]: error.message };
  }
  return {};
}

/**
 * Wrap an async function to apply standard validation error handling
 */
export function withValidationErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: ValidationErrorHandlingOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (isValidationError(error)) {
        handleValidationError(error, options);
      } else {
        handleError(error, options);
      }
      throw error;
    }
  };
}
