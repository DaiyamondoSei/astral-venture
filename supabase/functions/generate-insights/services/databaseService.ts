
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Save generated insights to the database
 */
export async function saveInsightsToDatabase(
  userId: string, 
  insights: any[]
): Promise<void> {
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

/**
 * Format reflections data for analysis
 */
export function formatReflectionsForAnalysis(reflections: any[]): any[] {
  return reflections
    .map(r => ({
      content: r.content,
      dominant_emotion: r.dominant_emotion || "unknown",
      emotional_depth: r.emotional_depth || 0,
      chakras_activated: r.chakras_activated || [],
      date: r.created_at
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
