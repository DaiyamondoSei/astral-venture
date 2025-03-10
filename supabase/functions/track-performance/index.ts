
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
function handleCorsRequest() {
  return new Response(null, {
    headers: corsHeaders
  });
}

// Create error response with consistent format
function createErrorResponse(code: string, message: string, details?: any, status = 400) {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
        details
      },
      success: false
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}

// Create success response with consistent format
function createSuccessResponse(data: any, metadata?: any) {
  return new Response(
    JSON.stringify({
      data,
      metadata,
      success: true
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}

// Validate required parameters
function validateRequiredParameters(data: any, requiredParams: string[]) {
  const missingParams = requiredParams.filter(param => !data[param]);
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

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
    
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return createErrorResponse(
        "MISSING_PARAMETERS",
        "Missing or invalid performance metrics",
        { missingParams: ["metrics"] },
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
    
    // Prepare metrics with user ID and timestamps
    const formattedMetrics = metrics.map((metric: any) => ({
      ...metric,
      user_id: effectiveUserId,
      created_at: new Date().toISOString()
    }));
    
    // Insert the performance metrics
    const { error } = await supabase
      .from('performance_metrics')
      .insert(formattedMetrics);
    
    if (error) {
      console.error("Error inserting performance metrics:", error);
      return createErrorResponse(
        "DATABASE_ERROR",
        "Failed to store performance metrics",
        { dbError: error.message },
        500
      );
    }
    
    console.log(`Successfully stored ${metrics.length} performance metrics for user ${effectiveUserId}`);
    
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
      "INTERNAL_ERROR",
      "An error occurred while tracking performance",
      { error: error.message },
      500
    );
  }
});
