
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  handleCorsRequest
} from "../shared/responseUtils.ts";
import { createClientFromRequest } from "../shared/authUtils.ts";

// Session management edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }
  
  try {
    // Get Supabase client from the request
    const { client, error } = createClientFromRequest(req);
    
    if (error || !client) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Invalid authentication credentials",
        { details: error },
        401
      );
    }
    
    // Get the current session
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "No active session found",
        { details: sessionError?.message },
        401
      );
    }
    
    // Check if session needs refresh (if expiring within 1 hour)
    const expiresAt = new Date(sessionData.session.expires_at || "");
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    let refreshedSession = sessionData.session;
    
    // If session expires within an hour, refresh it
    if (expiresAt < oneHourFromNow) {
      const { data: refreshData, error: refreshError } = await client.auth.refreshSession();
      
      if (refreshError) {
        return createErrorResponse(
          ErrorCode.UNAUTHORIZED,
          "Failed to refresh session",
          { details: refreshError.message },
          401
        );
      }
      
      refreshedSession = refreshData.session;
    }
    
    // Update last active timestamp for the user in user_profiles
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    await supabaseAdmin
      .from("user_profiles")
      .update({ 
        last_active_at: new Date().toISOString() 
      })
      .eq("id", refreshedSession.user.id);
    
    // Return the session info
    return createSuccessResponse({
      token: refreshedSession.access_token,
      expiresAt: new Date(refreshedSession.expires_at || "").getTime(),
      user: {
        id: refreshedSession.user.id,
        email: refreshedSession.user.email
      }
    });
    
  } catch (error) {
    console.error("Error in refresh-session function:", error);
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Failed to process session refresh",
      { errorMessage: error.message },
      500
    );
  }
});
