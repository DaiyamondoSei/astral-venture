
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create standardized response functions
function createSuccessResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify({
      status: 'success',
      data,
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

function createErrorResponse(
  code: string,
  message: string,
  details: any = null,
  status = 400
) {
  return new Response(
    JSON.stringify({
      status: 'error',
      error: {
        code,
        message,
        details,
      }
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

// Enum for error codes
enum ErrorCode {
  MISSING_PARAMETERS = 'client/missing-parameters',
  INVALID_REQUEST = 'client/invalid-request',
  UNAUTHORIZED = 'auth/unauthorized',
  EXTERNAL_API_ERROR = 'server/external-api-error',
  INTERNAL_ERROR = 'server/internal-error',
  TIMEOUT = 'server/timeout',
  DATABASE_ERROR = 'server/database-error',
}

// Validate required parameters
function validateRequiredParameters(
  params: Record<string, any>,
  requiredParams: string[]
) {
  const missingParams = requiredParams.filter(param => params[param] === undefined);
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

// Main entry point for the edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Process start time for tracking performance
  const startTime = performance.now();

  try {
    // Parse request body
    const requestData = await req.json();
    
    // Extract common parameters
    const {
      question,
      options = {}
    } = requestData;
    
    // Validate required parameters
    const paramValidation = validateRequiredParameters(
      { question },
      ["question"]
    );
    
    if (!paramValidation.isValid) {
      return createErrorResponse(
        ErrorCode.MISSING_PARAMETERS,
        "Missing required parameters",
        { missingParams: paramValidation.missingParams }
      );
    }
    
    // Set up OpenAI API configuration
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        "OpenAI API key is not configured",
        null,
        500
      );
    }
    
    // Set AI model and parameters with defaults
    const model = options.model || "gpt-4o-mini";
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 1000;
    
    // Call OpenAI API
    console.log(`Calling OpenAI with model: ${model}`);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant specialized in providing insights and analysis."
          },
          { role: "user", content: question }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return createErrorResponse(
        ErrorCode.EXTERNAL_API_ERROR,
        "Error calling OpenAI API",
        errorData,
        response.status
      );
    }
    
    // Process the OpenAI response
    const openAIData = await response.json();
    const content = openAIData.choices[0]?.message?.content || "";
    const processingTime = performance.now() - startTime;
    
    // Parse insights from the content (simplified)
    const insights = extractInsights(content);
    
    // Return the processed response
    return createSuccessResponse({
      result: content,
      insights,
      model: openAIData.model,
      tokenUsage: openAIData.usage?.total_tokens || 0,
      processingTime
    });
    
  } catch (error) {
    console.error("Error in ai-processor-enhanced:", error);
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "An error occurred while processing the request",
      { message: error.message }
    );
  }
});

// Helper function to extract insights from content
function extractInsights(content: string): any[] {
  // Simple extraction of bullet points and key phrases
  const insights: any[] = [];
  
  // Extract bullet points (lines starting with - or *)
  const bulletPoints = content.match(/^[•\-*]\s.+$/gm);
  if (bulletPoints) {
    bulletPoints.forEach(point => {
      insights.push({
        type: 'bullet',
        text: point.replace(/^[•\-*]\s/, '')
      });
    });
  }
  
  // Look for key phrases like "important:", "key insight:", etc.
  const keyPhraseRegex = /(?:important|key|insight|note|remember):\s+([^.]+)/gi;
  let match;
  while ((match = keyPhraseRegex.exec(content)) !== null) {
    if (match[1]) {
      insights.push({
        type: 'key',
        text: match[1].trim()
      });
    }
  }
  
  return insights;
}
