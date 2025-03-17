
/**
 * AI Analyzer Edge Function
 * 
 * Provides secure OpenAI API access for analysis tasks
 * without exposing API keys in the frontend.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenAI API configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Cache implementation (in-memory - will reset on function restart)
const cache = new Map<string, { data: any; expires: number }>();
const DEFAULT_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Handler function for the edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Parse request body
    const { 
      operation, 
      data, 
      options = {} 
    } = await req.json();

    // Validate required fields
    if (!operation) {
      throw new Error('Operation is required');
    }
    if (!data) {
      throw new Error('Data is required');
    }

    // Set up response options
    const { 
      model = 'gpt-4o-mini',
      temperature = 0.3,
      maxTokens = 1200,
      useCache = true,
      cacheTtl = DEFAULT_CACHE_TTL_MS,
      forceRefresh = false
    } = options;

    // Check cache if enabled
    const cacheKey = JSON.stringify({ operation, data, model, temperature });
    
    if (useCache && !forceRefresh) {
      const cachedResult = cache.get(cacheKey);
      if (cachedResult && cachedResult.expires > Date.now()) {
        return new Response(
          JSON.stringify({ 
            ...cachedResult.data, 
            metadata: { ...cachedResult.data.metadata, cached: true } 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Set up operation-specific parameters
    let prompt: string;
    let systemRole: string;
    
    // Configure prompt based on operation
    switch (operation) {
      case 'analyzeChakraSystem':
        const { activatedChakras, emotionalData, reflectionContent } = data;
        
        prompt = `
          Analyze the following chakra system data and provide insights:
          
          Activated Chakras: ${activatedChakras?.join(', ') || 'None provided'}
          ${emotionalData ? `Emotional Data: ${JSON.stringify(emotionalData)}` : ''}
          ${reflectionContent ? `User Reflection: ${reflectionContent}` : ''}
          
          Please provide detailed information in the following categories:
          1. Dominant chakras
          2. Activation levels for each chakra (1-10)
          3. Potential blockages
          4. Recommendations for balancing
          5. Overall balance score (1-100)
          6. Brief interpretation of the user's chakra system
        `;
        
        systemRole = 'You are an expert chakra system analyzer that provides insights into chakra activations, blockages, and balance. You respond with accurate, detailed JSON data.';
        break;
        
      case 'analyzePerformanceMetrics':
        const { componentRenderTimes, memoryUsage, fps, networkRequests, errorRates } = data;
        
        prompt = `
          Analyze the following performance metrics and provide optimization insights:
          
          Component Render Times: ${JSON.stringify(componentRenderTimes || {})}
          ${memoryUsage ? `Memory Usage: ${memoryUsage} MB` : ''}
          ${fps ? `Frames Per Second: ${fps}` : ''}
          ${networkRequests ? `Network Requests: ${JSON.stringify(networkRequests)}` : ''}
          ${errorRates ? `Error Rates: ${JSON.stringify(errorRates)}` : ''}
          
          Please provide:
          1. Performance issues identified, with component name, severity, description and recommendation
          2. Major bottlenecks
          3. Optimization score (1-100)
          4. Specific recommendations for improvement
        `;
        
        systemRole = 'You are an expert performance optimization analyst that provides insights into web application performance. You respond with accurate, detailed JSON data.';
        break;
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    // Track processing time
    const startTime = Date.now();
    
    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemRole
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Error from OpenAI API: ${response.status}`);
    }

    const responseData = await response.json();
    const processingTime = Date.now() - startTime;
    
    // Parse the content from the OpenAI response
    const content = responseData.choices[0].message.content;
    let parsedContent;
    
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    // Create the result object
    const result = {
      result: parsedContent,
      confidence: operation === 'analyzePerformanceMetrics' ? 0.9 : 0.85,
      metadata: {
        processingTime,
        modelUsed: model,
        tokenUsage: responseData.usage?.total_tokens || 0,
        completionTimestamp: new Date().toISOString()
      }
    };

    // Cache the result if caching is enabled
    if (useCache) {
      cache.set(cacheKey, {
        data: result,
        expires: Date.now() + cacheTtl
      });
    }

    // Return the result
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI analyzer:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unknown error occurred',
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
