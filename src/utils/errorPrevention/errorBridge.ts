
/**
 * Error Bridge - Provides standardized error handling across different environments
 * 
 * This bridge ensures consistent error handling between:
 * - Frontend components and hooks
 * - Supabase Edge Functions
 * - Client-side validation
 */

import { ValidationError } from '../validation/ValidationError';

// Local definition to avoid circular imports
enum ErrorCode {
  NETWORK_ERROR = 'network_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout'
}

/**
 * Types of environments where errors can originate
 */
export type ErrorEnvironment = 'frontend' | 'edge-function' | 'worker' | 'external-api';

/**
 * Standardized error structure for cross-environment communication
 */
export interface StandardizedError {
  code: string;
  message: string;
  originalError?: unknown;
  environment: ErrorEnvironment;
  timestamp: string;
  details?: Record<string, unknown>;
  stack?: string;
}

/**
 * Options for error handling
 */
export interface ErrorHandlingOptions {
  logToConsole?: boolean;
  logToService?: boolean;
  showToUser?: boolean;
  rethrow?: boolean;
}

// Default options for error handling
const defaultOptions: ErrorHandlingOptions = {
  logToConsole: true,
  logToService: false,
  showToUser: true,
  rethrow: false
};

/**
 * Convert any error to a standardized error format
 */
export function standardizeError(
  error: unknown,
  environment: ErrorEnvironment,
  additionalDetails?: Record<string, unknown>
): StandardizedError {
  // Handle different error types
  if (error instanceof ValidationError) {
    return {
      code: error.rule || 'validation_error',
      message: error.message,
      originalError: error,
      environment,
      timestamp: new Date().toISOString(),
      details: {
        field: error.field,
        expectedType: error.expectedType,
        ...additionalDetails
      },
      stack: error.stack
    };
  }
  
  // Handle standard errors
  if (error instanceof Error) {
    return {
      code: 'unknown_error',
      message: error.message,
      originalError: error,
      environment,
      timestamp: new Date().toISOString(),
      details: additionalDetails,
      stack: error.stack
    };
  }
  
  // Handle unknown error types
  return {
    code: 'unknown_error',
    message: typeof error === 'string' ? error : 'An unknown error occurred',
    originalError: error,
    environment,
    timestamp: new Date().toISOString(),
    details: additionalDetails
  };
}

/**
 * Map frontend errors to standard error codes for consistent handling
 */
export function mapToErrorCode(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.rule || 'validation_error';
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ErrorCode.NETWORK_ERROR;
    }
    
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('login')) {
      return ErrorCode.AUTHENTICATION_ERROR;
    }
    
    if (message.includes('permission') || message.includes('forbidden') || message.includes('access')) {
      return ErrorCode.AUTHORIZATION_ERROR;
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return ErrorCode.NOT_FOUND;
    }
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return ErrorCode.TIMEOUT;
    }
  }
  
  return 'unknown_error';
}

/**
 * Handle errors in a standardized way across environments
 */
export function handleError(
  error: unknown, 
  environment: ErrorEnvironment = 'frontend',
  options?: ErrorHandlingOptions
): StandardizedError {
  const opts = { ...defaultOptions, ...options };
  const standardError = standardizeError(error, environment);
  
  // Log error to console
  if (opts.logToConsole) {
    console.error(`[${standardError.environment}] ${standardError.code}: ${standardError.message}`, {
      details: standardError.details,
      timestamp: standardError.timestamp,
      stack: standardError.stack
    });
  }
  
  // Log to error monitoring service
  if (opts.logToService) {
    // Implementation for sending errors to monitoring service
    // would go here (e.g. Sentry, LogRocket, etc.)
  }
  
  // Rethrow error if needed
  if (opts.rethrow) {
    throw error;
  }
  
  return standardError;
}

/**
 * Bridge between frontend errors and edge function error responses
 */
export function createErrorResponseData(error: unknown): {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
} {
  const standardError = standardizeError(error, 'frontend');
  
  return {
    success: false,
    error: {
      code: standardError.code,
      message: standardError.message,
      details: standardError.details
    }
  };
}

export default {
  standardizeError,
  handleError,
  mapToErrorCode,
  createErrorResponseData
};
