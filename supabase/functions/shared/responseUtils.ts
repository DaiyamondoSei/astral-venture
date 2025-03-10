
/**
 * Shared response utilities for Edge Functions
 */

/**
 * CORS headers for all responses
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Error codes for API responses
 */
export enum ErrorCode {
  MISSING_PARAMETERS = 'missing_parameters',
  INVALID_REQUEST = 'invalid_request',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  VALIDATION_FAILED = 'validation_failed',
  RATE_LIMITED = 'rate_limited',
  QUOTA_EXCEEDED = 'quota_exceeded',
  EXTERNAL_API_ERROR = 'external_api_error',
  TIMEOUT = 'timeout',
  INTERNAL_ERROR = 'internal_error',
}

/**
 * Options for error handling
 */
export interface ErrorHandlingOptions {
  context?: string;
  metadata?: Record<string, unknown>;
  showToast?: boolean;
  customMessage?: string;
  logToConsole?: boolean;
  logToServer?: boolean;
  includeStack?: boolean;
  defaultStatus?: number;
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(
  data: Record<string, any>,
  metadata?: Record<string, any>,
  status = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...metadata && { metadata }
    }),
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
 * Create a standardized error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, any> | null,
  status = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        ...details && { details }
      }
    }),
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
 * Validate that required parameters are present
 */
export function validateRequiredParameters(
  params: Record<string, any>,
  required: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = required.filter(param => 
    params[param] === undefined || 
    params[param] === null || 
    (typeof params[param] === 'string' && params[param].trim() === '') ||
    (Array.isArray(params[param]) && params[param].length === 0)
  );
  
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

/**
 * Log an event for monitoring and debugging
 */
export function logEvent(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, any>
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  };
  
  // Always log to console for edge functions
  switch (level) {
    case 'debug':
      console.debug(message, data);
      break;
    case 'info':
      console.info(message, data);
      break;
    case 'warn':
      console.warn(message, data);
      break;
    case 'error':
      console.error(message, data);
      break;
  }
  
  // In a real-world scenario, we might:
  // 1. Send to logging service
  // 2. Store in database
  // 3. Send to monitoring system
}
