
/**
 * Error Classification Utilities
 * 
 * Utilities for categorizing and extracting information from errors
 */

import { ValidationError, isValidationError } from '../validation/ValidationError';
import { ErrorCategory, ErrorSeverity } from './AppError';

/**
 * Extract a readable message from any error type
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
    
    try {
      return JSON.stringify(error);
    } catch {
      return '[Object]';
    }
  }
  
  return String(error);
}

/**
 * Determine the category of an error based on its type
 */
export function determineErrorCategory(error: unknown): ErrorCategory {
  // Check for validation errors
  if (isValidationError(error)) {
    return ErrorCategory.VALIDATION;
  }
  
  // Check for network/fetch errors
  if (
    error instanceof TypeError && 
    error.message.includes('fetch')
  ) {
    return ErrorCategory.NETWORK;
  }
  
  // Check for authentication errors
  if (
    error instanceof Error && (
      error.message.includes('auth') ||
      error.message.includes('login') ||
      error.message.includes('password') ||
      error.message.includes('token') ||
      error.message.includes('credential')
    )
  ) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  // Check for database errors
  if (
    error instanceof Error && (
      error.message.includes('database') ||
      error.message.includes('query') ||
      error.message.includes('sql') ||
      error.message.includes('table')
    )
  ) {
    return ErrorCategory.DATABASE;
  }
  
  // Check for UI errors
  if (
    error instanceof Error && (
      error.message.includes('render') ||
      error.message.includes('component') ||
      error.message.includes('prop') ||
      error.message.includes('ref')
    )
  ) {
    return ErrorCategory.UI;
  }
  
  // Check if it's an Error object with name
  if (error instanceof Error) {
    switch (error.name) {
      case 'SyntaxError':
      case 'TypeError':
      case 'ReferenceError':
        return ErrorCategory.DATA_PROCESSING;
      case 'NetworkError':
      case 'AbortError':
        return ErrorCategory.NETWORK;
      case 'SecurityError':
        return ErrorCategory.AUTHORIZATION;
    }
  }
  
  // Default to unexpected
  return ErrorCategory.UNEXPECTED;
}

/**
 * Determine the severity of an error based on its category
 */
export function determineErrorSeverity(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.VALIDATION:
      return ErrorSeverity.WARNING;
      
    case ErrorCategory.UI:
      return ErrorSeverity.ERROR;
      
    case ErrorCategory.NETWORK:
    case ErrorCategory.API:
      return ErrorSeverity.ERROR;
      
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.DATABASE:
      return ErrorSeverity.CRITICAL;
      
    case ErrorCategory.UNEXPECTED:
    case ErrorCategory.BUSINESS_LOGIC:
    case ErrorCategory.DATA_PROCESSING:
    case ErrorCategory.EXTERNAL_SERVICE:
    default:
      return ErrorSeverity.ERROR;
  }
}

export default {
  extractErrorMessage,
  determineErrorCategory,
  determineErrorSeverity
};
