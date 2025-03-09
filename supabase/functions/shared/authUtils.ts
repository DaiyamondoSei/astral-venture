
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, createErrorResponse } from "./responseUtils.ts";

/**
 * Authorization middleware for Edge Functions
 */
export async function withAuth(req: Request, handler: Function): Promise<Response> {
  try {
    // Get JWT token from request
    const authorization = req.headers.get('Authorization') || '';
    if (!authorization.startsWith('Bearer ')) {
      return createErrorResponse('Unauthorized: Missing or invalid token format', null, 401);
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
      return createErrorResponse('Unauthorized: Invalid token', authError?.message, 401);
    }
    
    // Call the handler with the authenticated user
    return await handler(user, req);
  } catch (error) {
    console.error("Auth error:", error);
    return createErrorResponse('Internal server error during authentication', error.message, 500);
  }
}
