
/**
 * Shared response utilities for edge functions
 */

// CORS headers for all responses
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Error codes for standardized error responses
export enum ErrorCode {
  MISSING_PARAMETERS = "MISSING_PARAMETERS",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED",
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMITED = "RATE_LIMITED",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  TIMEOUT = "TIMEOUT",
  INTERNAL_ERROR = "INTERNAL_ERROR"
}

/**
 * Handle CORS preflight request
 */
export function handleCorsRequest(): Response {
  return new Response(null, { 
    headers: corsHeaders
  });
}

/**
 * Create a standardized successful response
 * 
 * @param data Response data
 * @param metadata Optional metadata
 * @param status HTTP status code
 * @returns Formatted Response object
 */
export function createSuccessResponse(
  data: any, 
  metadata: Record<string, any> = {},
  status: number = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      metadata,
      timestamp: new Date().toISOString()
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
 * 
 * @param code Error code
 * @param message Error message
 * @param details Optional error details
 * @param status HTTP status code
 * @returns Formatted Response object
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details: any = null,
  status: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString()
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
 * Validate required parameters in a request
 * 
 * @param params Object containing parameters
 * @param requiredParams Array of required parameter names
 * @returns Validation result
 */
export function validateRequiredParameters(
  params: Record<string, any>,
  requiredParams: string[]
): { 
  isValid: boolean;
  missingParams: string[];
} {
  const missingParams: string[] = [];
  
  for (const param of requiredParams) {
    if (params[param] === undefined || params[param] === null || params[param] === '') {
      missingParams.push(param);
    }
  }
  
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

/**
 * Log an event for debugging and monitoring
 * 
 * @param level Log level
 * @param message Event message
 * @param data Additional data
 */
export function logEvent(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data: Record<string, any> = {}
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  };
  
  switch (level) {
    case 'debug':
      console.debug(message, logData);
      break;
    case 'info':
      console.info(message, logData);
      break;
    case 'warn':
      console.warn(message, logData);
      break;
    case 'error':
      console.error(message, logData);
      break;
  }
}
