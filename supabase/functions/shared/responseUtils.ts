
/**
 * Shared utilities for standardized response handling across edge functions
 */

// Standard CORS headers for all edge functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Error codes for consistent error reporting
export enum ErrorCode {
  VALIDATION_FAILED = "validation_failed",
  AUTHENTICATION_REQUIRED = "authentication_required",
  UNAUTHORIZED = "unauthorized",
  NOT_FOUND = "not_found",
  RATE_LIMITED = "rate_limited",
  EXTERNAL_API_ERROR = "external_api_error",
  DATABASE_ERROR = "database_error",
  INTERNAL_ERROR = "internal_error",
  MISSING_PARAMETERS = "missing_parameters",
  TIMEOUT = "timeout"
}

// Create a standardized success response
export function createSuccessResponse(
  data: any,
  metadata: Record<string, any> = {}
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...metadata
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    }
  );
}

// Create a standardized error response
export function createErrorResponse(
  code: ErrorCode | string,
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
        timestamp: new Date().toISOString()
      }
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status
    }
  );
}

// Validate required parameters
export function validateRequiredParameters(
  params: Record<string, any>,
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(
    param => params[param] === undefined || params[param] === null || params[param] === ""
  );
  
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

// Log events for monitoring and debugging
export function logEvent(
  level: "info" | "warn" | "error" | "debug",
  message: string,
  metadata: Record<string, any> = {}
): void {
  console[level](`[${level.toUpperCase()}] ${message}`, metadata);
}

// Basic request handler interface shared across functions
export interface RequestHandler {
  (user: any, req: Request, options?: any): Promise<Response>;
}

// Error handling options for request handlers
export interface ErrorHandlingOptions {
  logToConsole?: boolean;
  logToServer?: boolean;
  includeDetails?: boolean;
  defaultErrorMessage?: string;
}
