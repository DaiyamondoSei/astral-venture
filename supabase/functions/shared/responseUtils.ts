
/**
 * Shared response utilities for edge functions
 */

// CORS headers for all responses
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Standard content type headers
export const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json"
};

// Error codes for consistent error responses
export enum ErrorCode {
  // Generic errors
  UNKNOWN_ERROR = "unknown_error",
  SERVER_ERROR = "server_error",
  
  // Authentication/Authorization errors
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  
  // Input errors
  MISSING_PARAMETERS = "missing_parameters",
  INVALID_PARAMETERS = "invalid_parameters",
  VALIDATION_FAILED = "validation_failed",
  
  // Resource errors
  NOT_FOUND = "not_found",
  ALREADY_EXISTS = "already_exists",
  
  // Rate limiting
  RATE_LIMITED = "rate_limited",
}

// Interface for error handling options
export interface ErrorHandlingOptions {
  logToConsole?: boolean;
  showDetails?: boolean;
  context?: Record<string, unknown>;
}

/**
 * Create a preflight response for CORS
 */
export function createPreflightResponse(): Response {
  return new Response(null, {
    headers: corsHeaders,
    status: 204, // No content for OPTIONS requests
  });
}

/**
 * Create a success response with standard format
 * 
 * @param data Response data
 * @param meta Optional metadata
 * @param status HTTP status code
 * @returns Formatted success response
 */
export function createSuccessResponse(
  data: unknown,
  meta: Record<string, unknown> = {},
  status = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    }),
    {
      headers: jsonHeaders,
      status
    }
  );
}

/**
 * Create an error response with standard format
 * 
 * @param code Error code
 * @param message User-friendly error message
 * @param details Optional error details
 * @param status HTTP status code
 * @returns Formatted error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  status = getStatusForErrorCode(code)
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    }),
    {
      headers: jsonHeaders,
      status
    }
  );
}

/**
 * Map error codes to HTTP status codes
 */
function getStatusForErrorCode(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.UNAUTHORIZED:
      return 401;
    case ErrorCode.FORBIDDEN:
      return 403;
    case ErrorCode.NOT_FOUND:
      return 404;
    case ErrorCode.VALIDATION_FAILED:
    case ErrorCode.INVALID_PARAMETERS:
    case ErrorCode.MISSING_PARAMETERS:
      return 400;
    case ErrorCode.ALREADY_EXISTS:
      return 409;
    case ErrorCode.RATE_LIMITED:
      return 429;
    case ErrorCode.SERVER_ERROR:
      return 500;
    default:
      return 500;
  }
}

/**
 * Validate required parameters
 * 
 * @param params Parameters to validate
 * @param requiredKeys Array of required keys
 * @returns Validation result
 */
export function validateRequiredParameters(
  params: Record<string, unknown>,
  requiredKeys: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredKeys.filter(key => {
    const value = params[key];
    return value === undefined || value === null || value === '';
  });
  
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

/**
 * Log an event for monitoring and debugging
 * 
 * @param level Log level
 * @param message Event message
 * @param data Additional event data
 */
export function logEvent(
  level: "info" | "warn" | "error" | "debug",
  message: string,
  data?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const logData = { level, message, timestamp, ...data };
  
  // In production, this could send to a logging service
  console.log(JSON.stringify(logData));
}
