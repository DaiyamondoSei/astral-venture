
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Define CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple cache implementation
const responseCache = new Map();

// In-memory rate limiting
const rateLimiter = new Map();

// Define a function to handle the request
const handleRequest = async (req: Request): Promise<Response> => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Parse the request body
    const { question, options } = await req.json();
    
    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the user ID for rate limiting
    const userId = options?.userId || 'anonymous';
    
    // Check rate limiting
    const now = Date.now();
    const userRequests = rateLimiter.get(userId) || [];
    
    // Remove entries older than 1 minute
    const recentRequests = userRequests.filter(timestamp => now - timestamp < 60000);
    
    if (recentRequests.length >= 10) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }
    
    // Update rate limiter
    rateLimiter.set(userId, [...recentRequests, now]);
    
    // Generate a cache key based on the question and model
    const cacheKey = options?.cacheKey || `${question}_${options?.model || 'default'}`;
    
    // Check the cache if enabled
    if (options?.useCache && responseCache.has(cacheKey)) {
      const cachedResponse = responseCache.get(cacheKey);
      console.log('Returning cached response for:', cacheKey);
      
      // Update the cached flag
      cachedResponse.cached = true;
      
      return new Response(
        JSON.stringify(cachedResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Start measuring processing time
    const startTime = Date.now();
    
    // Process the question - this is a simple simulation
    // In a real implementation, this would call the OpenAI API
    const result = await processQuestion(question, options);
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Create the response object
    const response = {
      result: result.text,
      type: 'text',
      model: options?.model || 'gpt-4o-mini',
      tokenUsage: result.tokenCount || 100,
      processingTime,
      suggestedPractices: result.suggestions || [],
      cached: false
    };
    
    // Cache the response if enabled
    if (options?.useCache) {
      responseCache.set(cacheKey, response);
      
      // Limit cache size to 100 entries
      if (responseCache.size > 100) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
      }
    }
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing AI request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

// Define a simple function to process the question
async function processQuestion(question: string, options: any) {
  // In a real implementation, this would call an LLM API like OpenAI
  // For now, we'll return a simple response
  return {
    text: `Here's a response to your question: "${question}". This is a simulated response since this is a demo. In a production environment, this would connect to an AI service like OpenAI to generate a proper response.`,
    tokenCount: 50,
    suggestions: [
      'Practice mindful breathing for 5 minutes',
      'Try a guided meditation focused on energy centers',
      'Journal about your spiritual journey'
    ]
  };
}

// Start serving the function
serve(handleRequest);
