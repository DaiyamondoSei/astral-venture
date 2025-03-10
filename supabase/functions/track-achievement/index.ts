
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

import { withAuth, createAdminClient } from "../shared/authUtils.ts";

// Main entry point for edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  return withAuth(req, handleRequest);
});

// Handle achievement tracking request (after authentication)
async function handleRequest(user: any, req: Request): Promise<Response> {
  try {
    // Parse request body
    const requestData = await req.json();
    
    // Validate required parameters
    const { achievementId, progress } = requestData;
    const paramValidation = validateRequiredParameters(
      { achievementId, progress },
      ["achievementId", "progress"]
    );
    
    if (!paramValidation.isValid) {
      return createErrorResponse(
        ErrorCode.MISSING_PARAMETERS,
        "Missing required parameters",
        { missingParams: paramValidation.missingParams },
        400
      );
    }
    
    // Extract optional parameters
    const { autoAward = true } = requestData;
    
    // Get Supabase admin client
    const supabase = createAdminClient();
    
    // Update achievement progress using the database function
    const { data, error } = await supabase.rpc(
      "update_achievement_progress",
      {
        user_id_param: user.id,
        achievement_id_param: achievementId,
        progress_value: progress,
        auto_award: autoAward
      }
    );
    
    if (error) {
      console.error("Error updating achievement progress:", error);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to update achievement progress",
        { supabaseError: error.message },
        500
      );
    }
    
    return createSuccessResponse({
      achievementId,
      progress,
      updated: data
    });
  } catch (error) {
    console.error("Error in track-achievement:", error);
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "An error occurred while tracking achievement",
      { errorMessage: error.message }
    );
  }
}
