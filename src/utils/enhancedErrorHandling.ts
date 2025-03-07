
import { captureException } from './errorHandling';

/**
 * Custom error types for better error categorization
 */

/**
 * Base application error class that all other custom errors extend
 */
export class AppError extends Error {
  code: string;
  additionalInfo?: Record<string, any>;
  
  constructor(message: string, code = 'APP_ERROR', additionalInfo?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.additionalInfo = additionalInfo;
    
    // Maintains proper stack trace for where our error was thrown
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error for API request failures
 */
export class APIError extends AppError {
  status: number;
  
  constructor(message: string, status = 500, additionalInfo?: Record<string, any>) {
    super(message, 'API_ERROR', additionalInfo);
    this.status = status;
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends AppError {
  fieldErrors: Record<string, string[]>;
  
  constructor(message: string, fieldErrors: Record<string, string[]> = {}, additionalInfo?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', additionalInfo);
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Error for authentication failures
 */
export class AuthError extends AppError {
  constructor(message: string, additionalInfo?: Record<string, any>) {
    super(message, 'AUTH_ERROR', additionalInfo);
  }
}

/**
 * Error for feature unavailability
 */
export class FeatureUnavailableError extends AppError {
  constructor(message: string, additionalInfo?: Record<string, any>) {
    super(message, 'FEATURE_UNAVAILABLE', additionalInfo);
  }
}

/**
 * Advanced error handling utilities
 */

/**
 * Maps error messages to user-friendly messages based on patterns
 */
const errorMessageMap = new Map([
  [/network|connection|internet/i, 'There was a problem connecting to the server. Please check your internet connection.'],
  [/timeout|timed out/i, 'The request took too long to complete. Please try again.'],
  [/not found|404/i, 'The requested resource could not be found.'],
  [/server error|500/i, 'There was a problem with the server. Please try again later.'],
  [/unauthorized|authentication|auth|401/i, 'You need to be logged in to access this feature.'],
  [/forbidden|permission|403/i, 'You don\'t have permission to access this resource.'],
  [/validation|invalid|format/i, 'Some information you provided is invalid.'],
  [/quota|limit|exceeded/i, 'You\'ve reached the usage limit for this feature.'],
  [/database|db/i, 'There was a problem accessing your data.'],
  [/version|outdated|update/i, 'You may need to refresh the page to get the latest version.'],
]);

/**
 * Gets a user-friendly error message based on the original error
 */
export function getUserFriendlyErrorMessage(error: Error | string): string {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Check if the error message matches any patterns
  for (const [pattern, friendlyMessage] of errorMessageMap.entries()) {
    if (pattern.test(errorMessage)) {
      return friendlyMessage;
    }
  }
  
  // Default friendly message for unrecognized errors
  return 'An unexpected error occurred. Please try again later.';
}

/**
 * Categorizes an error based on its type and message
 */
export function categorizeError(error: Error): string {
  if (error instanceof ValidationError) return 'validation';
  if (error instanceof AuthError) return 'authentication';
  if (error instanceof APIError) return 'api';
  if (error instanceof FeatureUnavailableError) return 'feature';
  
  const errorMessage = error.message.toLowerCase();
  
  if (/network|connection|internet|timeout|timed out/i.test(errorMessage)) return 'network';
  if (/unauthorized|authentication|auth|401/i.test(errorMessage)) return 'authentication';
  if (/forbidden|permission|403/i.test(errorMessage)) return 'permission';
  if (/not found|404/i.test(errorMessage)) return 'notFound';
  if (/server error|500/i.test(errorMessage)) return 'server';
  if (/validation|invalid|format/i.test(errorMessage)) return 'validation';
  
  return 'unknown';
}

/**
 * Centralized error handler that processes errors and performs appropriate actions
 */
export function handleError(error: Error, context?: Record<string, any>): void {
  const category = categorizeError(error);
  const friendlyMessage = getUserFriendlyErrorMessage(error);
  
  // Log the error with additional context
  console.error(`[${category.toUpperCase()}] ${error.message}`, {
    errorName: error.name,
    stack: error.stack,
    category,
    ...context,
    ...(error instanceof AppError ? error.additionalInfo : {})
  });
  
  // Capture the exception for monitoring
  captureException(error, {
    category,
    context,
    friendlyMessage,
    ...(error instanceof AppError ? error.additionalInfo : {})
  });
  
  // For authentication errors, you might want to trigger a redirect or session refresh
  if (category === 'authentication') {
    // Example: could dispatch an action to show login modal or redirect to login
    console.log('Authentication error - user might need to log in again');
  }
}

/**
 * Creates a safe function wrapper that catches errors and handles them
 */
export function createSafeFunction<T extends (...args: any[]) => any>(
  fn: T, 
  errorHandler = handleError
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler(error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  };
}

/**
 * Creates an async safe function wrapper for async functions
 */
export function createSafeAsyncFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler = handleError
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | undefined> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler(error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  };
}
