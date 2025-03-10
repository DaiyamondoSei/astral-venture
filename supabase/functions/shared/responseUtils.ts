
/**
 * Edge Function Response Utilities
 * 
 * This module provides utilities for creating standardized responses
 * from Supabase Edge Functions.
 */

// Standard CORS headers for all edge functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Standardized error codes
export enum ErrorCode {
  INTERNAL_ERROR = "internal_error",
  UNAUTHORIZED = "unauthorized",
  MISSING_PARAMETERS = "missing_parameters",
  INVALID_PARAMETERS = "invalid_parameters",
  EXTERNAL_API_ERROR = "external_api_error",
  RESOURCE_NOT_FOUND = "resource_not_found",
  RATE_LIMITED = "rate_limited",
  SERVICE_UNAVAILABLE = "service_unavailable",
  QUOTA_EXCEEDED = "quota_exceeded",
  DATABASE_ERROR = "database_error",
  TIMEOUT = "timeout",
  VALIDATION_FAILED = "validation_failed"
}

/**
 * Interface for response metadata
 */
interface ResponseMetadata {
  processingTime?: number;
  version?: string;
  cacheTTL?: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
  operation?: string;
  tokenUsage?: number;
  model?: string;
  [key: string]: any;
}

/**
 * Create a successful response with consistent formatting
 */
export function createSuccessResponse(
  data: any, 
  metadata: ResponseMetadata | number = {},
  statusCode: number = 200
) {
  // Handle legacy function signature where second param was status code
  if (typeof metadata === 'number') {
    statusCode = metadata;
    metadata = {};
  }

  return new Response(
    JSON.stringify({
      success: true,
      data,
      meta: metadata
    }),
    {
      status: statusCode,
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
export const createResponse = createSuccessResponse;

/**
 * Create an error response with consistent formatting
 */
export function createErrorResponse(
  code: string | ErrorCode,
  message: string,
  details: any = null,
  statusCode: number = 400
) {
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
      status: statusCode,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}

/**
 * Create a response for CORS preflight requests
 */
export function createPreflightResponse() {
  return new Response(null, {
    headers: {
      ...corsHeaders
    }
  });
}

/**
 * Alias for createPreflightResponse for backward compatibility
 */
export const handleCorsRequest = createPreflightResponse;

/**
 * Log events in a structured format
 */
export function logEvent(
  level: "debug" | "info" | "warn" | "error",
  message: string,
  data: any = {}
) {
  console.log(JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data
  }));
}

/**
 * Validate required parameters in a request
 */
export function validateRequiredParams(
  params: any, 
  requiredParams: string[]
): string[] {
  const missingParams: string[] = [];
  
  for (const param of requiredParams) {
    if (params[param] === undefined || params[param] === null || params[param] === "") {
      missingParams.push(param);
    }
  }
  
  return missingParams;
}

/**
 * Validate required parameters and return validation result
 */
export function validateRequiredParameters(
  params: any,
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = validateRequiredParams(params, requiredParams);
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

/**
 * Create a streaming response (for chat completions)
 */
export function createStreamingResponse(
  stream: ReadableStream<Uint8Array>,
  additionalHeaders: Record<string, string> = {}
) {
  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      ...additionalHeaders
    }
  });
}

/**
 * Error handling options for edge functions
 */
export interface ErrorHandlingOptions {
  /**
   * Whether to include stack trace in the response
   */
  includeStack?: boolean;
  
  /**
   * Custom error message to return instead of the original
   */
  customMessage?: string;
  
  /**
   * Default HTTP status code to use
   */
  defaultStatus?: number;
  
  /**
   * Additional context to include in error logs
   */
  context?: Record<string, unknown>;
}
