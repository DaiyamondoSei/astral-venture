
/**
 * Error Handling Constants
 * 
 * Shared constants for the error handling system.
 */
import { ErrorCategory, ErrorSeverity } from './types';

// Error categories constants
export const ErrorCategories = {
  VALIDATION: 'validation' as ErrorCategory,
  AUTHENTICATION: 'authentication' as ErrorCategory,
  AUTHORIZATION: 'authorization' as ErrorCategory,
  NETWORK: 'network' as ErrorCategory,
  DATABASE: 'database' as ErrorCategory,
  API: 'api' as ErrorCategory,
  INTERNAL: 'internal' as ErrorCategory,
  UI: 'ui' as ErrorCategory,
  PERFORMANCE: 'performance' as ErrorCategory,
  SECURITY: 'security' as ErrorCategory,
  UNKNOWN: 'unknown' as ErrorCategory
};

// Error severity constants
export const ErrorSeverities = {
  ERROR: 'error' as ErrorSeverity,
  WARNING: 'warning' as ErrorSeverity,
  INFO: 'info' as ErrorSeverity,
  LOW: 'low' as ErrorSeverity,
  MEDIUM: 'medium' as ErrorSeverity,
  HIGH: 'high' as ErrorSeverity
};

// Common error codes
export const ErrorCodes = {
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // Authentication errors
  AUTH_ERROR: 'AUTH_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Data errors
  DATA_ERROR: 'DATA_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE: 'DUPLICATE',
  
  // Operation errors
  TIMEOUT: 'TIMEOUT',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};
