
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

// Generate SVG path without using OpenAI (local algorithm)
function generateGeometryLocally(
  seed: string, 
  complexity: number,
  chakraAssociations: number[]
) {
  // Use seed for pseudo-random generation
  const seedValue = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seedValue + complexity) * 10000;
    const rand = x - Math.floor(x);
    return min + rand * (max - min);
  };
  
  // Generate a sacred geometry pattern based on complexity and chakras
  const centerX = 50;
  const centerY = 50;
  const radius = 40;
  
  // Choose pattern type based on chakra associations
  const patternType = chakraAssociations.length > 0 
    ? (chakraAssociations[0] % 3) // 0, 1, or 2
    : (seedValue % 3);
    
  let svgPath = '';
  let points: [number, number][] = [];
  
  // Create different geometry patterns based on type
  if (patternType === 0) {
    // Flower of life pattern
    const petals = 6 + Math.floor(complexity * 2);
    const innerRadius = radius * 0.4;
    const outerRadius = radius * 0.8;
    
    svgPath = `M ${centerX + outerRadius} ${centerY} `;
    
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const nextAngle = ((i + 1) / petals) * Math.PI * 2;
      
      const x1 = centerX + outerRadius * Math.cos(angle);
      const y1 = centerY + outerRadius * Math.sin(angle);
      const x2 = centerX + innerRadius * Math.cos(angle + Math.PI / petals);
      const y2 = centerY + innerRadius * Math.sin(angle + Math.PI / petals);
      const x3 = centerX + outerRadius * Math.cos(nextAngle);
      const y3 = centerY + outerRadius * Math.sin(nextAngle);
      
      svgPath += `L ${x2} ${y2} L ${x3} ${y3} `;
      points.push([x1, y1], [x2, y2]);
    }
    
    svgPath += 'Z';
  } else if (patternType === 1) {
    // Sri Yantra inspired pattern
    const layers = 3 + Math.floor(complexity);
    const points = [];
    
    svgPath = `M ${centerX} ${centerY - radius} `;
    
    for (let layer = 0; layer < layers; layer++) {
      const layerRadius = radius * (1 - layer / layers * 0.6);
      const vertices = 3 + layer * 2;
      
      for (let i = 0; i < vertices; i++) {
        const angle = (i / vertices) * Math.PI * 2 + (layer % 2) * Math.PI / vertices;
        const x = centerX + layerRadius * Math.cos(angle);
        const y = centerY + layerRadius * Math.sin(angle);
        
        svgPath += `L ${x} ${y} `;
        points.push([x, y]);
      }
      
      // Connect back to first point of this layer
      const firstAngle = (0 / vertices) * Math.PI * 2 + (layer % 2) * Math.PI / vertices;
      const firstX = centerX + layerRadius * Math.cos(firstAngle);
      const firstY = centerY + layerRadius * Math.sin(firstAngle);
      svgPath += `L ${firstX} ${firstY} `;
      
      // Move to next layer's starting point
      if (layer < layers - 1) {
        const nextLayerRadius = radius * (1 - (layer + 1) / layers * 0.6);
        const nextAngle = ((layer + 1) % 2) * Math.PI / (3 + (layer + 1) * 2);
        const nextX = centerX + nextLayerRadius * Math.cos(nextAngle);
        const nextY = centerY + nextLayerRadius * Math.sin(nextAngle);
        svgPath += `M ${nextX} ${nextY} `;
      }
    }
  } else {
    // Metatron's Cube pattern
    const vertices = 6 + Math.floor(complexity * 3);
    const points: [number, number][] = [];
    
    // Create points in a circle
    for (let i = 0; i < vertices; i++) {
      const angle = (i / vertices) * Math.PI * 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push([x, y]);
    }
    
    // Add center point
    points.push([centerX, centerY]);
    
    // Start with a circle
    svgPath = `M ${points[0][0]} ${points[0][1]} `;
    
    // Connect all outer points to form the circle
    for (let i = 1; i < vertices; i++) {
      svgPath += `L ${points[i][0]} ${points[i][1]} `;
    }
    svgPath += `L ${points[0][0]} ${points[0][1]} `;
    
    // Connect points to create the inner structure
    // Connect every point to every other point based on complexity
    const connectFactor = Math.max(1, Math.min(vertices - 1, Math.floor(complexity * 3)));
    
    for (let i = 0; i < vertices; i++) {
      for (let j = 1; j <= connectFactor; j++) {
        const targetIndex = (i + j) % vertices;
        svgPath += `M ${points[i][0]} ${points[i][1]} `;
        svgPath += `L ${points[targetIndex][0]} ${points[targetIndex][1]} `;
      }
    }
  }
  
  // Generate significant points if none were created
  if (points.length === 0) {
    const numPoints = 5 + Math.floor(complexity * 3);
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const distance = radius * (0.3 + random(0.4, 0.7));
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      points.push([x, y]);
    }
  }
  
  // Create energy qualities based on chakra associations
  const energyQualities = [];
  const chakraNames = [
    "Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"
  ];
  
  // Energy qualities based on chakras
  if (chakraAssociations.includes(1)) energyQualities.push("grounding", "stability");
  if (chakraAssociations.includes(2)) energyQualities.push("creativity", "passion");
  if (chakraAssociations.includes(3)) energyQualities.push("confidence", "willpower");
  if (chakraAssociations.includes(4)) energyQualities.push("love", "compassion");
  if (chakraAssociations.includes(5)) energyQualities.push("communication", "expression");
  if (chakraAssociations.includes(6)) energyQualities.push("intuition", "insight");
  if (chakraAssociations.includes(7)) energyQualities.push("connection", "spirituality");
  
  // If no chakras specified, add some default qualities
  if (energyQualities.length === 0) {
    energyQualities.push("harmony", "balance", "focus", "clarity");
  }
  
  // Add animation properties
  const animationProperties = {
    duration: 3000 + (complexity * 1000),
    easing: 'ease-in-out',
    rotation: seedValue % 2 === 0,
    pulsate: seedValue % 3 === 0,
    scale: complexity > 3
  };
  
  return {
    result: {
      svgPath: svgPath,
      points: points,
      energyAlignment: energyQualities,
      chakraAssociations: chakraAssociations,
      animationProperties
    },
    confidence: 0.7,
    reasoning: "Generated sacred geometry pattern using algorithmic approach",
    metadata: {
      processingTime: 0,
      modelUsed: "local-algorithm",
      tokenUsage: 0,
      cached: false,
      complexity,
      generatedLocally: true
    }
  };
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
        complexity,
        generatedLocally: false
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
      console.log("OpenAI API key not found, using local geometry generation");
      
      // Use local algorithm-based generation
      const result = generateGeometryLocally(seed, complexity, chakraAssociations);
      
      // Add processing time
      result.metadata.processingTime = performance.now() - startTime;
      
      return createResponse(result);
    }
    
    // Generate geometry with AI
    const result = await generateGeometryWithAI(seed, complexity, chakraAssociations);
    
    // Add processing time
    result.metadata.processingTime = performance.now() - startTime;
    
    return createResponse(result);
  } catch (error) {
    console.error("Error in generate-geometry edge function:", error);
    
    // If AI generation fails, fall back to local generation
    try {
      console.log("Falling back to local geometry generation");
      const { seed = "default", complexity = 3, chakraAssociations = [] } = 
        (req.method === "POST" && await req.json()) || {};
      
      const result = generateGeometryLocally(seed, complexity, chakraAssociations);
      result.metadata.processingTime = performance.now() - startTime;
      result.metadata.fallback = true;
      
      return createResponse(result);
    } catch (fallbackError) {
      console.error("Fallback generation also failed:", fallbackError);
      return createErrorResponse(
        "Failed to generate geometry pattern",
        error instanceof Error ? error.message : String(error),
        500
      );
    }
  }
});
