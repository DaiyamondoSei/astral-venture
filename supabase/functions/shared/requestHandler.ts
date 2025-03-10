
/**
 * Shared request handler for edge functions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { 
  corsHeaders, 
  createErrorResponse, 
  ErrorCode,
  ErrorHandlingOptions 
} from "./responseUtils.ts";

// Initialize Supabase client
function initSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
}

/**
 * Handle authentication for edge functions
 */
export async function handleAuth(req: Request): Promise<{ user: any; error: string | null }> {
  try {
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        user: null,
        error: "Missing or invalid authorization header"
      };
    }
    
    const token = authHeader.replace("Bearer ", "");
    const supabase = initSupabaseClient();
    
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return {
        user: null,
        error: error.message
      };
    }
    
    return {
      user: data.user,
      error: null
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      user: null,
      error: error.message || "Authentication failed"
    };
  }
}

/**
 * Standard error handler for edge functions
 */
export function handleError(
  error: any,
  options: ErrorHandlingOptions = {}
): Response {
  const {
    logToConsole = true,
    includeDetails = process.env.NODE_ENV !== "production",
    defaultErrorMessage = "An unexpected error occurred"
  } = options;
  
  // Log error if enabled
  if (logToConsole) {
    console.error("Edge function error:", error);
  }
  
  // Determine error type and code
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let statusCode = 500;
  let errorMessage = defaultErrorMessage;
  
  // Extract message from error
  if (error.message) {
    errorMessage = error.message;
  }
  
  // Try to determine more specific error type
  if (error.code) {
    // Use existing error code if available
    errorCode = error.code;
  } else if (errorMessage.includes("auth") || errorMessage.includes("authentication")) {
    errorCode = ErrorCode.AUTHENTICATION_REQUIRED;
    statusCode = 401;
  } else if (errorMessage.includes("permission") || errorMessage.includes("unauthorized")) {
    errorCode = ErrorCode.UNAUTHORIZED;
    statusCode = 403;
  } else if (errorMessage.includes("not found") || errorMessage.includes("doesn't exist")) {
    errorCode = ErrorCode.NOT_FOUND;
    statusCode = 404;
  } else if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
    errorCode = ErrorCode.RATE_LIMITED;
    statusCode = 429;
  } else if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    errorCode = ErrorCode.TIMEOUT;
    statusCode = 408;
  }
  
  // Create error details
  const errorDetails = includeDetails
    ? {
        stack: error.stack,
        name: error.name,
        code: error.code,
        detailed: error.detailed || error.details
      }
    : null;
  
  // Return standardized error response
  return createErrorResponse(
    errorCode,
    errorMessage,
    errorDetails,
    statusCode
  );
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Secure request wrapper for edge functions
 * Handles authentication, CORS, and error handling
 */
export function secureEndpoint(
  handler: (user: any, req: Request) => Promise<Response>,
  requireAuth: boolean = true
) {
  return async (req: Request): Promise<Response> => {
    try {
      // Handle CORS preflight
      const corsResponse = handleCorsPreflightRequest(req);
      if (corsResponse) return corsResponse;
      
      // Handle authentication if required
      if (requireAuth) {
        const { user, error } = await handleAuth(req);
        
        if (error || !user) {
          return createErrorResponse(
            ErrorCode.AUTHENTICATION_REQUIRED,
            "Authentication required",
            { message: error || "No user found" },
            401
          );
        }
        
        // Execute handler with authenticated user
        return await handler(user, req);
      }
      
      // Execute handler without requiring authentication
      return await handler(null, req);
    } catch (error) {
      return handleError(error);
    }
  };
}
