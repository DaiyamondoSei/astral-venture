
/**
 * Error bridge between frontend and backend systems
 * Provides consistent error handling patterns across environments
 */

import { handleError, ErrorCategory, ErrorSeverity } from './errorHandling';
import { ValidationError } from './validation/ValidationError';

/**
 * Error codes matching the backend error system
 */
export enum ErrorCode {
  INTERNAL_ERROR = 'internal_error',
  NETWORK_ERROR = 'network_error',
  VALIDATION_FAILED = 'validation_failed',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  RATE_LIMITED = 'rate_limited',
  TIMEOUT = 'timeout',
  MISSING_PARAMETERS = 'missing_parameters',
  NOT_FOUND = 'not_found',
  DATABASE_ERROR = 'database_error',
  INVALID_FORMAT = 'invalid_format',
  RESOURCE_EXISTS = 'resource_exists',
  UNDEFINED_ERROR = 'undefined_error'
}

/**
 * Map backend error codes to frontend error categories
 */
const errorCodeToCategory: Record<ErrorCode, ErrorCategory> = {
  [ErrorCode.INTERNAL_ERROR]: ErrorCategory.UNEXPECTED,
  [ErrorCode.NETWORK_ERROR]: ErrorCategory.NETWORK,
  [ErrorCode.VALIDATION_FAILED]: ErrorCategory.VALIDATION,
  [ErrorCode.AUTHENTICATION_ERROR]: ErrorCategory.AUTHENTICATION,
  [ErrorCode.AUTHORIZATION_ERROR]: ErrorCategory.AUTHORIZATION,
  [ErrorCode.RATE_LIMITED]: ErrorCategory.RESOURCE,
  [ErrorCode.TIMEOUT]: ErrorCategory.NETWORK,
  [ErrorCode.MISSING_PARAMETERS]: ErrorCategory.VALIDATION,
  [ErrorCode.NOT_FOUND]: ErrorCategory.RESOURCE,
  [ErrorCode.DATABASE_ERROR]: ErrorCategory.DATA_PROCESSING,
  [ErrorCode.INVALID_FORMAT]: ErrorCategory.VALIDATION,
  [ErrorCode.RESOURCE_EXISTS]: ErrorCategory.DATA_PROCESSING,
  [ErrorCode.UNDEFINED_ERROR]: ErrorCategory.UNEXPECTED
};

/**
 * Map backend error codes to frontend error severities
 */
const errorCodeToSeverity: Record<ErrorCode, ErrorSeverity> = {
  [ErrorCode.INTERNAL_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.NETWORK_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.VALIDATION_FAILED]: ErrorSeverity.WARNING,
  [ErrorCode.AUTHENTICATION_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.AUTHORIZATION_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.RATE_LIMITED]: ErrorSeverity.WARNING,
  [ErrorCode.TIMEOUT]: ErrorSeverity.WARNING,
  [ErrorCode.MISSING_PARAMETERS]: ErrorSeverity.WARNING,
  [ErrorCode.NOT_FOUND]: ErrorSeverity.WARNING,
  [ErrorCode.DATABASE_ERROR]: ErrorSeverity.ERROR,
  [ErrorCode.INVALID_FORMAT]: ErrorSeverity.WARNING,
  [ErrorCode.RESOURCE_EXISTS]: ErrorSeverity.WARNING,
  [ErrorCode.UNDEFINED_ERROR]: ErrorSeverity.ERROR
};

/**
 * Interface for backend error responses
 */
export interface BackendErrorResponse {
  error: string;
  code: ErrorCode;
  details?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Process an error response from the backend
 * Converts backend errors to frontend error format
 * 
 * @param response Error response from backend
 * @param context Context where the error occurred
 */
export function processBackendError(
  response: BackendErrorResponse, 
  context: string
): void {
  const { error, code, details } = response;
  
  // Determine error category and severity
  const category = errorCodeToCategory[code] || ErrorCategory.UNEXPECTED;
  const severity = errorCodeToSeverity[code] || ErrorSeverity.ERROR;
  
  // Create validation error if appropriate
  if (code === ErrorCode.VALIDATION_FAILED && details) {
    const validationError = ValidationError.fromApiError(
      error,
      400,
      details
    );
    
    handleError(validationError, {
      context,
      category,
      severity,
      metadata: details
    });
    
    return;
  }
  
  // Handle other error types
  handleError(new Error(error), {
    context,
    category,
    severity,
    metadata: details
  });
}

/**
 * Safely process a response from an edge function
 * 
 * @param response Response from edge function
 * @param context Context where the request was made
 * @returns Parsed response data or undefined on error
 */
export async function processEdgeFunctionResponse<T>(
  response: Response,
  context: string
): Promise<T | undefined> {
  if (!response.ok) {
    try {
      const errorData = await response.json() as BackendErrorResponse;
      processBackendError(errorData, context);
    } catch (error) {
      handleError(new Error(`API error: ${response.status} ${response.statusText}`), {
        context,
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.ERROR
      });
    }
    return undefined;
  }
  
  try {
    return await response.json() as T;
  } catch (error) {
    handleError(new Error('Invalid response format'), {
      context,
      category: ErrorCategory.DATA_PROCESSING,
      severity: ErrorSeverity.ERROR
    });
    return undefined;
  }
}

export default {
  processBackendError,
  processEdgeFunctionResponse,
  ErrorCode
};
