
/**
 * Common Result Types
 * 
 * Standardized Result-based types for use throughout the application.
 * These types ensure consistent error handling patterns.
 */

import { Result } from './Result';
import { AsyncResult } from './AsyncResult';
import { ValidationError } from '../validation/ValidationError';

/**
 * Standard Result with Error type defaulting to Error
 */
export type ApiResult<T> = Result<T, Error>;

/**
 * Standard Result for validation operations
 */
export type ValidationResult<T> = Result<T, ValidationError>;

/**
 * Standard AsyncResult for API operations
 */
export type ApiAsyncResult<T> = AsyncResult<T, Error>;

/**
 * StandardResult for database operations
 */
export type DbResult<T> = Result<T, Error>;

/**
 * Standard AsyncResult for database operations
 */
export type DbAsyncResult<T> = AsyncResult<T, Error>;

/**
 * Standard AsyncResult for authentication operations
 */
export type AuthAsyncResult<T> = AsyncResult<T, Error>;

/**
 * Common error subtypes for domain classification
 */
export enum ErrorSubtype {
  // API errors
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  AUTH = 'authentication',
  
  // Validation errors
  VALIDATION = 'validation',
  SCHEMA = 'schema',
  FORMAT = 'format',
  
  // Business logic errors
  BUSINESS_RULE = 'business_rule',
  CONFLICT = 'conflict',
  
  // System errors
  INTERNAL = 'internal',
  CONFIGURATION = 'configuration',
  RESOURCE_NOT_FOUND = 'resource_not_found',
  DATABASE = 'database',
  
  // Generic
  UNKNOWN = 'unknown'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',  // System integrity threatened
  ERROR = 'error',        // Operation cannot complete
  WARNING = 'warning',    // Operation completed with issues
  INFO = 'info'           // Informational only
}

/**
 * Enhanced Error interface with metadata
 */
export interface EnhancedError extends Error {
  code?: string;
  subtype?: ErrorSubtype;
  severity?: ErrorSeverity;
  context?: Record<string, unknown>;
  cause?: Error | unknown;
  timestamp?: Date;
  retryable?: boolean;
}

/**
 * Type guard to check if an error is an EnhancedError
 */
export function isEnhancedError(error: unknown): error is EnhancedError {
  return (
    error instanceof Error &&
    (
      'code' in error ||
      'subtype' in error ||
      'severity' in error ||
      'context' in error ||
      'cause' in error ||
      'timestamp' in error ||
      'retryable' in error
    )
  );
}

/**
 * Function to enhance an error with additional metadata
 */
export function enhanceError(
  error: Error,
  enhancement: Partial<Omit<EnhancedError, keyof Error>>
): EnhancedError {
  return Object.assign(error, {
    timestamp: new Date(),
    ...enhancement
  });
}

/**
 * Factory to create typed error with standard metadata
 */
export function createError(
  message: string,
  enhancement: Partial<Omit<EnhancedError, 'message' | 'name'>>
): EnhancedError {
  const error = new Error(message) as EnhancedError;
  
  return Object.assign(error, {
    timestamp: new Date(),
    ...enhancement
  });
}
