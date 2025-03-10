
/**
 * Standardized error codes for edge functions
 */
export enum ErrorCode {
  // Generic errors
  INTERNAL_ERROR = 'internal_error',
  NOT_FOUND = 'not_found',
  VALIDATION_FAILED = 'validation_failed',
  
  // Authentication & authorization errors
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  UNAUTHORIZED = 'unauthorized',
  
  // Service errors
  SERVICE_UNAVAILABLE = 'service_unavailable',
  RATE_LIMITED = 'rate_limited',
  TIMEOUT = 'timeout',
  NETWORK_ERROR = 'network_error',
  
  // Database errors
  DATABASE_ERROR = 'database_error',
  QUERY_ERROR = 'query_error',
  
  // User input errors
  INVALID_INPUT = 'invalid_input',
  DUPLICATE_ENTRY = 'duplicate_entry',
  RESOURCE_EXISTS = 'resource_exists'
}

/**
 * Interface for standardized Edge Function responses
 */
export interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode | string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Creates a successful response
 * 
 * @param data - The response data
 * @param metadata - Optional metadata
 * @returns A successful response object
 */
export function createSuccessResponse<T = any>(
  data: T,
  metadata?: Record<string, unknown>
): Response {
  const response: EdgeFunctionResponse<T> = {
    success: true,
    data,
    metadata
  };
  
  return new Response(
    JSON.stringify(response),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Creates an error response
 * 
 * @param code - The error code
 * @param message - The error message
 * @param details - Optional error details or metadata
 * @returns An error response object
 */
export function createErrorResponse(
  code: ErrorCode | string,
  message: string,
  details?: Record<string, unknown>
): Response {
  const response: EdgeFunctionResponse = {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
  
  const statusCode = getHttpStatusFromErrorCode(code);
  
  return new Response(
    JSON.stringify(response),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Maps error codes to HTTP status codes
 * 
 * @param code - The error code
 * @returns The corresponding HTTP status code
 */
function getHttpStatusFromErrorCode(code: ErrorCode | string): number {
  switch (code) {
    case ErrorCode.NOT_FOUND:
      return 404;
    case ErrorCode.VALIDATION_FAILED:
    case ErrorCode.INVALID_INPUT:
      return 400;
    case ErrorCode.AUTHENTICATION_ERROR:
    case ErrorCode.UNAUTHORIZED:
      return 401;
    case ErrorCode.AUTHORIZATION_ERROR:
      return 403;
    case ErrorCode.RATE_LIMITED:
      return 429;
    case ErrorCode.DUPLICATE_ENTRY:
    case ErrorCode.RESOURCE_EXISTS:
      return 409;
    case ErrorCode.TIMEOUT:
      return 408;
    case ErrorCode.SERVICE_UNAVAILABLE:
      return 503;
    default:
      return 500;
  }
}

export default {
  createSuccessResponse,
  createErrorResponse,
  ErrorCode
};
