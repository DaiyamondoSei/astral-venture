
import { createErrorResponse, ErrorCode } from "../../shared/responseUtils.ts";

interface ExtendedError extends Error {
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Standardized error handler for AI assistant requests
 * Categorizes errors and returns appropriate responses
 */
export function handleError(error: unknown): Response {
  console.error("Error in ask-assistant function:", error);
  
  const err = error as ExtendedError;
  
  // Determine error type with more precision
  const isQuotaError = err.message && (
    err.message.toLowerCase().includes("quota") || 
    err.message.toLowerCase().includes("rate limit") ||
    err.message.toLowerCase().includes("capacity") ||
    err.message.toLowerCase().includes("limit exceeded") ||
    (err.code === "429") ||
    (err.status === 429)
  );
  
  const isNetworkError = err.message && (
    err.message.toLowerCase().includes("network") ||
    err.message.toLowerCase().includes("connection") ||
    err.message.toLowerCase().includes("timeout") ||
    err.message.toLowerCase().includes("etimedout") ||
    err.message.toLowerCase().includes("econnrefused") ||
    err.message.toLowerCase().includes("fetch failed")
  );
  
  const isAuthError = err.message && (
    err.message.toLowerCase().includes("authentication") ||
    err.message.toLowerCase().includes("unauthorized") ||
    err.message.toLowerCase().includes("not allowed") ||
    err.message.toLowerCase().includes("permission") ||
    err.message.toLowerCase().includes("forbidden") ||
    (err.code === "401" || err.status === 401 || err.code === "403" || err.status === 403)
  );
  
  const isServiceError = err.message && (
    err.message.toLowerCase().includes("service") ||
    err.message.toLowerCase().includes("unavailable") ||
    err.message.toLowerCase().includes("503") ||
    err.message.toLowerCase().includes("502") ||
    (err.status === 503 || err.status === 502)
  );
  
  // Determine the appropriate error code with improved categorization
  let errorCode: ErrorCode;
  let errorMessage: string;
  
  if (isQuotaError) {
    errorCode = ErrorCode.QUOTA_EXCEEDED;
    errorMessage = "AI service quota exceeded, please try again later";
  } else if (isNetworkError) {
    errorCode = ErrorCode.SERVICE_UNAVAILABLE;
    errorMessage = "Unable to connect to AI service, please try again later";
  } else if (isAuthError) {
    errorCode = ErrorCode.UNAUTHORIZED;
    errorMessage = "Authentication failed or unauthorized access";
  } else if (isServiceError) {
    errorCode = ErrorCode.SERVICE_UNAVAILABLE;
    errorMessage = "AI service is currently unavailable, please try again later";
  } else {
    errorCode = ErrorCode.INTERNAL_ERROR;
    errorMessage = "Failed to process request";
  }
  
  // Include detailed error information for debugging
  return createErrorResponse(
    errorCode,
    errorMessage,
    { 
      errorMessage: err.message,
      errorCode: err.code,
      errorStatus: err.status,
      errorDetails: err.details,
      errorType: isQuotaError ? "quota" : 
                 isNetworkError ? "network" : 
                 isAuthError ? "auth" : 
                 isServiceError ? "service" : "unknown"
    }
  );
}
