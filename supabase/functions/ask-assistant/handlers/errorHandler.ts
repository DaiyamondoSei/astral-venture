
import { createErrorResponse, ErrorCode } from "../../shared/responseUtils.ts";

/**
 * Centralized error handler for AI assistant requests
 * Categorizes errors and provides appropriate responses
 */
export function handleError(error: any): Response {
  console.error("Error in AI assistant:", error);
  
  // Determine error type for better client handling
  const errorMessage = error?.message || "An unknown error occurred";
  const errorStack = error?.stack || "";
  
  // Check for network errors
  if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
    return createErrorResponse(
      ErrorCode.NETWORK_ERROR,
      "Unable to reach AI service due to network issues",
      { originalError: errorMessage }
    );
  }
  
  // Check for timeout errors
  if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    return createErrorResponse(
      ErrorCode.TIMEOUT,
      "Request to AI service timed out",
      { originalError: errorMessage }
    );
  }
  
  // Check for quota/rate limit errors
  if (
    errorMessage.includes("rate") || 
    errorMessage.includes("limit") || 
    errorMessage.includes("quota") ||
    errorMessage.includes("capacity")
  ) {
    return createErrorResponse(
      ErrorCode.RATE_LIMITED,
      "AI service temporarily unavailable due to high demand",
      { originalError: errorMessage }
    );
  }
  
  // Check for authentication errors
  if (
    errorMessage.includes("auth") || 
    errorMessage.includes("key") || 
    errorMessage.includes("permission") ||
    errorMessage.includes("unauthorized")
  ) {
    return createErrorResponse(
      ErrorCode.AUTHENTICATION_ERROR,
      "Unable to authenticate with AI service",
      { originalError: errorMessage }
    );
  }
  
  // Check for invalid inputs
  if (errorMessage.includes("invalid") || errorMessage.includes("parameter")) {
    return createErrorResponse(
      ErrorCode.VALIDATION_FAILED,
      "Invalid input parameters for AI request",
      { originalError: errorMessage }
    );
  }
  
  // Default to general error
  return createErrorResponse(
    ErrorCode.INTERNAL_ERROR,
    "An error occurred while processing your request",
    { originalError: errorMessage, timestamp: new Date().toISOString() }
  );
}
