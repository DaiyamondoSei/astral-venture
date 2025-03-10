
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  handleCorsRequest,
  validateRequiredParameters
} from "../shared/responseUtils.ts";

// Create Supabase client
function createSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Main handler for tracking performance metrics
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    
    // Validate required fields
    const { metrics } = requestData;
    const validation = validateRequiredParameters({ metrics }, ["metrics"]);
    
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.MISSING_PARAMETERS,
        "Missing required performance metrics",
        { missingParams: validation.missingParams },
        400
      );
    }

    // Extract user information if available
    const { userId } = requestData;
    let tokenUserId = null;
    
    // Get the authorization header if present
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      // Extract the token
      const token = authHeader.replace('Bearer ', '');
      
      // Get the user from the token
      const supabase = createSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (!userError && user) {
        tokenUserId = user.id;
      }
    }
    
    // Use provided userId or tokenUserId
    const effectiveUserId = userId || tokenUserId || 'anonymous';
    
    // Create a new Supabase client
    const supabase = createSupabaseClient();
    
    // Insert the performance metrics
    const { error } = await supabase
      .from('performance_metrics')
      .insert(metrics.map((metric: any) => ({
        ...metric,
        user_id: effectiveUserId
      })));
    
    if (error) {
      console.error("Error inserting performance metrics:", error);
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        "Failed to store performance metrics",
        { dbError: error.message },
        500
      );
    }
    
    return createSuccessResponse(
      { 
        count: metrics.length,
        message: `Tracked ${metrics.length} performance metrics`
      },
      { 
        userId: effectiveUserId,
        timestamp: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error("Error in track-performance function:", error);
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "An error occurred while tracking performance",
      { error: error.message },
      500
    );
  }
});
