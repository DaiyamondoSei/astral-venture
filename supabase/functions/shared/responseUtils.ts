
// CORS headers for browser compatibility
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
export function handleCorsRequest(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Create a standard response format
export function createResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

// Create an error response
export function createErrorResponse(message: string, details?: any, status: number = 500): Response {
  return new Response(
    JSON.stringify({ 
      error: message, 
      details: details || null 
    }),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

// Error codes for consistent error handling
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
  INTERNAL_ERROR = "INTERNAL_ERROR"
}

// Create a standardized success response
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

// Validate required parameters in a request
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
