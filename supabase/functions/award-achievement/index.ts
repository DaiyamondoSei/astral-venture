
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

// Handle achievement awarding request (after authentication)
async function handleRequest(user: any, req: Request): Promise<Response> {
  try {
    // Parse request body
    const requestData = await req.json();
    
    // Validate required parameters
    const { achievementId } = requestData;
    const paramValidation = validateRequiredParameters(
      { achievementId },
      ["achievementId"]
    );
    
    if (!paramValidation.isValid) {
      return createErrorResponse(
        ErrorCode.MISSING_PARAMETERS,
        "Missing required parameters",
        { missingParams: paramValidation.missingParams },
        400
      );
    }
    
    // Get Supabase admin client
    const supabase = createAdminClient();
    
    // Award achievement using the database function
    const { data, error } = await supabase.rpc(
      "award_achievement",
      {
        user_id_param: user.id,
        achievement_id_param: achievementId
      }
    );
    
    if (error) {
      console.error("Error awarding achievement:", error);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to award achievement",
        { supabaseError: error.message },
        500
      );
    }
    
    // If the achievement was already awarded, data will be false
    if (data === false) {
      return createSuccessResponse({
        achievementId,
        awarded: false,
        message: "Achievement was already awarded"
      });
    }
    
    return createSuccessResponse({
      achievementId,
      awarded: true
    });
  } catch (error) {
    console.error("Error in award-achievement:", error);
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "An error occurred while awarding achievement",
      { errorMessage: error.message }
    );
  }
}
