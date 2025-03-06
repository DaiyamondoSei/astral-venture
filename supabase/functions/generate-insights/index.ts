
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    if (user.id !== userId) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        "You can only generate insights for your own reflections",
        { requestedUserId: userId, authenticatedUserId: user.id }
      );
    }
    
    // Validate reflections data
    if (!Array.isArray(reflections) || reflections.length === 0) {
      return createErrorResponse(
        ErrorCode.VALIDATION_FAILED,
        "Invalid reflections data provided",
        { details: "Reflections must be a non-empty array" }
      );
    }
    
    // Generate insights 
    const insights = await generateInsightsFromReflections(reflections);
    
    // Save insights to the database if needed
    await saveInsightsToDatabase(userId, insights);
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Return success response
    return createSuccessResponse(
      { insights },
      { processingTime }
    );
  } catch (error) {
    console.error("Error in generate-insights function:", error);
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Failed to generate insights",
      { errorMessage: error.message }
    );
  }
}

// Core insights generation logic
async function generateInsightsFromReflections(reflections: any[]): Promise<any[]> {
  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }
    
    // Format the reflections data for analysis
    const reflectionTexts = reflections
      .map(r => ({
        content: r.content,
        dominant_emotion: r.dominant_emotion || "unknown",
        emotional_depth: r.emotional_depth || 0,
        chakras_activated: r.chakras_activated || [],
        date: r.created_at
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Create a system prompt for the OpenAI model
    const systemPrompt = 
      "You are an expert spiritual guide specializing in analyzing reflections and meditations. " +
      "Analyze the provided reflection entries to identify patterns, growth opportunities, " +
      "and spiritual insights. Focus on emotional patterns, chakra activations, " +
      "and potential spiritual practices that could benefit the user.";
    
    // Create a prompt with the reflection data
    const userPrompt = `
      Please analyze the following reflection entries and generate 5-7 key insights:
      
      ${reflectionTexts.map((r, i) => `
      Entry ${i+1} (${new Date(r.date).toLocaleDateString()}):
      Content: "${r.content}"
      Dominant emotion: ${r.dominant_emotion}
      Emotional depth: ${r.emotional_depth}
      Chakras activated: ${Array.isArray(r.chakras_activated) ? r.chakras_activated.join(", ") : r.chakras_activated}
      `).join("\n")}
      
      Provide insights in the following JSON format:
      [
        {
          "insight": "The specific insight observation",
          "category": "emotional_pattern | chakra_activation | spiritual_growth | practice_recommendation",
          "confidence": A number between 0 and 1 representing confidence,
          "recommendation": "A specific practice or action recommendation based on this insight"
        },
        ...
      ]
      
      Only return valid JSON without any additional text.
    `;
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }
    
    const responseData = await response.json();
    const content = responseData.choices[0].message.content;
    
    // Parse the JSON response
    try {
      // Find the JSON part of the response (in case there's additional text)
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      const insights = JSON.parse(jsonString);
      
      // Validate and format insights
      return insights.map((insight: any, index: number) => ({
        id: `insight-${Date.now()}-${index}`,
        insight: insight.insight,
        category: insight.category,
        confidence: insight.confidence || 0.8,
        recommendation: insight.recommendation,
        created_at: new Date().toISOString()
      }));
    } catch (err) {
      console.error("Error parsing OpenAI response:", err);
      console.log("Raw response:", content);
      
      // Fallback insights if parsing fails
      return [{
        id: `insight-${Date.now()}-fallback`,
        insight: "Based on your reflections, consider taking time for more mindfulness practices",
        category: "practice_recommendation",
        confidence: 0.7,
        recommendation: "Try a 5-minute daily meditation focused on breath awareness",
        created_at: new Date().toISOString()
      }];
    }
  } catch (error) {
    console.error("Error generating insights:", error);
    throw error;
  }
}

// Save generated insights to the database
async function saveInsightsToDatabase(userId: string, insights: any[]): Promise<void> {
  try {
    // Skip if no insights to save
    if (!insights || insights.length === 0) {
      return;
    }
    
    // Initialize Supabase admin client
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
    
    // Prepare insights data for storage
    const analysisData = {
      insights,
      generated_at: new Date().toISOString(),
      insight_count: insights.length
    };
    
    // Insert into emotional_analysis table
    const { error } = await supabaseAdmin
      .from("emotional_analysis")
      .insert({
        user_id: userId,
        analysis_data: analysisData
      });
    
    if (error) {
      console.error("Error saving insights to database:", error);
    }
  } catch (error) {
    console.error("Error in saveInsightsToDatabase:", error);
    // Don't throw the error, just log it to prevent blocking the response
  }
}
