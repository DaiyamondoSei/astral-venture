
/**
 * Error Classification Utilities
 * 
 * Utilities for classifying and categorizing errors.
 */
import { ValidationError } from '@/utils/validation/ValidationError';
import { ErrorCategories, ErrorSeverities } from './constants';
import { ErrorCategory, ErrorSeverity } from './types';
import { AppError } from './AppError';

/**
 * Determine the category of an error based on its type and message
 */
export function determineErrorCategory(error: unknown): ErrorCategory {
  // Check if it's an AppError with a category
  if (AppError.isAppError(error) && error.category) {
    return error.category;
  }
  
  // Check for validation errors
  if (error instanceof ValidationError) {
    return ErrorCategories.VALIDATION;
  }
  
  // Try to extract info from standard Error
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    
    // Check for auth-related errors
    if (
      name.includes('auth') || 
      message.includes('unauthorized') || 
      message.includes('unauthenticated') ||
      message.includes('permission') ||
      message.includes('forbidden') ||
      message.includes('access denied')
    ) {
      return ErrorCategories.AUTHENTICATION;
    }
    
    // Check for network errors
    if (
      name.includes('network') ||
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('offline')
    ) {
      return ErrorCategories.NETWORK;
    }
    
    // Check for database errors
    if (
      name.includes('db') ||
      name.includes('database') ||
      message.includes('database') ||
      message.includes('query failed') ||
      message.includes('transaction')
    ) {
      return ErrorCategories.DATABASE;
    }
    
    // Check for API errors
    if (
      name.includes('api') ||
      message.includes('api') ||
      message.includes('endpoint') ||
      message.includes('service')
    ) {
      return ErrorCategories.API;
    }
  }
  
  // Default to unknown
  return ErrorCategories.UNKNOWN;
}

/**
 * Determine the severity of an error based on its category
 */
export function determineErrorSeverity(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategories.AUTHENTICATION:
    case ErrorCategories.AUTHORIZATION:
    case ErrorCategories.SECURITY:
      return ErrorSeverities.HIGH;
      
    case ErrorCategories.DATABASE:
    case ErrorCategories.API:
    case ErrorCategories.NETWORK:
      return ErrorSeverities.MEDIUM;
      
    case ErrorCategories.VALIDATION:
    case ErrorCategories.UI:
      return ErrorSeverities.LOW;
      
    default:
      return ErrorSeverities.ERROR;
  }
}

/**
 * Extract a user-friendly message from an error
 */
export function extractErrorMessage(error: unknown): string {
  if (AppError.isAppError(error)) {
    return error.userMessage || error.message;
  }
  
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return String(error);
}
