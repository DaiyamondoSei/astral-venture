
/**
 * Error handler for the ask-assistant edge function
 */
import { 
  corsHeaders,
  createErrorResponse,
  ErrorCode,
  logEvent
} from "../../shared/responseUtils.ts";

/**
 * Format OpenAI API errors into a standardized response
 * 
 * @param error The error object from OpenAI
 * @returns Formatted error response
 */
export function handleOpenAIError(error: any): Response {
  // Extract error details
  const errorMessage = error.message || "Unknown OpenAI API error";
  let errorCode = ErrorCode.EXTERNAL_API_ERROR;
  let statusCode = 500;
  let errorDetails: any = {};
  
  try {
    // Try to parse structured error data from the message
    if (typeof error.message === 'string' && error.message.includes('{')) {
      const match = error.message.match(/\{.*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.error) {
          errorDetails = parsed.error;
        }
      }
    }
    
    // For errors with more detailed structure
    if (error.status || error.statusCode) {
      statusCode = error.status || error.statusCode;
    }
    
    // Check for specific error types
    if (errorMessage.includes("exceeded your current quota")) {
      errorCode = "quota_exceeded";
      statusCode = 402; // Payment Required
    } else if (errorMessage.includes("rate limit")) {
      errorCode = "rate_limited";
      statusCode = 429; // Too Many Requests
    } else if (errorMessage.includes("invalid_api_key") || errorMessage.includes("authentication")) {
      errorCode = "invalid_api_key";
      statusCode = 401; // Unauthorized
    }
    
    // Log the error
    logEvent("error", "OpenAI API error", {
      code: errorCode,
      message: errorMessage,
      details: errorDetails
    });
    
    // Create standardized error response
    return createErrorResponse(
      errorCode,
      "Error communicating with AI service",
      {
        originalError: errorMessage,
        ...errorDetails
      },
      statusCode
    );
  } catch (e) {
    // Fallback for error handling errors
    logEvent("error", "Error handling OpenAI error", {
      error: e instanceof Error ? e.message : String(e),
      originalError: errorMessage
    });
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Error processing AI service error",
      {
        originalError: errorMessage
      },
      500
    );
  }
}

/**
 * Handle validation errors when checking request parameters
 * 
 * @param missingParams List of missing required parameters
 * @returns Error response
 */
export function handleValidationError(missingParams: string[]): Response {
  // Create error message with missing parameters
  const errorMessage = missingParams.length === 1
    ? `Missing required parameter: ${missingParams[0]}`
    : `Missing required parameters: ${missingParams.join(', ')}`;
  
  // Log the validation error
  logEvent("warn", "Validation error", { missingParams });
  
  // Create standard error response
  return createErrorResponse(
    ErrorCode.MISSING_PARAMETERS,
    errorMessage,
    { missingParams },
    400
  );
}

/**
 * Handle authentication errors
 * 
 * @param message Optional custom error message
 * @returns Error response
 */
export function handleAuthError(message?: string): Response {
  const errorMessage = message || "Authentication required";
  
  // Log authentication error
  logEvent("warn", "Authentication error", { message: errorMessage });
  
  // Create authentication error response
  return createErrorResponse(
    ErrorCode.UNAUTHORIZED,
    errorMessage,
    null,
    401
  );
}

/**
 * Handle unexpected errors
 * 
 * @param error The error object
 * @returns Error response
 */
export function handleUnexpectedError(error: any): Response {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Log the unexpected error
  logEvent("error", "Unexpected error", {
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined
  });
  
  // Create generic error response
  return createErrorResponse(
    ErrorCode.INTERNAL_ERROR,
    "An unexpected error occurred",
    { details: errorMessage },
    500
  );
}
