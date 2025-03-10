
/**
 * Shared utilities for API responses in edge functions
 */

import { ApiResponse, ErrorDetails, ErrorCode } from "./types.ts";

// Standard CORS headers
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  metadata?: Record<string, unknown>
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    metadata
  };
  
  return new Response(
    JSON.stringify(response),
    { 
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      } 
    }
  );
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown,
  status: number = 400
): Response {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
  
  return new Response(
    JSON.stringify(response),
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
 * Handle CORS preflight requests
 */
export function handleCorsRequest(): Response {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Log events with structured information
 */
export function logEvent(
  level: "info" | "warn" | "error",
  message: string,
  data?: Record<string, unknown>
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  };
  
  if (level === "error") {
    console.error(JSON.stringify(logData));
  } else if (level === "warn") {
    console.warn(JSON.stringify(logData));
  } else {
    console.log(JSON.stringify(logData));
  }
}

/**
 * Parse an API error into a standardized format
 */
export function parseApiError(error: unknown): {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
} {
  if (error instanceof Error) {
    const anyError = error as any;
    if (anyError.status && anyError.statusText) {
      return {
        message: anyError.statusText || error.message,
        status: anyError.status,
        details: anyError.data
      };
    }
    
    // Check for specific error types
    if (anyError.code) {
      return {
        message: error.message,
        code: anyError.code,
        details: anyError.details
      };
    }
    
    return { message: error.message };
  }
  
  return { message: String(error) };
}

/**
 * Build a standard API error object
 */
export function buildErrorDetails(
  code: ErrorCode, 
  message: string, 
  details?: unknown
): ErrorDetails {
  return {
    code,
    message,
    details
  };
}

/**
 * Create JSON response with proper headers
 */
export function createJsonResponse(
  data: unknown,
  status: number = 200
): Response {
  return new Response(
    JSON.stringify(data),
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
 * Create a streaming response
 */
export function createStreamingResponse(
  stream: ReadableStream,
  contentType: string = "text/event-stream"
): Response {
  return new Response(
    stream,
    { 
      headers: { 
        ...corsHeaders, 
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      } 
    }
  );
}

export {
  createSuccessResponse,
  createErrorResponse,
  handleCorsRequest,
  logEvent,
  parseApiError,
  buildErrorDetails,
  createJsonResponse,
  createStreamingResponse,
  corsHeaders,
  ErrorCode
};
