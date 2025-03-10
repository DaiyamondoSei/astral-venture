
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { createErrorResponse, ErrorCode } from "./responseUtils.ts";

/**
 * Authentication middleware for Edge Functions
 * Verifies the auth token and passes the authenticated user to the handler
 * 
 * @param req The incoming request
 * @param handler Function to handle the authenticated request
 */
export async function withAuth(req: Request, handler: Function): Promise<Response> {
  try {
    // Get JWT token from request
    const authorization = req.headers.get('Authorization') || '';
    if (!authorization.startsWith('Bearer ')) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        'Missing or invalid token format',
        { header: authorization.slice(0, 10) + '...' },
        401
      );
    }
    
    const token = authorization.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        'Invalid authentication token',
        { error: authError?.message },
        401
      );
    }
    
    // Call the handler with the authenticated user
    return await handler(user, req);
  } catch (error) {
    console.error("Authentication error:", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'Internal server error during authentication',
      { error: error.message },
      500
    );
  }
}

/**
 * Helper to create Supabase client from request
 * This approach allows more flexible access to Supabase client
 * 
 * @param req The incoming request
 */
export function createClientFromRequest(req: Request): { 
  client: any; 
  token?: string;
  error?: string;
} {
  try {
    const authorization = req.headers.get('Authorization') || '';
    if (!authorization.startsWith('Bearer ')) {
      return { 
        client: null, 
        error: 'Missing or invalid token format' 
      };
    }
    
    const token = authorization.replace('Bearer ', '');
    
    const client = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    
    return { client, token };
  } catch (error) {
    console.error("Error creating client:", error);
    return { 
      client: null, 
      error: error.message 
    };
  }
}
