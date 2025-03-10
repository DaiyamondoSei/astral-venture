
/**
 * Shared authentication utilities for edge functions
 */

import { createErrorResponse, ErrorCode, corsHeaders, logEvent } from "./responseUtils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

/**
 * Wrapper for authenticated edge function handlers
 * 
 * @param req Request object
 * @param handlerFn Handler function that requires authentication
 * @returns Response
 */
export async function withAuth(
  req: Request,
  handlerFn: (user: any, req: Request) => Promise<Response>
): Promise<Response> {
  try {
    // Create Supabase admin client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Get auth token from request header
    const authorization = req.headers.get("Authorization");
    
    if (!authorization) {
      logEvent("warn", "Missing authorization header");
      return createErrorResponse(
        ErrorCode.AUTHENTICATION_REQUIRED,
        "Missing authorization header"
      );
    }
    
    // Bearer token format validation
    const token = authorization.replace("Bearer ", "");
    if (!token) {
      logEvent("warn", "Invalid authorization format");
      return createErrorResponse(
        ErrorCode.AUTHENTICATION_REQUIRED,
        "Invalid authorization format"
      );
    }
    
    // Verify the token and get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      logEvent("warn", "Invalid authorization token", { error: userError?.message });
      return createErrorResponse(
        ErrorCode.AUTHENTICATION_REQUIRED,
        "Invalid authorization token",
        userError?.message
      );
    }
    
    // Log the successful authentication
    logEvent("info", "User authenticated", { userId: user.id });
    
    // Call the handler function with the authenticated user
    return await handlerFn(user, req);
  } catch (error) {
    // Log and handle any unexpected errors
    logEvent("error", "Authentication error", { 
      error: error instanceof Error ? error.message : String(error)
    });
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Authentication error",
      error instanceof Error ? error.message : String(error),
      500
    );
  }
}

/**
 * Wrapper for admin-only edge function handlers
 * 
 * @param req Request object
 * @param handlerFn Handler function that requires admin privileges
 * @returns Response
 */
export async function withAdminAuth(
  req: Request,
  handlerFn: (user: any, req: Request) => Promise<Response>
): Promise<Response> {
  return withAuth(req, async (user, req) => {
    // Check for admin role in user metadata
    const isAdmin = user && 
                  (user.app_metadata?.role === "admin" || 
                   user.app_metadata?.isAdmin === true);
    
    if (!isAdmin) {
      logEvent("warn", "Unauthorized admin access attempt", { userId: user.id });
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Admin privileges required"
      );
    }
    
    // Log successful admin authentication
    logEvent("info", "Admin user authenticated", { userId: user.id });
    
    // Call the handler function with the admin user
    return await handlerFn(user, req);
  });
}
