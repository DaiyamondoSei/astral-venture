
/**
 * Shared utilities for API responses in edge functions
 */

import { ApiResponse, ValidationError } from "./types.ts";

// Standard CORS headers
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Error codes mapping
export enum ErrorCode {
  UNAUTHORIZED = "unauthorized",
  AUTHENTICATION_ERROR = "authentication_error",
  INVALID_TOKEN = "invalid_token",
  
  VALIDATION_FAILED = "validation_failed",
  MISSING_PARAMETERS = "missing_parameters",
  INVALID_PARAMETERS = "invalid_parameters",
  
  INTERNAL_ERROR = "internal_error",
  EXTERNAL_API_ERROR = "external_api_error",
  TIMEOUT = "timeout",
  
  RATE_LIMITED = "rate_limited",
  QUOTA_EXCEEDED = "quota_exceeded",
  
  NETWORK_ERROR = "network_error",
  DATABASE_ERROR = "database_error",
  
  CONTENT_POLICY_VIOLATION = "content_policy_violation"
}

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
  code: ErrorCode,
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
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: error.code || ErrorCode.VALIDATION_FAILED,
      details: { field: error.field, details: error.details }
    };
  }
  
  if (error instanceof Error) {
    const anyError = error as any;
    if (anyError.status && anyError.statusText) {
      return {
        message: anyError.statusText || error.message,
        status: anyError.status,
        details: anyError.data
      };
    }
    
    return { message: error.message };
  }
  
  return { message: String(error) };
}
