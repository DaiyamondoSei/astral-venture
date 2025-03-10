
/**
 * Error Classification Utilities
 * 
 * Utilities for classifying and categorizing errors.
 */

import { ErrorCategory, ErrorSeverity } from './types';
import ValidationError, { isValidationError } from '../validation/ValidationError';

/**
 * Determine the category of an error based on its properties or message
 */
export function determineErrorCategory(error: unknown): ErrorCategory {
  // Check if it's already a categorized AppError
  if (error && typeof error === 'object' && 'category' in error) {
    return error.category as ErrorCategory;
  }
  
  // Check for validation errors
  if (isValidationError(error)) {
    return ErrorCategory.VALIDATION;
  }
  
  // Check for network errors
  if (
    error instanceof Error && (
      error.name === 'NetworkError' ||
      error.name === 'FetchError' ||
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('connection') ||
      error.message.includes('timeout')
    )
  ) {
    return ErrorCategory.NETWORK;
  }
  
  // Check for auth errors
  if (
    error instanceof Error && (
      error.name === 'AuthError' ||
      error.message.includes('auth') ||
      error.message.includes('token') ||
      error.message.includes('permission') ||
      error.message.includes('unauthorized') ||
      error.message.includes('forbidden')
    )
  ) {
    return ErrorCategory.AUTHORIZATION;
  }
  
  // Check for type errors
  if (error instanceof TypeError) {
    return ErrorCategory.TYPE_ERROR;
  }
  
  // Default to unexpected
  return ErrorCategory.UNEXPECTED;
}

/**
 * Determine the severity of an error based on its category
 */
export function determineErrorSeverity(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.NETWORK:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.AUTHENTICATION:
      return ErrorSeverity.ERROR;
      
    case ErrorCategory.VALIDATION:
    case ErrorCategory.USER_INPUT:
      return ErrorSeverity.WARNING;
      
    case ErrorCategory.TYPE_ERROR:
    case ErrorCategory.CONSTRAINT_ERROR:
    case ErrorCategory.UNEXPECTED:
      return ErrorSeverity.CRITICAL;
      
    default:
      return ErrorSeverity.ERROR;
  }
}

/**
 * Extract a user-friendly message from an error object
 */
export function extractErrorMessage(error: unknown): string {
  // Check if it already has a user message
  if (error && typeof error === 'object' && 'userMessage' in error && typeof error.userMessage === 'string') {
    return error.userMessage;
  }
  
  // Check if it's a validation error
  if (isValidationError(error)) {
    return error.message;
  }
  
  // Check if it's a standard error
  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message);
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return sanitizeErrorMessage(error);
  }
  
  // Default message
  return 'An unexpected error occurred';
}

/**
 * Clean up error messages to make them more user-friendly
 */
function sanitizeErrorMessage(message: string): string {
  // Remove technical details
  message = message.replace(/Error:\s*/i, '');
  
  // Capitalize first letter
  message = message.charAt(0).toUpperCase() + message.slice(1);
  
  // Add period if needed
  if (!message.endsWith('.') && !message.endsWith('!') && !message.endsWith('?')) {
    message += '.';
  }
  
  return message;
}

export default {
  determineErrorCategory,
  determineErrorSeverity,
  extractErrorMessage
};
