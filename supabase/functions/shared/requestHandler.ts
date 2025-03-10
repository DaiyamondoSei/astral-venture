
/**
 * Shared request handler for edge functions
 */
import { corsHeaders, createErrorResponse, ErrorCode, ErrorHandlingOptions } from "./responseUtils.ts";
import { withAuth, withOptionalAuth, withAdminAuth } from "./authUtils.ts";

/**
 * Wrapper for handling different HTTP methods
 * 
 * @param req Request object
 * @param handlers Object mapping HTTP methods to handler functions
 * @param options Additional options
 * @returns Response from appropriate handler
 */
export async function handleRequest(
  req: Request,
  handlers: {
    GET?: (req: Request) => Promise<Response>;
    POST?: (req: Request) => Promise<Response>;
    PUT?: (req: Request) => Promise<Response>;
    DELETE?: (req: Request) => Promise<Response>;
    PATCH?: (req: Request) => Promise<Response>;
    OPTIONS?: (req: Request) => Promise<Response>;
  },
  options: {
    auth?: 'required' | 'optional' | 'admin' | 'none';
    defaultHandler?: (req: Request) => Promise<Response>;
  } = {}
): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    if (handlers.OPTIONS) {
      return handlers.OPTIONS(req);
    }
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get the handler for this method
  const methodHandler = handlers[req.method as keyof typeof handlers];
  
  // If no handler for this method, return 405 Method Not Allowed
  if (!methodHandler && !options.defaultHandler) {
    return createErrorResponse(
      ErrorCode.INVALID_PARAMETERS,
      `Method ${req.method} not allowed`,
      null,
      405
    );
  }
  
  const handler = methodHandler || options.defaultHandler;
  
  // Apply appropriate authentication wrapper based on options
  switch (options.auth) {
    case 'required':
      return withAuth(req, (user, req) => handler!(req));
    case 'optional':
      return withOptionalAuth(req, (user, req) => handler!(req));
    case 'admin':
      return withAdminAuth(req, (user, req) => handler!(req));
    case 'none':
    default:
      return handler!(req);
  }
}

/**
 * Parse JSON body with error handling
 * 
 * @param req Request object
 * @returns Parsed body or null on error
 */
export async function parseJsonBody<T = any>(req: Request): Promise<T | null> {
  try {
    return await req.json() as T;
  } catch (error) {
    console.error("Error parsing JSON body:", error);
    return null;
  }
}

/**
 * Process a request with standard error handling
 * 
 * @param req Request object
 * @param processor Function to process the request
 * @param options Error handling options
 * @returns Response from processor or error response
 */
export async function processRequest<T extends any[]>(
  processor: (...args: T) => Promise<Response>,
  args: T,
  options: ErrorHandlingOptions = {}
): Promise<Response> {
  try {
    return await processor(...args);
  } catch (error) {
    console.error("Request processing error:", error);
    
    // Determine error type and code
    let errorCode = ErrorCode.INTERNAL_ERROR;
    let statusCode = 500;
    let message = options.customMessage || "An error occurred processing your request";
    
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("404")) {
        errorCode = ErrorCode.RESOURCE_NOT_FOUND;
        statusCode = 404;
        message = options.customMessage || "Resource not found";
      } else if (error.message.includes("permission") || 
                 error.message.includes("unauthorized") || 
                 error.message.includes("auth")) {
        errorCode = ErrorCode.UNAUTHORIZED;
        statusCode = 401;
        message = options.customMessage || "Authentication required";
      } else if (error.message.includes("timed out") || error.message.includes("timeout")) {
        errorCode = ErrorCode.TIMEOUT;
        statusCode = 408;
        message = options.customMessage || "Request timed out";
      } else if (error.message.includes("validation") || error.message.includes("invalid")) {
        errorCode = ErrorCode.INVALID_PARAMETERS;
        statusCode = 400;
        message = options.customMessage || error.message;
      }
    }
    
    // Include stack trace if enabled
    const details: Record<string, unknown> = { 
      error: error instanceof Error ? error.message : String(error)
    };
    
    if (options.includeStack && error instanceof Error && error.stack) {
      details.stack = error.stack;
    }
    
    return createErrorResponse(
      errorCode,
      message,
      details,
      options.defaultStatus || statusCode
    );
  }
}
