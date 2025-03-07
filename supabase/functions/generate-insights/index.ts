
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  handleCorsRequest,
  validateRequiredParameters
} from "../shared/responseUtils.ts";

import { withAuth } from "../shared/authUtils.ts";
import { generateInsightsWithOpenAI } from "./services/openaiService.ts";
import { saveInsightsToDatabase, formatReflectionsForAnalysis } from "./services/databaseService.ts";
import { validateReflectionsData, validateUserId } from "./services/validationService.ts";

// Main entry point for edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  return withAuth(req, processRequest);
});

// Process the insights generation request (after authentication)
async function processRequest(user: any, req: Request): Promise<Response> {
  try {
    // Track performance
    const startTime = Date.now();
    
    // Parse request body
    const { reflections, userId } = await req.json();
    
    // Validate required parameters
    const validation = validateRequiredParameters(
      { reflections, userId },
      ["reflections", "userId"]
    );
    
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.MISSING_PARAMETERS,
        "Missing required parameters for insights generation",
        { missingParams: validation.missingParams }
      );
    }
    
    // Verify that the user is generating insights for their own data
    const userValidation = validateUserId(userId, user.id);
    if (!userValidation.isValid) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        userValidation.errorMessage || "Unauthorized",
        { requestedUserId: userId, authenticatedUserId: user.id }
      );
    }
    
    // Validate reflections data
    const reflectionsValidation = validateReflectionsData(reflections);
    if (!reflectionsValidation.isValid) {
      return createErrorResponse(
        ErrorCode.VALIDATION_FAILED,
        reflectionsValidation.errorMessage || "Invalid reflections data",
        { details: "Reflections validation failed" }
      );
    }
    
    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return createErrorResponse(
        ErrorCode.CONFIGURATION_ERROR,
        "OpenAI API key is not configured",
        { detail: "Missing API key in environment" }
      );
    }
    
    // Format the reflections data for analysis
    const reflectionTexts = formatReflectionsForAnalysis(reflections);
    
    // Generate insights using OpenAI
    const insights = await generateInsightsWithOpenAI(reflectionTexts, OPENAI_API_KEY);
    
    // Save insights to the database asynchronously
    // This runs in the background and doesn't block the response
    EdgeRuntime.waitUntil(saveInsightsToDatabase(userId, insights));
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Return success response
    return createSuccessResponse(
      { insights },
      { processingTime }
    );
  } catch (error) {
    console.error("Error in generate-insights function:", error);
    
    // Determine error type and return appropriate response
    if (error.message?.includes("OpenAI API")) {
      return createErrorResponse(
        ErrorCode.EXTERNAL_API_ERROR,
        "Error communicating with AI service",
        { errorMessage: error.message }
      );
    }
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Failed to generate insights",
      { errorMessage: error.message }
    );
  }
}
