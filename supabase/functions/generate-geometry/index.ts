
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

// Generate SVG path using OpenAI
async function generateGeometryWithAI(
  seed: string,
  complexity: number,
  chakraAssociations: number[]
) {
  // Chakra names for better prompting
  const chakraNames = [
    "Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"
  ];
  
  const selectedChakras = chakraAssociations.map(id => chakraNames[id - 1] || "Unknown");
  
  // Create prompt for OpenAI
  const prompt = `
    Create a sacred geometry pattern as SVG path data related to ${selectedChakras.join(", ")} chakras.
    Complexity level: ${complexity} (1-5 scale).
    Seed: ${seed}
    
    Return ONLY a JSON object with these properties:
    - svgPath: SVG path data (d attribute)
    - points: Array of significant points as [x,y] coordinates (5-20 points)
    - energyAlignment: Array of energy qualities this pattern embodies
    - chakraAssociations: Array of chakra IDs (1-7) this pattern resonates with
    
    The SVG viewbox is 100x100. Create a centered pattern.
    For svgPath, start with 'M' followed by path commands. Use absolute coordinates.
    For points, provide coordinates as [[x1,y1], [x2,y2], ...].
    IMPORTANT: Return ONLY valid JSON, no explanations or other text.
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
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are a sacred geometry expert that creates SVG path data for visualization. Only respond with the requested JSON data, no additional text."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 1000
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
    const geometryData = JSON.parse(jsonMatch[0]);
    
    // Add animation properties
    geometryData.animationProperties = {
      duration: 3000 + (complexity * 1000),
      easing: 'ease-in-out',
      rotation: Math.random() > 0.5,
      pulsate: Math.random() > 0.5,
      scale: complexity > 3
    };
    
    return {
      result: geometryData,
      confidence: 0.8,
      reasoning: "Generated sacred geometry pattern based on chakra associations",
      metadata: {
        processingTime: 0,
        modelUsed: data.model,
        tokenUsage: data.usage?.total_tokens || 0,
        cached: false,
        complexity
      }
    };
  } catch (error) {
    console.error("Error generating geometry with AI:", error);
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
    const { seed = "default", complexity = 3, chakraAssociations = [], options = {} } = await req.json();
    
    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      return createErrorResponse(
        "OpenAI API key is not configured",
        null,
        500
      );
    }
    
    // Generate geometry with AI
    const result = await generateGeometryWithAI(seed, complexity, chakraAssociations);
    
    // Add processing time
    result.metadata.processingTime = performance.now() - startTime;
    
    return createResponse(result);
  } catch (error) {
    console.error("Error in generate-geometry edge function:", error);
    return createErrorResponse(
      "Failed to generate geometry pattern",
      error instanceof Error ? error.message : String(error),
      500
    );
  }
});
