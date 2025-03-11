
/**
 * Shared response utilities for Edge Functions
 */

// CORS headers for cross-origin requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a preflight response for OPTIONS requests
export function createPreflightResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}

// Error codes for consistent error handling
export enum ErrorCode {
  MISSING_PARAMETERS = 'MISSING_PARAMETERS',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMITED = 'RATE_LIMITED',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED'
}

// Error handling options
export interface ErrorHandlingOptions {
  includeStack?: boolean;
  customMessage?: string;
  defaultStatus?: number;
  context?: string;
}

// Validate required parameters in a request
export function validateRequiredParameters(
  params: Record<string, any>,
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(param => {
    const value = params[param];
    return value === undefined || value === null || value === '';
  });
  
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

// Create a success response with standardized format
export function createSuccessResponse(
  data: any,
  metadata: Record<string, any> = {}
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      metadata,
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

// Create an error response with standardized format
export function createErrorResponse(
  code: ErrorCode | string,
  message: string,
  details: Record<string, any> | null = null,
  status: number = 500
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        details
      },
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

// Create a standard response
export function createResponse(
  data: any,
  status: number = 200
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

// Log an event with structured data
export function logEvent(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data: Record<string, any> = {}
): void {
  const logFunction = level === 'error' 
    ? console.error 
    : level === 'warn' 
      ? console.warn 
      : level === 'debug' 
        ? console.debug 
        : console.info;
  
  logFunction({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  });
}
