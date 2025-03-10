
/**
 * Shared authentication utilities for edge functions
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { createErrorResponse, ErrorCode, corsHeaders } from "./responseUtils.ts";

/**
 * Verify JWT token and get user 
 * 
 * @param token JWT token from auth header
 * @returns User object or null if invalid
 */
export async function verifyToken(token: string) {
  try {
    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
      return null;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from token
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      console.error("Auth error:", error);
      return null;
    }
    
    return data.user;
  } catch (err) {
    console.error("Token verification error:", err);
    return null;
  }
}

/**
 * Extract and verify auth token from request
 * 
 * @param req Request object
 * @returns User object or null if invalid/missing auth
 */
export async function getUserFromRequest(req: Request) {
  try {
    // Get auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;
    
    // Extract token
    const token = authHeader.replace("Bearer ", "");
    if (!token) return null;
    
    // Verify token and get user
    return await verifyToken(token);
  } catch (err) {
    console.error("Error getting user from request:", err);
    return null;
  }
}

/**
 * Higher-order function to wrap handlers with authentication
 * 
 * @param req Request object
 * @param handler Handler function that receives authenticated user
 * @returns Response from handler or auth error
 */
export async function withAuth(
  req: Request,
  handler: (user: any, req: Request) => Promise<Response>
): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get user from request
    const user = await getUserFromRequest(req);
    
    // Check if authenticated
    if (!user) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Authentication required",
        null,
        401
      );
    }
    
    // Call handler with authenticated user
    return await handler(user, req);
  } catch (error) {
    console.error("Auth error:", error);
    
    return createErrorResponse(
      ErrorCode.UNAUTHORIZED,
      "Authentication error",
      { message: error instanceof Error ? error.message : String(error) },
      401
    );
  }
}

/**
 * Higher-order function to wrap handlers with optional authentication
 * User can be null if not authenticated
 * 
 * @param req Request object
 * @param handler Handler function that receives possibly null user
 * @returns Response from handler
 */
export async function withOptionalAuth(
  req: Request,
  handler: (user: any | null, req: Request) => Promise<Response>
): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get user from request (may be null)
    const user = await getUserFromRequest(req);
    
    // Call handler with user (or null)
    return await handler(user, req);
  } catch (error) {
    console.error("Optional auth error:", error);
    
    // Still call handler with null user on auth error
    try {
      return await handler(null, req);
    } catch (handlerError) {
      console.error("Handler error with null user:", handlerError);
      
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        "Error processing request",
        { message: handlerError instanceof Error ? handlerError.message : String(handlerError) },
        500
      );
    }
  }
}

/**
 * Check if a user has admin role
 * 
 * @param user User object from auth
 * @returns Boolean indicating if user is admin
 */
export function isAdmin(user: any): boolean {
  if (!user) return false;
  
  // Check app_metadata for admin role
  const isAdminRole = user.app_metadata?.role === "admin";
  
  // Also check user_metadata for compatibility
  const isAdminMeta = user.user_metadata?.isAdmin === true;
  
  return isAdminRole || isAdminMeta;
}

/**
 * Middleware to ensure user has admin role
 * 
 * @param req Request object
 * @param handler Handler function that receives admin user
 * @returns Response from handler or unauthorized error
 */
export async function withAdminAuth(
  req: Request,
  handler: (user: any, req: Request) => Promise<Response>
): Promise<Response> {
  return withAuth(req, async (user, req) => {
    // Check if user is admin
    if (!isAdmin(user)) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Admin privileges required",
        null,
        403
      );
    }
    
    // Call handler with admin user
    return await handler(user, req);
  });
}
