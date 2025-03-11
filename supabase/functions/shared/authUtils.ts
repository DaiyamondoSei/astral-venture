
/**
 * Shared authentication utilities for Edge Functions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { createErrorResponse, ErrorCode } from "./responseUtils.ts";

/**
 * Authentication related error codes
 */
export enum AuthErrorCode {
  MISSING_TOKEN = 'MISSING_TOKEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS'
}

/**
 * Options for authentication middleware
 */
export interface AuthOptions {
  requireUser?: boolean;
  requireAdmin?: boolean;
  requireVerified?: boolean;
  adminEmails?: string[];
}

/**
 * Default admin emails for authorization checks
 */
const DEFAULT_ADMIN_EMAILS = [
  // Add default admin emails here if needed
];

/**
 * Check if a user is an admin
 */
export function isAdmin(user: any, adminEmails = DEFAULT_ADMIN_EMAILS): boolean {
  if (!user || !user.email) return false;
  
  // Check if user's email is in the admin list
  return adminEmails.includes(user.email);
}

/**
 * Extract authorization token from request headers
 */
export function extractAuthToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.replace('Bearer ', '');
}

/**
 * Authenticate a request and get the user
 */
export async function authenticateRequest(
  req: Request,
  options: AuthOptions = {}
): Promise<{ user: any | null; error: any | null }> {
  // Extract token from request
  const token = extractAuthToken(req);
  
  if (!token) {
    return {
      user: null,
      error: {
        code: AuthErrorCode.MISSING_TOKEN,
        message: 'Missing authentication token'
      }
    };
  }
  
  // Create Supabase client
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );
  
  // Get user from token
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error) {
    // Determine specific error type
    const errorCode = error.message?.includes('expired')
      ? AuthErrorCode.TOKEN_EXPIRED
      : AuthErrorCode.INVALID_TOKEN;
    
    return {
      user: null,
      error: {
        code: errorCode,
        message: error.message
      }
    };
  }
  
  const user = data?.user;
  
  // Check if user exists
  if (options.requireUser && !user) {
    return {
      user: null,
      error: {
        code: AuthErrorCode.USER_NOT_FOUND,
        message: 'User not found'
      }
    };
  }
  
  // Check if email is verified when required
  if (options.requireVerified && user && !user.email_confirmed_at) {
    return {
      user: null,
      error: {
        code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'Email not verified'
      }
    };
  }
  
  // Check admin status when required
  if (options.requireAdmin && user && !isAdmin(user, options.adminEmails)) {
    return {
      user: null,
      error: {
        code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'Admin privileges required'
      }
    };
  }
  
  return { user, error: null };
}

/**
 * Authentication middleware for Edge Functions
 */
export function withAuth(
  req: Request,
  handler: (user: any, req: Request) => Promise<Response>,
  options: AuthOptions = { requireUser: true }
): Promise<Response> {
  return new Promise(async (resolve) => {
    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        return resolve(new Response(null, { 
          headers: { 
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
          }
        }));
      }
      
      // Authenticate the request
      const { user, error } = await authenticateRequest(req, options);
      
      if (error) {
        // Map auth errors to appropriate HTTP responses
        if (error.code === AuthErrorCode.MISSING_TOKEN || error.code === AuthErrorCode.INVALID_TOKEN) {
          return resolve(createErrorResponse(
            ErrorCode.UNAUTHORIZED,
            error.message,
            { authErrorCode: error.code },
            401
          ));
        }
        
        if (error.code === AuthErrorCode.TOKEN_EXPIRED) {
          return resolve(createErrorResponse(
            ErrorCode.UNAUTHORIZED,
            'Authentication token expired',
            { authErrorCode: error.code },
            401
          ));
        }
        
        if (error.code === AuthErrorCode.INSUFFICIENT_PERMISSIONS) {
          return resolve(createErrorResponse(
            ErrorCode.FORBIDDEN,
            error.message,
            { authErrorCode: error.code },
            403
          ));
        }
        
        // Default error response
        return resolve(createErrorResponse(
          ErrorCode.UNAUTHORIZED,
          'Authentication failed',
          { authErrorCode: error.code },
          401
        ));
      }
      
      // Handle the request with authenticated user
      const response = await handler(user, req);
      resolve(response);
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      resolve(createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'Authentication process failed',
        { message: error instanceof Error ? error.message : String(error) },
        500
      ));
    }
  });
}

/**
 * Check if the current user has permissions for a specific action
 */
export async function hasPermission(
  user: any,
  resourceType: string,
  resourceId: string,
  action: 'read' | 'write' | 'delete'
): Promise<boolean> {
  if (!user) return false;
  
  // Admin users have all permissions
  if (isAdmin(user)) return true;
  
  try {
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Check if resource exists and user has access
    const { data, error } = await supabaseAdmin
      .from(resourceType)
      .select('id, user_id')
      .eq('id', resourceId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    // Basic ownership check
    return data.user_id === user.id;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Get a user profile by ID
 */
export async function getUserProfile(userId: string): Promise<any | null> {
  if (!userId) return null;
  
  try {
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Get user profile
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('User profile fetch error:', error);
    return null;
  }
}
