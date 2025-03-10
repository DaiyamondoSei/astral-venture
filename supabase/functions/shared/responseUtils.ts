
// CORS headers for browser compatibility
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handle CORS preflight requests
 * This should be called at the beginning of each Edge Function
 */
export function handleCorsRequest(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Create a standard JSON response with the specified data and status code
 * @param data The data to include in the response
 * @param status HTTP status code (defaults to 200)
 */
export function createResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

/**
 * Create a standardized error response
 * @param code Error code from ErrorCode enum
 * @param message Human-readable error message
 * @param details Additional error details (optional)
 * @param status HTTP status code (defaults to 500)
 */
export function createErrorResponse(
  code: ErrorCode | string, 
  message: string, 
  details?: any, 
  status: number = 500
): Response {
  return new Response(
    JSON.stringify({ 
      error: {
        code,
        message,
        details: details || null 
      },
      success: false,
      timestamp: new Date().toISOString()
    }),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

/**
 * Create a standardized success response
 * @param data The main response data
 * @param metadata Additional metadata (optional)
 */
export function createSuccessResponse(data: any, metadata?: any): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      metadata: metadata || null,
      timestamp: new Date().toISOString()
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

/**
 * Validate required parameters in a request
 * @param params Object containing parameters
 * @param required Array of required parameter names
 */
export function validateRequiredParameters(
  params: Record<string, any>,
  required: string[]
): {
  isValid: boolean;
  missingParams: string[];
} {
  const missingParams = required.filter(param => params[param] === undefined || params[param] === null);
  
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

/**
 * Validate parameter types against expected types
 * @param params Object containing parameters
 * @param typeMap Map of parameter names to expected types
 */
export function validateParameterTypes(
  params: Record<string, any>,
  typeMap: Record<string, string>
): {
  isValid: boolean;
  invalidParams: Array<{param: string, expectedType: string, actualType: string}>;
} {
  const invalidParams = [];
  
  for (const [param, expectedType] of Object.entries(typeMap)) {
    if (params[param] !== undefined && params[param] !== null) {
      const actualType = Array.isArray(params[param]) ? 'array' : typeof params[param];
      if (actualType !== expectedType) {
        invalidParams.push({
          param,
          expectedType,
          actualType
        });
      }
    }
  }
  
  return {
    isValid: invalidParams.length === 0,
    invalidParams
  };
}

/**
 * Create a standardized validation error response
 * @param validationErrors Validation error details
 * @param message Custom error message
 */
export function createValidationErrorResponse(
  validationErrors: any, 
  message: string = "Validation failed"
): Response {
  return createErrorResponse(
    ErrorCode.VALIDATION_FAILED,
    message,
    { validationErrors },
    400
  );
}

/**
 * Safely parse JSON from a string, with error handling
 * @param jsonString String to parse as JSON
 * @param defaultValue Default value to return if parsing fails
 */
export function safeParseJson(jsonString: string, defaultValue: any = null): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON parse error:", error);
    return defaultValue;
  }
}

/**
 * Standard error codes for consistent error handling across functions
 */
export enum ErrorCode {
  MISSING_PARAMETERS = "MISSING_PARAMETERS",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMITED = "RATE_LIMITED",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  INVALID_REQUEST = "INVALID_REQUEST"
}
