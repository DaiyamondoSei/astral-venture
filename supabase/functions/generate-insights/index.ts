
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Entry point for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reflections } = await req.json();
    
    // Basic validation
    if (!reflections || !Array.isArray(reflections) || reflections.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing reflections data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // For now, we'll generate insights locally
    // In a real implementation, you would call an AI service like OpenAI here
    const insights = generateBasicInsights(reflections);
    
    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-insights function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to generate basic insights without AI
function generateBasicInsights(reflections) {
  // Extract key themes from reflections
  const allContent = reflections.map(r => r.content).join(" ");
  const energyWords = ["energy", "vibration", "frequency", "chakra", "aura", "meditation"];
  const chakraWords = ["root", "sacral", "solar plexus", "heart", "throat", "third eye", "crown"];
  const emotionWords = ["joy", "peace", "love", "fear", "anger", "sadness"];
  
  // Generate simple insights
  const insights = [];
  
  // Add insights based on content patterns
  if (containsAnyWord(allContent, energyWords)) {
    insights.push({
      id: crypto.randomUUID(),
      content: "You've been exploring energy concepts in your reflections",
      category: "practice",
      confidence: 0.85,
      created_at: new Date().toISOString()
    });
  }
  
  // Add chakra-related insights
  const chakraMentions = chakraWords.filter(word => allContent.toLowerCase().includes(word));
  if (chakraMentions.length > 0) {
    insights.push({
      id: crypto.randomUUID(),
      content: `Your reflections show interest in the ${chakraMentions.join(", ")} chakras`,
      category: "chakra",
      confidence: 0.9,
      created_at: new Date().toISOString()
    });
  }
  
  // Add emotion-related insights
  const emotionMentions = emotionWords.filter(word => allContent.toLowerCase().includes(word));
  if (emotionMentions.length > 0) {
    insights.push({
      id: crypto.randomUUID(),
      content: `You've been processing ${emotionMentions.join(", ")} in your reflections`,
      category: "emotion",
      confidence: 0.8,
      created_at: new Date().toISOString()
    });
  }
  
  // Add reflection frequency insights
  if (reflections.length > 5) {
    insights.push({
      id: crypto.randomUUID(),
      content: "Regular reflection is strengthening your energy awareness",
      category: "progress",
      confidence: 0.95,
      created_at: new Date().toISOString()
    });
  }
  
  // Ensure we return at least one insight
  if (insights.length === 0) {
    insights.push({
      id: crypto.randomUUID(),
      content: "Continue your reflection practice to reveal deeper patterns",
      category: "general",
      confidence: 0.7,
      created_at: new Date().toISOString()
    });
  }
  
  return insights;
}

// Helper to check if string contains any word from a list
function containsAnyWord(text, wordList) {
  const lowerText = text.toLowerCase();
  return wordList.some(word => lowerText.includes(word.toLowerCase()));
}
