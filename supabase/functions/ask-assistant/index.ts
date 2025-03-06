
// Import Deno standard library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Import shared utilities
import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  handleCorsRequest,
  validateRequiredParameters
} from "../shared/responseUtils.ts";

import { withAuth } from "../shared/authUtils.ts";
import { 
  generateChatResponse, 
  ContentModerationType 
} from "./openaiService.ts";
import { 
  buildContextualizedPrompt,
  extractKeyInsights 
} from "./responseGenerator.ts";
import { fetchUserContext } from "./userContext.ts";

// Entry point for the edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  // Process the request with authentication
  return withAuth(req, processRequest);
});

// Main request handler (runs after authentication)
async function processRequest(user: any, req: Request): Promise<Response> {
  try {
    // Parse request body
    const { message, reflectionId, reflectionContent } = await req.json();
    
    // Validate required parameters
    const validation = validateRequiredParameters(
      { message },
      ["message"]
    );
    
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.MISSING_PARAMETERS,
        "Missing required parameters",
        { missingParams: validation.missingParams }
      );
    }
    
    // Check message content for moderation
    const moderationCheck = await checkMessageModeration(message);
    if (!moderationCheck.allowed) {
      return createErrorResponse(
        ErrorCode.VALIDATION_FAILED,
        "Message flagged by content moderation",
        { flags: moderationCheck.flags }
      );
    }
    
    // Process start time for tracking
    const startTime = Date.now();
    
    // Fetch user context for personalized responses
    const userContext = await fetchUserContext(user.id);
    
    // Build prompt with additional context
    const prompt = buildContextualizedPrompt(
      message,
      userContext,
      reflectionContent
    );
    
    // Generate response from AI
    const aiResponse = await generateChatResponse(prompt);
    
    // Extract insights from the response
    const insights = extractKeyInsights(aiResponse);
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Return success response
    return createSuccessResponse(
      {
        response: aiResponse,
        insights,
        reflectionId
      },
      {
        processingTime,
        version: "1.1.0"
      }
    );
  } catch (error) {
    console.error("Error in ask-assistant function:", error);
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Failed to process request",
      { errorMessage: error.message }
    );
  }
}

// Content moderation check
async function checkMessageModeration(message: string): Promise<{
  allowed: boolean;
  flags?: ContentModerationType[];
}> {
  try {
    // Simple local moderation check for abusive terms
    const abusiveTerms = ["kill", "hate", "destroy", "attack"];
    const containsAbusiveTerms = abusiveTerms.some(term => 
      message.toLowerCase().includes(term)
    );
    
    if (containsAbusiveTerms) {
      return {
        allowed: false,
        flags: ["harassment", "hate"]
      };
    }
    
    // Implement OpenAI moderation API call here for production
    // This is just a placeholder - in real implementation, integrate with OpenAI moderation
    
    return { allowed: true };
  } catch (error) {
    console.error("Error in content moderation:", error);
    // Default to allowing message if moderation check fails
    return { allowed: true };
  }
}
