
/**
 * Error handling bridge for cross-environment communication
 * Provides consistent error handling for both frontend and backend
 */

import { ValidationError } from './ValidationError';

/**
 * Standard error codes shared between environments
 */
export enum ErrorCode {
  // Generic errors
  VALIDATION_ERROR = 'validation_error',
  INTERNAL_ERROR = 'internal_error',
  NOT_FOUND = 'not_found',
  
  // Authentication errors
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  AUTHENTICATION_FAILED = 'authentication_failed',
  
  // API-specific errors
  API_ERROR = 'api_error',
  RATE_LIMITED = 'rate_limited',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  
  // Data errors
  DATA_ERROR = 'data_error',
  DATABASE_ERROR = 'database_error'
}

/**
 * Standard error response interface
 */
export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

/**
 * Convert API errors to standard error format
 */
export function handleApiError(error: unknown): ErrorResponse {
  // Handle known error types
  if (error instanceof ValidationError) {
    return {
      code: ErrorCode.VALIDATION_ERROR,
      message: error.message,
      details: {
        field: error.field,
        rule: error.rule,
        details: error.details
      },
      statusCode: error.statusCode || 400
    };
  }
  
  // Handle generic Error objects
  if (error instanceof Error) {
    // Extract error code from message if present
    const codeMatch = error.message.match(/^\[([A-Z_]+)\]/);
    const code = codeMatch ? codeMatch[1] as ErrorCode : ErrorCode.INTERNAL_ERROR;
    
    return {
      code,
      message: codeMatch 
        ? error.message.replace(/^\[[A-Z_]+\]\s*/, '') 
        : error.message,
      details: {
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      statusCode: 500
    };
  }
  
  // Handle unknown errors
  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: String(error),
    statusCode: 500
  };
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: ErrorResponse): string {
  switch (error.code) {
    case ErrorCode.VALIDATION_ERROR:
      return `Validation error: ${error.message}`;
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.FORBIDDEN:
    case ErrorCode.AUTHENTICATION_FAILED:
      return `Authentication error: ${error.message}`;
    case ErrorCode.NOT_FOUND:
      return `Not found: ${error.message}`;
    case ErrorCode.RATE_LIMITED:
      return `Rate limited: Please try again later`;
    case ErrorCode.SERVICE_UNAVAILABLE:
      return `Service unavailable: Please try again later`;
    default:
      return `An error occurred: ${error.message}`;
  }
}

/**
 * Create a validation error
 */
export function createValidationError(
  message: string, 
  field: string, 
  rule?: string
): ValidationError {
  return new ValidationError(message, { field, rule });
}

/**
 * Convert to error response format for edge functions
 */
export function toErrorResponse(error: ErrorResponse): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    }),
    {
      status: error.statusCode || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    }
  );
}
