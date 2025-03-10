
/**
 * Error handler for edge functions
 */

import { 
  corsHeaders, 
  createErrorResponse, 
  ErrorCode 
} from "../../shared/responseUtils.ts";
import { ErrorHandlingOptions } from "../../shared/requestHandler.ts";

/**
 * Handle errors in edge functions
 * 
 * @param error The error to handle
 * @param options Error handling options
 * @returns Appropriate error response
 */
export function handleError(
  error: any,
  options: ErrorHandlingOptions = {}
): Response {
  // Extract error details
  const errorMessage = error.message || "An unexpected error occurred";
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let statusCode = 500;
  
  // Log the error if configured
  if (options.logToConsole !== false) {
    console.error("Edge function error:", error);
  }
  
  // Determine more specific error type if possible
  if (errorMessage.includes("OpenAI") || errorMessage.includes("API key")) {
    errorCode = ErrorCode.EXTERNAL_API_ERROR;
    statusCode = 502;
  } else if (errorMessage.includes("validation") || errorMessage.includes("parameter")) {
    errorCode = ErrorCode.VALIDATION_FAILED;
    statusCode = 400;
  } else if (errorMessage.includes("auth") || errorMessage.includes("token")) {
    errorCode = ErrorCode.AUTHENTICATION_REQUIRED;
    statusCode = 401;
  } else if (errorMessage.includes("permission") || errorMessage.includes("access")) {
    errorCode = ErrorCode.UNAUTHORIZED;
    statusCode = 403;
  } else if (errorMessage.includes("not found")) {
    errorCode = ErrorCode.NOT_FOUND;
    statusCode = 404;
  } else if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    errorCode = ErrorCode.TIMEOUT;
    statusCode = 408;
  } else if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
    errorCode = ErrorCode.RATE_LIMITED;
    statusCode = 429;
  }
  
  // Create standardized error response
  return createErrorResponse(
    errorCode,
    errorMessage,
    options.includeDetails ? error.stack : null,
    statusCode
  );
}
