
/**
 * Shared response utilities for edge functions
 */

// CORS Headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Error codes for consistent error handling
export enum ErrorCode {
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  VALIDATION_FAILED = 'validation_failed',
  MISSING_PARAMETERS = 'missing_parameters',
  RATE_LIMITED = 'rate_limited',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  INTERNAL_ERROR = 'internal_error',
  BAD_REQUEST = 'bad_request',
}

// Options for error handling
export interface ErrorHandlingOptions {
  showInResponse?: boolean;
  logToConsole?: boolean;
  context?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(
  data: any,
  metadata: Record<string, any> = {}
): Response {
  const responseBody = {
    success: true,
    data,
    ...metadata,
  };

  return new Response(
    JSON.stringify(responseBody),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: any,
  status: number = getStatusCodeForError(code)
): Response {
  const responseBody = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };

  return new Response(
    JSON.stringify(responseBody),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    }
  );
}

/**
 * Log an event for monitoring
 */
export function logEvent(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, any>
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...data,
  };

  switch (level) {
    case 'debug':
      console.debug(JSON.stringify(logData));
      break;
    case 'info':
      console.info(JSON.stringify(logData));
      break;
    case 'warn':
      console.warn(JSON.stringify(logData));
      break;
    case 'error':
      console.error(JSON.stringify(logData));
      break;
  }
}

/**
 * Validate required parameters in a request
 */
export function validateRequiredParameters(
  params: Record<string, any>,
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(param => {
    const value = params[param];
    return value === undefined || value === null || value === '';
  });

  return {
    isValid: missingParams.length === 0,
    missingParams,
  };
}

/**
 * Map error codes to HTTP status codes
 */
function getStatusCodeForError(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.UNAUTHORIZED:
      return 401;
    case ErrorCode.FORBIDDEN:
      return 403;
    case ErrorCode.NOT_FOUND:
      return 404;
    case ErrorCode.VALIDATION_FAILED:
    case ErrorCode.MISSING_PARAMETERS:
    case ErrorCode.BAD_REQUEST:
      return 400;
    case ErrorCode.RATE_LIMITED:
      return 429;
    case ErrorCode.SERVICE_UNAVAILABLE:
      return 503;
    case ErrorCode.INTERNAL_ERROR:
    default:
      return 500;
  }
}

/**
 * Handle errors in edge functions
 */
export function handleError(
  error: any,
  options: ErrorHandlingOptions = {}
): Response {
  const { showInResponse = true, logToConsole = true, context, metadata } = options;
  
  // Default error information
  let code = ErrorCode.INTERNAL_ERROR;
  let message = 'An unexpected error occurred';
  let status = 500;
  
  // Extract error details if possible
  if (error.code) {
    code = error.code;
  }
  
  if (error.message) {
    message = error.message;
  }
  
  if (error.status) {
    status = error.status;
  }
  
  // Determine if this is a known error type
  if (error.response) {
    // API error
    message = error.response.data?.message || message;
    status = error.response.status || status;
  }
  
  // Log the error
  if (logToConsole) {
    const contextStr = context ? ` (${context})` : '';
    logEvent('error', `${message}${contextStr}`, {
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
      ...metadata
    });
  }
  
  // Create the error response
  if (showInResponse) {
    return createErrorResponse(code, message, undefined, status);
  } else {
    // Generic error response for sensitive errors
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'An internal error occurred',
      undefined,
      500
    );
  }
}

export default {
  corsHeaders,
  createSuccessResponse,
  createErrorResponse,
  logEvent,
  validateRequiredParameters,
  handleError,
  ErrorCode,
};
