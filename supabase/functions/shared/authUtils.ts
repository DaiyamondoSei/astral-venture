
/**
 * Shared Authentication Utilities for Edge Functions
 * Uses consistent patterns and robust error handling
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { createErrorResponse, ErrorCode } from "./responseUtils.ts";

// Standard configuration for Supabase clients
const supabaseConfig = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
};

/**
 * Helper for getting Supabase admin client with consistent configuration
 * @returns Supabase admin client
 * @throws Error if environment variables are missing
 */
export function getSupabaseAdmin() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or service role key");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, supabaseConfig);
}

/**
 * Helper for getting Supabase client with user token
 * @param token User authentication token
 * @returns Supabase client authenticated as the user
 * @throws Error if environment variables are missing
 */
export function getSupabaseClient(token: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase URL or anon key");
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    ...supabaseConfig,
    auth: {
      ...supabaseConfig.auth,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

/**
 * Create a Supabase client from a request with proper error handling
 * @param req HTTP request object
 * @returns Object with client and error (if any)
 */
export function createClientFromRequest(req: Request) {
  const token = extractToken(req);
  
  if (!token) {
    return { client: null, error: "No authorization token provided" };
  }
  
  try {
    const client = getSupabaseClient(token);
    return { client, error: null };
  } catch (error) {
    return { client: null, error: error.message };
  }
}

/**
 * Extract token from request headers
 * @param req HTTP request object
 * @returns Bearer token or null if not found
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.replace("Bearer ", "");
}

/**
 * Authenticate request and get user
 * @param req HTTP request object
 * @returns Object with user and error (if any)
 */
export async function getAuthenticatedUser(req: Request) {
  const token = extractToken(req);
  if (!token) {
    return { user: null, error: "No authorization token provided" };
  }
  
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return { user: null, error: error?.message || "Invalid token" };
  }
  
  return { user: data.user, error: null };
}

/**
 * Auth middleware for Edge Functions
 * @param req HTTP request object
 * @param handler Handler function to execute if authentication succeeds
 * @returns HTTP response
 */
export async function withAuth(
  req: Request,
  handler: (user: any, req: Request) => Response | Promise<Response>
): Promise<Response> {
  const { user, error } = await getAuthenticatedUser(req);
  
  if (!user) {
    return createErrorResponse(
      ErrorCode.AUTHENTICATION_ERROR,
      error || "Authentication required",
      null,
      401
    );
  }
  
  return await handler(user, req);
}

/**
 * Check admin role
 * @param user User object from Supabase Auth
 * @returns Boolean indicating if user has admin role
 */
export function isAdmin(user: any): boolean {
  return user?.app_metadata?.role === "admin";
}

/**
 * Admin-only middleware
 * @param req HTTP request object
 * @param handler Handler function to execute if user is admin
 * @returns HTTP response
 */
export async function withAdminAuth(
  req: Request,
  handler: (user: any, req: Request) => Response | Promise<Response>
): Promise<Response> {
  const { user, error } = await getAuthenticatedUser(req);
  
  if (!user) {
    return createErrorResponse(
      ErrorCode.AUTHENTICATION_ERROR,
      error || "Authentication required",
      null,
      401
    );
  }
  
  if (!isAdmin(user)) {
    return createErrorResponse(
      ErrorCode.AUTHORIZATION_ERROR,
      "Admin privileges required",
      null,
      403
    );
  }
  
  return await handler(user, req);
}
