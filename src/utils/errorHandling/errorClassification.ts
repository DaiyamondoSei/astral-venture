
/**
 * Error Classification Utilities
 * 
 * This module provides utilities for classifying errors by type and severity.
 */

import { ErrorCategory, ErrorSeverity } from './types';
import { isValidationError } from '../validation/ValidationError';

/**
 * Determine error category from error type
 */
export function determineErrorCategory(error: unknown): ErrorCategory {
  if (isValidationError(error)) {
    if (error.rule === 'type-check') {
      return ErrorCategory.TYPE_ERROR;
    }
    if (error.rule === 'required' || error.rule?.includes('min') || error.rule?.includes('max') || error.rule === 'pattern') {
      return ErrorCategory.CONSTRAINT_ERROR;
    }
    return ErrorCategory.VALIDATION;
  }
  
  if (error instanceof TypeError) {
    return ErrorCategory.TYPE_ERROR;
  }
  
  if (error instanceof SyntaxError) {
    return ErrorCategory.DATA_PROCESSING;
  }
  
  if (error instanceof ReferenceError) {
    return ErrorCategory.UNEXPECTED;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Handle fetch errors
    if ('status' in error && 'statusText' in error) {
      return ErrorCategory.NETWORK;
    }
    
    // Handle authentication errors
    if ('code' in error && typeof error.code === 'string' && 
        (error.code.includes('auth') || error.code.includes('permission'))) {
      return ErrorCategory.AUTHENTICATION;
    }
  }
  
  return ErrorCategory.UNEXPECTED;
}

/**
 * Determine error severity based on category
 */
export function determineErrorSeverity(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.NETWORK:
      return ErrorSeverity.ERROR;
    
    case ErrorCategory.VALIDATION:
    case ErrorCategory.USER_INPUT:
    case ErrorCategory.CONSTRAINT_ERROR:
      return ErrorSeverity.WARNING;
    
    case ErrorCategory.UNEXPECTED:
    case ErrorCategory.TYPE_ERROR:
      return ErrorSeverity.CRITICAL;
    
    default:
      return ErrorSeverity.ERROR;
  }
}

/**
 * Extract error message from various error types
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
  }
  
  return 'An unknown error occurred';
}
