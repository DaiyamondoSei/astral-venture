
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

// Handle achievement progress update request (after authentication)
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
    
    // First, look up the achievement data
    const { data: achievementData, error: achievementError } = await supabase
      .from("achievements")
      .select("*")
      .eq("id", achievementId)
      .single();
      
    if (achievementError) {
      console.error("Error fetching achievement:", achievementError);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Achievement not found",
        { achievementId, error: achievementError.message },
        404
      );
    }
    
    // Check for existing user achievement record
    const { data: existingAchievement, error: lookupError } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", user.id)
      .eq("achievement_id", achievementId)
      .maybeSingle();
      
    if (lookupError) {
      console.error("Error looking up user achievement:", lookupError);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to check existing progress",
        { error: lookupError.message },
        500
      );
    }
    
    // Handle achievement update logic
    let updatedOrCreated;
    let awarded = false;
    
    if (existingAchievement) {
      // Calculate new progress
      const newProgress = existingAchievement.awarded 
        ? existingAchievement.progress 
        : Math.max(existingAchievement.progress + progress, 0);
        
      // Auto-award if threshold reached (assumes 100 is complete)
      const shouldAward = autoAward && newProgress >= 100 && !existingAchievement.awarded;
      
      // Update the record
      const { data, error } = await supabase
        .from("user_achievements")
        .update({
          progress: newProgress,
          awarded: shouldAward ? true : existingAchievement.awarded,
          awarded_at: shouldAward ? new Date().toISOString() : existingAchievement.awarded_at,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingAchievement.id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating achievement progress:", error);
        return createErrorResponse(
          ErrorCode.DATABASE_ERROR,
          "Failed to update achievement progress",
          { error: error.message },
          500
        );
      }
      
      updatedOrCreated = data;
      awarded = shouldAward;
    } else {
      // Calculate initial progress
      const initialProgress = Math.max(progress, 0);
      
      // Auto-award if threshold reached immediately
      const shouldAward = autoAward && initialProgress >= 100;
      
      // Create new record
      const { data, error } = await supabase
        .from("user_achievements")
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          progress: initialProgress,
          awarded: shouldAward,
          awarded_at: shouldAward ? new Date().toISOString() : null
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating achievement progress:", error);
        return createErrorResponse(
          ErrorCode.DATABASE_ERROR,
          "Failed to create achievement progress",
          { error: error.message },
          500
        );
      }
      
      updatedOrCreated = data;
      awarded = shouldAward;
    }
    
    // Return success response with updated data
    return createSuccessResponse({
      achievement: updatedOrCreated,
      achievementData,
      awarded,
      title: achievementData.title,
      description: achievementData.description
    });
  } catch (error) {
    console.error("Error in update-achievement-progress:", error);
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "An error occurred while updating achievement progress",
      { errorMessage: error.message }
    );
  }
}
