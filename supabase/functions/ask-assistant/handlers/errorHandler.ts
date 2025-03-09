
import { createErrorResponse, ErrorCode } from "../../shared/responseUtils.ts";

interface ExtendedError extends Error {
  code?: string;
  status?: number;
  details?: unknown;
}

export function handleError(error: unknown): Response {
  console.error("Error in ask-assistant function:", error);
  
  const err = error as ExtendedError;
  
  // Determine error type with more precision
  const isQuotaError = err.message && (
    err.message.includes("quota") || 
    err.message.includes("rate limit") ||
    err.message.includes("capacity") ||
    (err.code === "429")
  );
  
  const isNetworkError = err.message && (
    err.message.includes("network") ||
    err.message.includes("connection") ||
    err.message.includes("timeout") ||
    err.message.includes("ETIMEDOUT") ||
    err.message.includes("ECONNREFUSED")
  );
  
  const isAuthError = err.message && (
    err.message.includes("authentication") ||
    err.message.includes("unauthorized") ||
    err.message.includes("not allowed") ||
    err.message.includes("permission") ||
    (err.code === "401" || err.status === 401 || err.code === "403" || err.status === 403)
  );
  
  // Determine the appropriate error code
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
  } else {
    errorCode = ErrorCode.INTERNAL_ERROR;
    errorMessage = "Failed to process request";
  }
  
  return createErrorResponse(
    errorCode,
    errorMessage,
    { 
      errorMessage: err.message,
      errorCode: err.code,
      errorStatus: err.status,
      errorDetails: err.details 
    }
  );
}
