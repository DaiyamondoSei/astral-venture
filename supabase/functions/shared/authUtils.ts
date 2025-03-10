
/**
 * Shared authentication utilities for edge functions
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { createErrorResponse, ErrorCode } from "./responseUtils.ts";

export interface ErrorHandlingOptions {
  logToConsole?: boolean;
  showDetails?: boolean;
  context?: Record<string, unknown>;
}

/**
 * Get authenticated user from request
 * 
 * @param req Request object
 * @returns User object or null if unauthorized
 */
export async function getAuthenticatedUser(req: Request): Promise<any> {
  // Get authorization header
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    // Get token
    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error("Auth error:", error?.message);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
}

/**
 * Check if user has admin role
 * 
 * @param user User object
 * @returns Boolean indicating if user is admin
 */
export function isAdmin(user: any): boolean {
  if (!user) return false;
  
  // Check for admin role in app_metadata
  return user.app_metadata && 
    (user.app_metadata.role === 'admin' || 
     user.app_metadata.roles?.includes('admin'));
}

/**
 * Higher-order function to require authentication
 * 
 * @param req Request object
 * @param handler Handler function that receives authenticated user
 * @param options Error handling options
 * @returns Response from handler or error response
 */
export async function withAuth(
  req: Request,
  handler: (user: any, req: Request, options?: ErrorHandlingOptions) => Promise<Response>,
  options: ErrorHandlingOptions = {}
): Promise<Response> {
  // Get user from request
  const user = await getAuthenticatedUser(req);
  
  // Check if user is authenticated
  if (!user) {
    return createErrorResponse(
      ErrorCode.UNAUTHORIZED,
      "Authentication required",
      options.showDetails ? { headers: { 'auth-header': req.headers.get('Authorization') } } : undefined
    );
  }
  
  // Call handler with user
  return handler(user, req, options);
}

/**
 * Higher-order function to require admin role
 * 
 * @param req Request object
 * @param handler Handler function that receives authenticated user
 * @param options Error handling options
 * @returns Response from handler or error response
 */
export async function withAdmin(
  req: Request,
  handler: (user: any, req: Request, options?: ErrorHandlingOptions) => Promise<Response>,
  options: ErrorHandlingOptions = {}
): Promise<Response> {
  // Get user from request
  const user = await getAuthenticatedUser(req);
  
  // Check if user is authenticated
  if (!user) {
    return createErrorResponse(
      ErrorCode.UNAUTHORIZED,
      "Authentication required"
    );
  }
  
  // Check if user is admin
  if (!isAdmin(user)) {
    return createErrorResponse(
      ErrorCode.FORBIDDEN,
      "Admin privileges required",
      options.showDetails ? { userId: user.id } : undefined
    );
  }
  
  // Call handler with user
  return handler(user, req, options);
}
