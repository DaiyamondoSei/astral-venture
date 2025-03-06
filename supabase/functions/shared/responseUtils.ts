
// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Error codes for standardized API responses
export enum ErrorCode {
  MISSING_PARAMETERS = "missing_parameters",
  VALIDATION_FAILED = "validation_failed",
  UNAUTHORIZED = "unauthorized",
  QUOTA_EXCEEDED = "quota_exceeded",
  INTERNAL_ERROR = "internal_error",
  NOT_FOUND = "not_found",
  RATE_LIMITED = "rate_limited"
}

// Validate required parameters in request
export function validateRequiredParameters(
  params: Record<string, any>,
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(param => {
    return params[param] === undefined || params[param] === null || params[param] === '';
  });

  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

// Handle CORS preflight requests
export function handleCorsRequest(): Response {
  return new Response(null, { headers: corsHeaders });
}

// Create a standardized success response
export function createSuccessResponse(
  data: Record<string, any>,
  meta?: Record<string, any>
): Response {
  return new Response(
    JSON.stringify({
      status: "success",
      data,
      meta: meta || {}
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

// Create a standardized error response
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, any>
): Response {
  return new Response(
    JSON.stringify({
      status: "error",
      error: {
        code,
        message,
        details: details || {}
      }
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: getStatusCodeForError(code)
    }
  );
}

// Map error codes to HTTP status codes
function getStatusCodeForError(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.MISSING_PARAMETERS:
    case ErrorCode.VALIDATION_FAILED:
      return 400;
    case ErrorCode.UNAUTHORIZED:
      return 401;
    case ErrorCode.NOT_FOUND:
      return 404;
    case ErrorCode.QUOTA_EXCEEDED:
      return 402;
    case ErrorCode.RATE_LIMITED:
      return 429;
    case ErrorCode.INTERNAL_ERROR:
    default:
      return 500;
  }
}
