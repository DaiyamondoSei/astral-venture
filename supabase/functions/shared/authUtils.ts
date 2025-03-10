
/**
 * Shared Authentication Utilities for Edge Functions
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { createErrorResponse, ErrorCode } from "./responseUtils.ts";

// Helper for getting Supabase admin client
export function getSupabaseAdmin() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or service role key");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
}

// Helper for getting Supabase client with user token
export function getSupabaseClient(token: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase URL or anon key");
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

// New utility to create a client from a request with proper error handling
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

// Extract token from request headers
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.replace("Bearer ", "");
}

// Authenticate request and get user
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

// Auth middleware for Edge Functions
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

// Check admin role
export function isAdmin(user: any): boolean {
  return user?.app_metadata?.role === "admin";
}

// Admin-only middleware
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
