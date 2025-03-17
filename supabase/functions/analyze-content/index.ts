
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// OpenAI API key from environment variables
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a response with common headers
function createResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}

// Create an error response
function createErrorResponse(message: string, error: any = null, status = 400) {
  return new Response(
    JSON.stringify({
      error: message,
      details: error
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}

// Content analysis using OpenAI
async function analyzeContentWithAI(
  text: string,
  contentType: string,
  userContext: any
) {
  // Create system message based on content type
  let systemMessage = "You are an AI expert in analyzing personal reflections, dreams, and journal entries.";
  
  // Add context for different content types
  switch (contentType) {
    case 'reflection':
      systemMessage += " Focus on emotional themes, personal growth opportunities, and connections to chakra energy centers.";
      break;
    case 'dream':
      systemMessage += " Focus on symbolic meaning, emotional undertones, and subconscious patterns in dreams.";
      break;
    case 'journal':
      systemMessage += " Focus on detecting patterns, emotional states, and areas for personal development.";
      break;
    default:
      systemMessage += " Provide balanced insights on the emotional and energetic aspects of the text.";
  }
  
  // Create user context instruction
  let contextInstruction = "";
  if (userContext) {
    contextInstruction = `
      Additional user context:
      - Previous themes: ${userContext.previousThemes || 'Unknown'}
      - Energy focus: ${userContext.energyFocus || 'General'}
      - Current challenges: ${userContext.challenges || 'Unknown'}
    `;
  }
  
  // Create the analysis prompt
  const prompt = `
    Please analyze the following ${contentType}:
    
    "${text.trim()}"
    
    ${contextInstruction}
    
    Provide insights in this JSON format:
    {
      "insights": [Array of 3-5 meaningful insights about the content],
      "themes": [Array of 2-4 main themes],
      "emotionalTone": "Overall emotional tone (one or two words)",
      "chakraConnections": [
        {
          "chakraId": number (1-7),
          "relevance": number (0-1),
          "insight": "Specific insight related to this chakra"
        }
      ],
      "recommendedPractices": [Array of 2-3 suggested practices based on the analysis],
      "confidence": number (0-1)
    }
    
    IMPORTANT: Respond ONLY with the JSON object. No introduction or explanation.
  `;
  
  try {
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content || "";
    
    // Extract JSON from response (handle potential extra text)
    const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract valid JSON from the AI response");
    }
    
    // Parse the JSON response
    const analysisData = JSON.parse(jsonMatch[0]);
    
    return {
      result: analysisData,
      confidence: analysisData.confidence || 0.7,
      reasoning: `Analyzed ${contentType} text for insights, themes, and chakra connections`,
      metadata: {
        processingTime: 0,
        modelUsed: data.model,
        tokenUsage: data.usage?.total_tokens || 0,
        cached: false,
        contentType
      }
    };
  } catch (error) {
    console.error("Error analyzing content with AI:", error);
    throw error;
  }
}

// Main function handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const startTime = performance.now();
  
  try {
    // Parse request data
    const { text = "", contentType = "general", userContext = null, options = {} } = await req.json();
    
    // Validate required parameters
    if (!text.trim()) {
      return createErrorResponse("Text is required for analysis", null, 400);
    }
    
    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      return createErrorResponse(
        "OpenAI API key is not configured",
        null,
        500
      );
    }
    
    // Analyze content with AI
    const result = await analyzeContentWithAI(text, contentType, userContext);
    
    // Add processing time
    result.metadata.processingTime = performance.now() - startTime;
    
    return createResponse(result);
  } catch (error) {
    console.error("Error in analyze-content edge function:", error);
    return createErrorResponse(
      "Failed to analyze content",
      error instanceof Error ? error.message : String(error),
      500
    );
  }
});
