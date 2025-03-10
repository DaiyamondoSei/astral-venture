
import { createErrorResponse, ErrorCode } from "./responseUtils.ts";

/**
 * CORS headers for Edge Functions
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

/**
 * Function types for request handlers
 */
export type RequestHandler = (req: Request, ctx: Record<string, any>) => Promise<Response>;
export type AuthenticatedRequestHandler = (user: any, req: Request, ctx: Record<string, any>) => Promise<Response>;

/**
 * Create a standard error handler with improved type safety
 */
export function handleRequestError(error: unknown): Response {
  console.error("Function error:", error);
  
  // Determine error code and message
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let errorMessage = "An unexpected error occurred";
  let status = 500;
  
  if (error instanceof Error) {
    errorMessage = error.message;
    
    // Check for common error patterns
    if (errorMessage.includes("not found") || errorMessage.includes("does not exist")) {
      errorCode = ErrorCode.NOT_FOUND;
      status = 404;
    } else if (errorMessage.includes("permission") || errorMessage.includes("unauthorized")) {
      errorCode = ErrorCode.UNAUTHORIZED;
      status = 401;
    } else if (errorMessage.includes("invalid") || errorMessage.includes("validation")) {
      errorCode = ErrorCode.VALIDATION_FAILED;
      status = 400;
    }
  }
  
  return createErrorResponse(
    errorCode,
    errorMessage,
    { timestamp: new Date().toISOString() },
    status,
    corsHeaders
  );
}

/**
 * Create middleware for handling CORS
 * Improved with better type safety
 */
export function withCors(handler: RequestHandler): RequestHandler {
  return async (req: Request, ctx: Record<string, any>) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    
    // Call the handler
    const response = await handler(req, ctx);
    
    // Add CORS headers to the response
    const responseHeaders = new Headers(response.headers);
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    
    // Return response with CORS headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  };
}

/**
 * Create middleware for error handling with enhanced type safety
 */
export function withErrorHandling(handler: RequestHandler): RequestHandler {
  return async (req: Request, ctx: Record<string, any>) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return handleRequestError(error);
    }
  };
}

/**
 * Create middleware for authentication with improved error messages
 */
export function withAuth(handler: AuthenticatedRequestHandler): RequestHandler {
  return async (req: Request, ctx: Record<string, any>) => {
    try {
      // Check for authorization header
      const authHeader = req.headers.get("authorization");
      
      if (!authHeader) {
        return createErrorResponse(
          ErrorCode.UNAUTHORIZED,
          "Missing authorization header",
          null,
          401,
          corsHeaders
        );
      }
      
      // Parse JWT and get user
      const token = authHeader.replace("Bearer ", "");
      
      // Create Supabase client
      const supabaseClient = ctx.supabaseClient;
      
      if (!supabaseClient) {
        return createErrorResponse(
          ErrorCode.INTERNAL_ERROR,
          "Supabase client not available",
          null,
          500,
          corsHeaders
        );
      }
      
      // Verify the token
      const { data, error } = await supabaseClient.auth.getUser(token);
      const user = data?.user;
      
      if (error || !user) {
        return createErrorResponse(
          ErrorCode.UNAUTHORIZED,
          "Invalid or expired token",
          { error: error?.message },
          401,
          corsHeaders
        );
      }
      
      // Call handler with authenticated user
      return await handler(user, req, ctx);
    } catch (error) {
      return handleRequestError(error);
    }
  };
}

/**
 * Create a complete request handler with CORS, error handling, and authentication
 */
export function createRequestHandler(handler: AuthenticatedRequestHandler): RequestHandler {
  return withCors(withErrorHandling(withAuth(handler)));
}

/**
 * Create a public request handler with CORS and error handling
 */
export function createPublicRequestHandler(handler: RequestHandler): RequestHandler {
  return withCors(withErrorHandling(handler));
}
