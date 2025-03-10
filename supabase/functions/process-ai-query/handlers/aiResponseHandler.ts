import { corsHeaders } from "../../shared/responseUtils.ts";
import { extractInsights, Insight } from "../services/insights/index.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Process and enrich AI responses with extracted insights
 */
export async function processAIResponse(
  aiResponse: string,
  reflectionId: string | null,
  startTime: number,
  model: string,
  tokensUsed: number
): Promise<Response> {
  try {
    // Extract insights from the AI response using our enhanced extraction system
    const insights = extractInsights(aiResponse);
    
    // If this is related to a reflection, store insights
    if (reflectionId) {
      await storeReflectionInsights(reflectionId, insights);
    }
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Create success response
    const response = new Response(
      JSON.stringify({
        response: aiResponse,
        insights: insights,
        metrics: {
          processingTime,
          model,
          tokensUsed
        },
        processed: true
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "max-age=300"
        }
      }
    );
    
    // Track usage metrics asynchronously (don't await)
    EdgeRuntime.waitUntil(
      trackUsage(model, tokensUsed, reflectionId, processingTime, insights.length, aiResponse.length)
    );
    
    return response;
  } catch (error) {
    console.error("Error processing AI response:", error);
    
    // Return the raw response if processing fails
    return new Response(
      JSON.stringify({
        response: aiResponse,
        insights: [],
        processed: false,
        error: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
}

/**
 * Store extracted insights for a reflection
 */
async function storeReflectionInsights(reflectionId: string, insights: Insight[]): Promise<void> {
  try {
    const supabaseClient = createSupabaseClient();
    
    // Organize insights by type
    const insightsByType: Record<string, string> = {};
    
    // Group insights by type, keeping the most relevant one for each type
    for (const insight of insights) {
      if (!insightsByType[insight.type] || 
          (insight.relevance || 0) > (insights.find(i => i.type === insight.type && i.content === insightsByType[insight.type])?.relevance || 0)) {
        insightsByType[insight.type] = insight.content;
      }
    }
    
    // Update the reflection with insights
    const { error } = await supabaseClient
      .from("energy_reflections")
      .update({
        ai_insights: {
          emotional: insightsByType['emotional'] || '',
          chakra: insightsByType['chakra'] || '',
          practice: insightsByType['practice'] || '',
          awareness: insightsByType['awareness'] || '',
          general: insightsByType['general'] || '',
          updated_at: new Date().toISOString()
        }
      })
      .eq("id", reflectionId);
    
    if (error) {
      console.error("Error storing reflection insights:", error);
    }
  } catch (error) {
    console.error("Failed to store reflection insights:", error);
  }
}

/**
 * Track API usage for analytics and billing
 */
async function trackUsage(
  model: string,
  tokensUsed: number,
  reflectionId: string | null,
  processingTime: number,
  insightsCount: number,
  responseLength: number
): Promise<void> {
  try {
    const supabaseClient = createSupabaseClient();
    
    await supabaseClient
      .from("ai_interaction_logs")
      .insert({
        model,
        tokens_used: tokensUsed,
        query_type: reflectionId ? "reflection_analysis" : "general_query",
        processing_time: processingTime,
        insights_generated: insightsCount,
        response_length: responseLength,
        reflection_id: reflectionId
      });
  } catch (error) {
    console.error("Failed to track usage:", error);
  }
}

/**
 * Create a Supabase client
 */
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
