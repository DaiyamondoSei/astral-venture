
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

import { 
  corsHeaders,
  handleCorsRequest
} from "../shared/responseUtils.ts";

import { withAuth } from "../shared/authUtils.ts";
import { 
  validatePerformancePayload, 
  processMetrics,
  storePerformanceMetrics
} from "./utils.ts";

// Process performance tracking data
async function handler(user: any, req: Request): Promise<Response> {
  try {
    // Get performance data from request
    const performanceData = await req.json();
    
    // Validate the payload
    const validationResult = validatePerformancePayload(performanceData);
    if (!validationResult.valid) {
      return new Response(
        JSON.stringify({ error: validationResult.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Process metrics
    const processedData = processMetrics(performanceData, user.id);
    
    // Store metrics
    const result = await storePerformanceMetrics(user.id, processedData);
    
    // Return result
    return new Response(
      JSON.stringify({ 
        status: "success", 
        saved: result.saved,
        sessionId: processedData.sessionId 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in track-performance function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

// Edge function entry point
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }
  
  // Process with authentication
  return withAuth(req, handler);
});
