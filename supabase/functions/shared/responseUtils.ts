
/**
 * Shared Edge Function Response Utilities
 * This file contains utilities for creating standardized responses from edge functions
 */

// Standardized CORS headers
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Standardized response interface
export interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

// Error codes
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_PARAMETERS = 'MISSING_PARAMETERS',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  VALIDATION_FAILED = 'VALIDATION_FAILED'
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsRequest(): Response {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Create a success response with standardized format
 */
export function createSuccessResponse<T>(
  data: T,
  metadata?: Record<string, any>
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      ...(metadata ? { metadata } : {})
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

/**
 * Create an error response with standardized format
 */
export function createErrorResponse(
  code: string | ErrorCode,
  message: string,
  details?: any,
  status: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {})
      },
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

/**
 * Validate that required parameters are present
 */
export function validateRequiredParameters<T extends Record<string, any>>(
  params: T,
  requiredParams: (keyof T)[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(param => params[param] === undefined);
  
  return {
    isValid: missingParams.length === 0,
    missingParams: missingParams as string[]
  };
}

/**
 * Structured logging helper
 */
export function logEvent(
  type: 'info' | 'error' | 'warn' | 'debug',
  message: string,
  data?: Record<string, any>
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    type,
    message,
    ...(data || {})
  };
  
  if (type === 'error') {
    console.error(JSON.stringify(logData));
  } else if (type === 'warn') {
    console.warn(JSON.stringify(logData));
  } else if (type === 'debug') {
    console.debug(JSON.stringify(logData));
  } else {
    console.info(JSON.stringify(logData));
  }
}
