
/**
 * Error handler for the ask-assistant edge function
 */
import { 
  corsHeaders,
  createErrorResponse,
  ErrorCode,
  logEvent,
  ErrorHandlingOptions
} from "../../shared/responseUtils.ts";

/**
 * Format OpenAI API errors into a standardized response
 * 
 * @param error The error object from OpenAI
 * @returns Formatted error response
 */
export function handleOpenAIError(error: any, options: ErrorHandlingOptions = {}): Response {
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
      errorCode = ErrorCode.QUOTA_EXCEEDED;
      statusCode = 402; // Payment Required
    } else if (errorMessage.includes("rate limit")) {
      errorCode = ErrorCode.RATE_LIMITED;
      statusCode = 429; // Too Many Requests
    } else if (errorMessage.includes("invalid_api_key") || errorMessage.includes("authentication")) {
      errorCode = ErrorCode.UNAUTHORIZED;
      statusCode = 401; // Unauthorized
    }
    
    // Include stack trace if enabled and in development
    const includeStack = options.includeStack && (Deno.env.get("ENVIRONMENT") !== "production");
    if (includeStack && error.stack) {
      errorDetails.stack = error.stack;
    }
    
    // Use custom message if provided
    const message = options.customMessage || "Error communicating with AI service";
    
    // Log the error
    logEvent("error", "OpenAI API error", {
      code: errorCode,
      message: errorMessage,
      details: errorDetails
    });
    
    // Create standardized error response
    return createErrorResponse(
      errorCode,
      message,
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
 * @param options Error handling options
 * @returns Error response
 */
export function handleUnexpectedError(error: any, options: ErrorHandlingOptions = {}): Response {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const includeStack = options.includeStack && (Deno.env.get("ENVIRONMENT") !== "production");
  
  // Determine status code
  const statusCode = options.defaultStatus || 500;
  
  // Log the unexpected error
  logEvent("error", "Unexpected error", {
    error: errorMessage,
    stack: includeStack && error instanceof Error ? error.stack : undefined,
    context: options.context
  });
  
  // Include appropriate details
  const details: Record<string, unknown> = { 
    errorType: error.constructor?.name || typeof error
  };
  
  if (includeStack && error instanceof Error && error.stack) {
    details.stack = error.stack;
  }
  
  if (options.context) {
    details.context = options.context;
  }
  
  // Create generic error response
  return createErrorResponse(
    ErrorCode.INTERNAL_ERROR,
    options.customMessage || "An unexpected error occurred",
    details,
    statusCode
  );
}

/**
 * Main error handler function for edge functions
 */
export function handleError(error: any, options: ErrorHandlingOptions = {}): Response {
  // Check for specific error types
  if (error.name === 'OpenAIError' || error.message?.includes('OpenAI')) {
    return handleOpenAIError(error, options);
  }
  
  if (error.message?.includes('validation') || error.name === 'ValidationError') {
    return createErrorResponse(
      ErrorCode.VALIDATION_FAILED,
      options.customMessage || error.message,
      error.details || { error: String(error) },
      400
    );
  }
  
  if (error.message?.includes('auth') || error.status === 401 || error.statusCode === 401) {
    return handleAuthError(options.customMessage);
  }
  
  if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
    return createErrorResponse(
      ErrorCode.TIMEOUT,
      options.customMessage || "Request timed out",
      { error: error.message },
      408 // Request Timeout
    );
  }
  
  // Default to unexpected error handling
  return handleUnexpectedError(error, options);
}
