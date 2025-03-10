
/**
 * Centralized error handler for AI assistant requests
 * Handles different error types and provides appropriate responses
 */

import { createErrorResponse, ErrorCode } from "../../shared/responseUtils.ts";

/**
 * Error handling options
 */
export interface IErrorHandlingOptions {
  /** Context where the error occurred */
  context?: string;
  /** Operation that was being performed */
  operation?: string;
  /** Whether the client should retry the request */
  shouldRetry?: boolean;
  /** Additional information to include in the error response */
  additionalInfo?: Record<string, unknown>;
}

/**
 * Centralized error handler for AI assistant requests
 * Categorizes errors and provides appropriate responses
 * 
 * @param error - The error to handle
 * @param options - Error handling options
 * @returns Formatted error response
 */
export function handleError(error: unknown, options: IErrorHandlingOptions = {}): Response {
  console.error(`Error in ${options.context || 'AI assistant'}:`, error);
  
  // Extract error information
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errorContext = options.context || "general";
  const errorOperation = options.operation || "unknown_operation";
  
  // Create metadata for tracking and debugging
  const metadata = {
    originalError: errorMessage,
    timestamp: new Date().toISOString(),
    context: errorContext,
    operation: errorOperation,
    ...(options.additionalInfo || {}),
  };
  
  // Check for network errors
  if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
    return createErrorResponse(
      ErrorCode.NETWORK_ERROR,
      "Unable to reach AI service due to network issues",
      metadata
    );
  }
  
  // Check for timeout errors
  if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    return createErrorResponse(
      ErrorCode.TIMEOUT,
      "Request to AI service timed out",
      metadata
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
      metadata
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
      metadata
    );
  }
  
  // Check for invalid inputs
  if (errorMessage.includes("invalid") || errorMessage.includes("parameter")) {
    return createErrorResponse(
      ErrorCode.VALIDATION_FAILED,
      "Invalid input parameters for AI request",
      metadata
    );
  }
  
  // Default to general error
  return createErrorResponse(
    ErrorCode.INTERNAL_ERROR,
    "An error occurred while processing your request",
    metadata
  );
}

export default handleError;
