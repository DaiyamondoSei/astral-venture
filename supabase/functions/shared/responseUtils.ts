
/**
 * Shared response utilities for Edge Functions
 */

// Common headers for cross-origin requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Error codes for consistent error responses
export enum ErrorCode {
  MISSING_PARAMETERS = "missing_parameters",
  INVALID_PARAMETERS = "invalid_parameters",
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  NOT_FOUND = "not_found",
  TIMEOUT = "timeout",
  DATABASE_ERROR = "database_error",
  EXTERNAL_API_ERROR = "external_api_error",
  INTERNAL_ERROR = "internal_error"
}

// Result interface for success responses
interface SuccessResult<T> {
  success: true;
  data: T;
  metadata?: Record<string, any>;
}

// Result interface for error responses
interface ErrorResult {
  success: false;
  error: {
    code: ErrorCode | string;
    message: string;
    details?: any;
  };
}

// Union type for all response types
export type ApiResult<T> = SuccessResult<T> | ErrorResult;

/**
 * Create a success response with proper headers
 */
export function createSuccessResponse<T>(
  data: T,
  metadata?: Record<string, any>,
  status = 200
): Response {
  const result: SuccessResult<T> = {
    success: true,
    data,
    ...(metadata && { metadata })
  };

  return new Response(
    JSON.stringify(result),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}

/**
 * Alias for createSuccessResponse for backward compatibility
 */
export function createResponse<T>(
  data: T,
  metadata?: Record<string, any>,
  status = 200
): Response {
  return createSuccessResponse(data, metadata, status);
}

/**
 * Create an error response with proper headers
 */
export function createErrorResponse(
  code: ErrorCode | string,
  message?: string | null,
  details?: any,
  status = 400
): Response {
  // Use default message if not provided
  const errorMessage = message || getDefaultErrorMessage(code);

  const result: ErrorResult = {
    success: false,
    error: {
      code,
      message: errorMessage,
      ...(details && { details })
    }
  };

  return new Response(
    JSON.stringify(result),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}

/**
 * Log an event with structured data
 */
export function logEvent(
  level: "info" | "warn" | "error",
  message: string,
  data?: Record<string, any>
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...data
  };

  // Use different console methods based on level
  switch (level) {
    case "warn":
      console.warn(JSON.stringify(logData));
      break;
    case "error":
      console.error(JSON.stringify(logData));
      break;
    default:
      console.log(JSON.stringify(logData));
  }
}

/**
 * Validate that all required parameters are present
 */
export function validateRequiredParameters(
  data: Record<string, any>,
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(param => !data[param]);
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

/**
 * Get a default error message for known error codes
 */
function getDefaultErrorMessage(code: ErrorCode | string): string {
  switch (code) {
    case ErrorCode.MISSING_PARAMETERS:
      return "Missing required parameters";
    case ErrorCode.INVALID_PARAMETERS:
      return "Invalid parameters provided";
    case ErrorCode.UNAUTHORIZED:
      return "Authentication required";
    case ErrorCode.FORBIDDEN:
      return "You don't have permission to access this resource";
    case ErrorCode.NOT_FOUND:
      return "The requested resource was not found";
    case ErrorCode.TIMEOUT:
      return "The request timed out";
    case ErrorCode.DATABASE_ERROR:
      return "Database error occurred";
    case ErrorCode.EXTERNAL_API_ERROR:
      return "Error communicating with external service";
    case ErrorCode.INTERNAL_ERROR:
      return "An internal server error occurred";
    default:
      return "An error occurred";
  }
}
