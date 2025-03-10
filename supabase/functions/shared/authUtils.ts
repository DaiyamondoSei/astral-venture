
/**
 * Authentication utilities for edge functions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { ErrorCode, createErrorResponse, corsHeaders } from './responseUtils.ts';

// Create a Supabase client for the edge function
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Extract user from JWT token in Authorization header
 */
export async function getUserFromToken(req: Request): Promise<any> {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return null;
    }
    
    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return null;
    }
    
    // Verify the token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
}

/**
 * Require authentication for a request
 */
export async function requireAuth(req: Request): Promise<{ user: any } | Response> {
  try {
    // CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Get user from token
    const user = await getUserFromToken(req);
    if (!user) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        'Authentication required',
        undefined,
        401
      );
    }
    
    return { user };
  } catch (error) {
    console.error('Auth error:', error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'Authentication error',
      undefined,
      500
    );
  }
}

/**
 * Check if a user has admin role
 */
export function isAdmin(user: any): boolean {
  // Check user metadata for admin role
  if (!user || !user.app_metadata) {
    return false;
  }
  
  // Admin role from app_metadata
  return user.app_metadata.role === 'admin';
}

/**
 * Get user profile data
 */
export async function getUserProfile(userId: string): Promise<any> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

export default {
  getUserFromToken,
  requireAuth,
  isAdmin,
  getUserProfile,
};
