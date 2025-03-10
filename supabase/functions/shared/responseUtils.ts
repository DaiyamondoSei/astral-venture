
/**
 * Shared utilities for API responses in edge functions
 */

import { ApiResponse, ValidationError } from "./types.ts";

// Standard CORS headers
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Error codes for standardized error handling
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = "unauthorized",
  AUTHENTICATION_ERROR = "authentication_error",
  INVALID_TOKEN = "invalid_token",
  
  // Validation errors
  VALIDATION_FAILED = "validation_failed",
  MISSING_PARAMETERS = "missing_parameters",
  INVALID_PARAMETERS = "invalid_parameters",
  
  // Processing errors
  INTERNAL_ERROR = "internal_error",
  EXTERNAL_API_ERROR = "external_api_error",
  TIMEOUT = "timeout",
  
  // Rate limiting
  RATE_LIMITED = "rate_limited",
  QUOTA_EXCEEDED = "quota_exceeded",
  
  // Network errors
  NETWORK_ERROR = "network_error",
  
  // Database errors
  DATABASE_ERROR = "database_error",
  
  // Content errors
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
 * Validate required parameters in a request
 */
export function validateRequiredParameters<T extends Record<string, any>>(
  params: T,
  requiredParams: Array<keyof T>
): { isValid: boolean; missingParams: string[] } {
  const missingParams: string[] = [];
  
  for (const param of requiredParams) {
    if (params[param] === undefined || params[param] === null || params[param] === '') {
      missingParams.push(String(param));
    }
  }
  
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

/**
 * Validate parameter types
 */
export function validateParameterTypes<T extends Record<string, any>>(
  params: T,
  typeValidations: Record<keyof T, (value: any) => boolean>
): { isValid: boolean; invalidParams: { param: string; expected: string; received: string }[] } {
  const invalidParams: { param: string; expected: string; received: string }[] = [];
  
  for (const [param, validator] of Object.entries(typeValidations) as [keyof T, (value: any) => boolean][]) {
    if (params[param] !== undefined && !validator(params[param])) {
      invalidParams.push({
        param: String(param),
        expected: getFunctionExpectedType(validator),
        received: typeof params[param]
      });
    }
  }
  
  return {
    isValid: invalidParams.length === 0,
    invalidParams
  };
}

/**
 * Get the expected type from a validator function
 */
function getFunctionExpectedType(validator: Function): string {
  const fnStr = validator.toString();
  if (fnStr.includes('typeof') && fnStr.includes('===')) {
    const match = fnStr.match(/typeof .+ === ['"](.+)['"]/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return "unknown";
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
    if (error instanceof ValidationError) {
      return {
        message: error.message,
        code: error.code || ErrorCode.VALIDATION_FAILED,
        details: { field: error.field, details: error.details }
      };
    }
    
    // Check for fetch/response errors
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
  
  // Handle unknown error types
  return { message: String(error) };
}
