
/**
 * Centralized error handler for AI assistant requests
 * Handles different error types and provides appropriate responses
 */

import { createErrorResponse, ErrorCode } from "../../shared/responseUtils.ts";
import { ValidationError } from "../../shared/types.ts";

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  /** Context where the error occurred */
  context?: string;
  /** Operation that was being performed */
  operation?: string;
  /** Whether the client should retry the request */
  shouldRetry?: boolean;
  /** Additional information to include in the error response */
  additionalInfo?: Record<string, unknown>;
  /** Whether to hide sensitive information from error responses */
  hideSensitiveInfo?: boolean;
}

/**
 * Error categories for better error handling
 */
export enum ErrorCategory {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  CONTENT_MODERATION = 'content_moderation',
  DATABASE = 'database',
  INTERNAL = 'internal',
  EXTERNAL_API = 'external_api',
  UNDEFINED = 'undefined'
}

/**
 * Categorize an error based on its message and type
 */
function categorizeError(error: unknown): ErrorCategory {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for network errors
  if (errorMessage.includes("fetch") || 
      errorMessage.includes("network") ||
      errorMessage.includes("connection")) {
    return ErrorCategory.NETWORK;
  }
  
  // Check for timeout errors
  if (errorMessage.includes("timeout") || 
      errorMessage.includes("timed out") ||
      errorMessage.includes("deadline")) {
    return ErrorCategory.TIMEOUT;
  }
  
  // Check for rate limit errors
  if (errorMessage.includes("rate") || 
      errorMessage.includes("limit") || 
      errorMessage.includes("quota") ||
      errorMessage.includes("capacity") ||
      errorMessage.includes("too many requests")) {
    return ErrorCategory.RATE_LIMIT;
  }
  
  // Check for authentication errors
  if (errorMessage.includes("auth") || 
      errorMessage.includes("key") || 
      errorMessage.includes("permission") ||
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("forbidden")) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  // Check for validation errors
  if (errorMessage.includes("validation") || 
      errorMessage.includes("invalid") || 
      errorMessage.includes("parameter") ||
      errorMessage.includes("required") ||
      error instanceof ValidationError) {
    return ErrorCategory.VALIDATION;
  }
  
  // Check for content moderation errors
  if (errorMessage.includes("moderation") || 
      errorMessage.includes("content policy") || 
      errorMessage.includes("inappropriate") ||
      errorMessage.includes("flagged")) {
    return ErrorCategory.CONTENT_MODERATION;
  }
  
  // Check for database errors
  if (errorMessage.includes("database") || 
      errorMessage.includes("query") || 
      errorMessage.includes("SQL") ||
      errorMessage.includes("constraint")) {
    return ErrorCategory.DATABASE;
  }
  
  // Check for external API errors
  if (errorMessage.includes("API") || 
      errorMessage.includes("OpenAI") || 
      errorMessage.includes("service")) {
    return ErrorCategory.EXTERNAL_API;
  }
  
  return ErrorCategory.INTERNAL;
}

/**
 * Sanitize error details to remove sensitive information
 */
function sanitizeErrorDetails(error: unknown, hideSensitiveInfo: boolean): Record<string, unknown> {
  if (!hideSensitiveInfo) {
    return error instanceof Error 
      ? { message: error.message, stack: error.stack } 
      : { message: String(error) };
  }
  
  // Sanitize sensitive information
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Hide API keys, tokens, and other sensitive data
  const sanitizedMessage = errorMessage
    .replace(/(?:api[-_]?key|token|key|secret)\s*[=:]\s*[^\s&]+/gi, '$1=REDACTED')
    .replace(/(?:Bearer|Basic)\s+[A-Za-z0-9_.~+/]+=*/g, '$1 REDACTED')
    .replace(/(?:password|pwd)\s*[=:]\s*[^\s&]+/gi, '$1=REDACTED');
    
  return { message: sanitizedMessage };
}

/**
 * Centralized error handler for AI assistant requests
 * Categorizes errors and provides appropriate responses
 * 
 * @param error - The error to handle
 * @param options - Error handling options
 * @returns Formatted error response
 */
export function handleError(error: unknown, options: ErrorHandlingOptions = {}): Response {
  const {
    context = 'AI assistant',
    operation = 'unknown_operation',
    shouldRetry = false,
    additionalInfo = {},
    hideSensitiveInfo = true
  } = options;
  
  console.error(`Error in ${context} (${operation}):`, error);
  
  // Categorize the error
  const errorCategory = categorizeError(error);
  
  // Sanitize error details
  const errorDetails = sanitizeErrorDetails(error, hideSensitiveInfo);
  
  // Create metadata for tracking and debugging
  const metadata = {
    errorCategory,
    errorDetails: hideSensitiveInfo ? undefined : errorDetails,
    timestamp: new Date().toISOString(),
    context,
    operation,
    shouldRetry,
    ...additionalInfo
  };
  
  // Map error category to appropriate error code and message
  switch (errorCategory) {
    case ErrorCategory.NETWORK:
      return createErrorResponse(
        ErrorCode.NETWORK_ERROR,
        "Unable to reach AI service due to network issues",
        metadata
      );
    
    case ErrorCategory.TIMEOUT:
      return createErrorResponse(
        ErrorCode.TIMEOUT,
        "Request to AI service timed out",
        { ...metadata, shouldRetry: true }
      );
    
    case ErrorCategory.RATE_LIMIT:
      return createErrorResponse(
        ErrorCode.RATE_LIMITED,
        "AI service temporarily unavailable due to high demand",
        { ...metadata, shouldRetry: true, retryAfter: '30 seconds' }
      );
    
    case ErrorCategory.AUTHENTICATION:
      return createErrorResponse(
        ErrorCode.AUTHENTICATION_ERROR,
        "Unable to authenticate with AI service",
        metadata
      );
    
    case ErrorCategory.VALIDATION:
      return createErrorResponse(
        ErrorCode.VALIDATION_FAILED,
        "Invalid input parameters for AI request",
        metadata
      );
    
    case ErrorCategory.CONTENT_MODERATION:
      return createErrorResponse(
        ErrorCode.CONTENT_POLICY_VIOLATION,
        "Your request contains content that violates our content policy",
        metadata
      );
    
    case ErrorCategory.DATABASE:
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Error accessing database resources",
        metadata
      );
      
    case ErrorCategory.EXTERNAL_API:
      return createErrorResponse(
        ErrorCode.EXTERNAL_API_ERROR,
        "Error communicating with external AI service",
        { ...metadata, shouldRetry: true }
      );
    
    default:
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        "An error occurred while processing your request",
        metadata
      );
  }
}

export default handleError;
