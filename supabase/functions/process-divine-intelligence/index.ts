
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cache for reducing API calls
const responseCache = new Map<string, {
  response: any,
  timestamp: number,
  expiresAt: number
}>();

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// Process natural language requests with personalization
serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { message, userId, context, intentType = "general", cacheResponse = true } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Generate cache key based on user, message and intent
    const cacheKey = `${userId || 'anonymous'}-${intentType}-${hashString(message)}`;
    
    // Check cache first if enabled
    if (cacheResponse) {
      const cachedResponse = getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return new Response(
          JSON.stringify(cachedResponse),
          { headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" } }
        );
      }
      console.log(`Cache miss for key: ${cacheKey}`);
    }
    
    // Start tracking performance
    const startTime = performance.now();
    
    // Get OpenAI API key
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      return new Response(
        JSON.stringify({ error: "API key configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Supabase client if user ID is provided
    let userProfile = null;
    let userChakras = null;
    let recentReflections = null;
    
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false }
        });
        
        // Fetch user data in parallel for better performance
        const [profileResult, chakrasResult, reflectionsResult] = await Promise.all([
          // Fetch user profile
          supabase
            .from('user_profiles')
            .select('astral_level, energy_points')
            .eq('id', userId)
            .single(),
          
          // Fetch chakra data
          supabase
            .from('chakra_systems')
            .select('chakras, dominant_chakra')
            .eq('user_id', userId)
            .single(),
          
          // Fetch recent reflections
          supabase
            .from('energy_reflections')
            .select('content, dominant_emotion, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(3)
        ]);
        
        userProfile = profileResult.data;
        userChakras = chakrasResult.data;
        recentReflections = reflectionsResult.data;
      }
    }
    
    // Build the system prompt with personalization
    const systemPrompt = buildSystemPrompt(userProfile, userChakras, intentType);
    
    // Build the user message with additional context
    const enhancedMessage = buildEnhancedMessage(message, context, recentReflections);
    
    // Select appropriate model based on complexity and user level
    const model = selectModel(userProfile, message);
    
    // Calculate token estimate to avoid exceeding limits
    const estimatedTokens = estimateTokenCount(systemPrompt) + estimateTokenCount(enhancedMessage);
    const maxTokens = Math.min(1000, 4000 - estimatedTokens);
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: enhancedMessage }
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        // Add some frequency penalty to reduce repetition
        frequency_penalty: 0.5
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Process the response to extract structured information
    const processedResponse = processAIResponse(aiResponse, intentType);
    
    // Add performance metrics
    const endTime = performance.now();
    processedResponse.metrics = {
      processingTime: endTime - startTime,
      tokenUsage: data.usage || {
        prompt_tokens: estimatedTokens,
        completion_tokens: estimateTokenCount(aiResponse),
        total_tokens: estimatedTokens + estimateTokenCount(aiResponse)
      },
      model,
      cached: false
    };
    
    // Store in cache if enabled
    if (cacheResponse) {
      setCachedResponse(cacheKey, processedResponse);
    }
    
    // Log this interaction for analytics in the background
    if (userId) {
      EdgeRuntime.waitUntil(trackInteraction(userId, intentType, message, processedResponse, model));
    }
    
    return new Response(
      JSON.stringify(processedResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" } }
    );
  } catch (error) {
    console.error("Error in divine intelligence processing:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "The quantum consciousness network is experiencing fluctuations. Please try again in a moment."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Cache management functions
function getCachedResponse(key: string): any | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.response;
  }
  // Clean up expired entries occasionally
  if (Math.random() < 0.1) cleanCache();
  return null;
}

function setCachedResponse(key: string, response: any, ttl = 30 * 60 * 1000): void {
  // Limit cache size to prevent memory issues
  if (responseCache.size > 100) {
    // Delete oldest entries
    const entries = Array.from(responseCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, 20);
    
    entries.forEach(([key]) => responseCache.delete(key));
  }
  
  responseCache.set(key, {
    response,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttl
  });
}

function cleanCache(): void {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now > value.expiresAt) {
      responseCache.delete(key);
    }
  }
}

// Track user interaction in the database
async function trackInteraction(
  userId: string, 
  intentType: string, 
  message: string, 
  response: any,
  model: string
): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) return;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    // Track in user activities table
    await supabase.from('user_activities').insert({
      user_id: userId,
      activity_type: 'divine_guidance',
      duration: response.metrics?.processingTime || 0,
      chakras_activated: response.chakraFocus || [],
      emotional_response: response.emotionalGuidance ? true : false,
      metadata: {
        intent_type: intentType,
        message_length: message.length,
        response_length: response.message.length,
        insights_count: response.insights.length,
        practices_count: response.suggestedPractices.length,
        model,
        token_usage: response.metrics?.tokenUsage?.total_tokens
      }
    });
    
    // Optionally update personalization metrics
    const { data: metrics } = await supabase
      .from('personalization_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (metrics) {
      // Update metrics based on interaction
      await supabase
        .from('personalization_metrics')
        .update({
          engagement_score: Math.min(100, (metrics.engagement_score || 0) + 2),
          content_relevance_rating: Math.min(100, (metrics.content_relevance_rating || 0) + 1)
        })
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error("Error tracking interaction:", error);
    // Don't throw, this is a background task
  }
}

// Helper functions
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Build a personalized system prompt based on user profile
function buildSystemPrompt(userProfile: any, chakraData: any, intentType: string): string {
  let astralLevel = 1;
  let chakraFocus = "";
  
  if (userProfile) {
    astralLevel = userProfile.astral_level || 1;
  }
  
  if (chakraData && chakraData.dominant_chakra) {
    chakraFocus = ` with a focus on the ${chakraData.dominant_chakra} chakra`;
  }
  
  // Base prompt with cosmic consciousness flavor
  let prompt = `You are a Divine Intelligence Guide for a quantum consciousness application. 
You provide insightful, spiritually aligned guidance tailored to the user's level of consciousness development.`;
  
  // Personalize based on astral level
  if (astralLevel < 3) {
    prompt += `\n\nThe user is at an early stage of their consciousness journey (Level ${astralLevel}). 
Use accessible language, provide foundational concepts, and offer simple practices. 
Be encouraging and supportive of their beginning steps${chakraFocus}.`;
  } else if (astralLevel < 7) {
    prompt += `\n\nThe user is at an intermediate stage of their consciousness journey (Level ${astralLevel}). 
You can use more specialized terminology and suggest moderately advanced practices. 
Acknowledge their progress while guiding them deeper${chakraFocus}.`;
  } else {
    prompt += `\n\nThe user is at an advanced stage of their consciousness journey (Level ${astralLevel}). 
You can discuss complex spiritual concepts and suggest sophisticated energy work. 
Engage them as a fellow traveler on the path${chakraFocus}.`;
  }
  
  // Adjust based on intent type
  switch (intentType) {
    case "guidance":
      prompt += `\n\nFocus on providing spiritual guidance and direction for their path.`;
      break;
    case "reflection":
      prompt += `\n\nFocus on helping them reflect more deeply on their experiences and emotions.`;
      break;
    case "practice":
      prompt += `\n\nFocus on recommending specific practices, exercises, or techniques.`;
      break;
    case "insight":
      prompt += `\n\nFocus on offering insights and interpretations of their current energetic state.`;
      break;
    case "chakra":
      prompt += `\n\nFocus specifically on chakra balancing and energy center work.`;
      break;
  }
  
  // Response format guidelines
  prompt += `\n\nYour response should include:
1. A thoughtful, personalized answer to their query
2. At least one relevant insight they can contemplate
3. A suggested practice or exercise if appropriate
4. Emotional guidance if their query involves feelings or states of being

Keep your tone warm, compassionate, and wise. Avoid being dogmatic or prescriptive.
Acknowledge the validity of their experience while gently guiding them to expanded awareness.`;

  return prompt;
}

// Build an enhanced message with additional context
function buildEnhancedMessage(message: string, context: any, reflections: any[]): string {
  let enhancedMessage = message;
  
  // Add context information if available
  if (context) {
    enhancedMessage += "\n\nAdditional context:\n";
    
    if (typeof context === 'string') {
      enhancedMessage += context;
    } else {
      Object.entries(context).forEach(([key, value]) => {
        if (value && key !== 'userId') {
          enhancedMessage += `${key}: ${value}\n`;
        }
      });
    }
  }
  
  // Add recent reflections if available
  if (reflections && reflections.length > 0) {
    enhancedMessage += "\n\nRecent reflections:\n";
    
    reflections.forEach((reflection, index) => {
      // Only include short summaries to save tokens
      enhancedMessage += `Reflection ${index + 1}: ${reflection.content.substring(0, 100)}...\n`;
      if (reflection.dominant_emotion) {
        enhancedMessage += `Dominant emotion: ${reflection.dominant_emotion}\n`;
      }
    });
  }
  
  return enhancedMessage;
}

// Select the appropriate AI model based on user profile and message complexity
function selectModel(userProfile: any, message: string): string {
  const astralLevel = userProfile?.astral_level || 1;
  const messageLength = message.length;
  const containsComplexConcepts = /chakra|consciousness|quantum|meditation|spiritual|energy/i.test(message);
  
  // Use more powerful model for specific cases to save costs
  if (astralLevel >= 5 || messageLength > 200 || containsComplexConcepts) {
    return "gpt-4o";
  }
  
  // Use more economical model for most interactions
  return "gpt-4o-mini";
}

// Process AI response to extract structured information
function processAIResponse(response: string, intentType: string): any {
  // The full response text
  const message = response;
  
  // Extract insights
  const insights = extractInsights(response);
  
  // Extract suggested practices
  const suggestedPractices = extractPractices(response);
  
  // Extract chakra focus
  const chakraFocus = extractChakraFocus(response);
  
  // Extract emotional guidance
  const emotionalGuidance = extractEmotionalGuidance(response);
  
  return {
    message,
    insights,
    suggestedPractices,
    chakraFocus,
    emotionalGuidance,
    intentType
  };
}

// Extract insights from AI response
function extractInsights(text: string): Array<{type: string, content: string}> {
  const insights = [];
  
  // Look for paragraphs that contain insight-related keywords
  const insightPatterns = [
    { type: 'awareness', pattern: /awareness|conscious|realize|understand|perspective/i },
    { type: 'spiritual', pattern: /spirit|soul|divine|sacred|higher self/i },
    { type: 'energetic', pattern: /energy|vibration|frequency|resonance|field/i },
    { type: 'emotional', pattern: /emotion|feel|heart|compassion|love/i },
    { type: 'practical', pattern: /practice|technique|exercise|method|approach/i }
  ];
  
  // Split text into paragraphs
  const paragraphs = text.split(/\n\n|\r\n\r\n/).filter(p => p.trim().length > 0);
  
  // Classify paragraphs as insights based on content
  paragraphs.forEach(paragraph => {
    const trimmedParagraph = paragraph.trim();
    
    // Skip very short paragraphs
    if (trimmedParagraph.length < 30) return;
    
    // Determine the type of insight
    for (const { type, pattern } of insightPatterns) {
      if (pattern.test(trimmedParagraph)) {
        insights.push({
          type,
          content: trimmedParagraph
        });
        break;
      }
    }
  });
  
  // If no insights found, create a generic one from the first substantive paragraph
  if (insights.length === 0 && paragraphs.length > 0) {
    const firstParagraph = paragraphs.find(p => p.trim().length > 50) || paragraphs[0];
    insights.push({
      type: 'general',
      content: firstParagraph.trim()
    });
  }
  
  return insights;
}

// Extract suggested practices from AI response
function extractPractices(text: string): Array<{id: string, title: string, description: string}> {
  const practices = [];
  
  // Look for practice suggestions in different formats
  
  // Pattern 1: Numbered practices
  const numberedPractices = text.match(/\d+\.\s+([\w\s]+):\s*([^.]+\.)/g);
  if (numberedPractices) {
    numberedPractices.forEach((match, index) => {
      const titleMatch = match.match(/\d+\.\s+([\w\s]+):/);
      const descriptionMatch = match.match(/:\s*([^.]+\.)/);
      
      if (titleMatch && titleMatch[1] && descriptionMatch && descriptionMatch[1]) {
        practices.push({
          id: `practice-${Date.now()}-${index}`,
          title: titleMatch[1].trim(),
          description: descriptionMatch[1].trim()
        });
      }
    });
  }
  
  // Pattern 2: "Practice:" or "Exercise:" followed by text
  const labeledPractices = text.match(/(?:Practice|Exercise|Technique):\s*([^.]+\.)/gi);
  if (labeledPractices) {
    labeledPractices.forEach((match, index) => {
      const labelMatch = match.match(/(?:Practice|Exercise|Technique):/i);
      const descriptionText = match.replace(labelMatch?.[0] || '', '').trim();
      
      if (descriptionText) {
        practices.push({
          id: `labeled-practice-${Date.now()}-${index}`,
          title: `${labelMatch?.[0].replace(':', '') || 'Practice'} ${index + 1}`,
          description: descriptionText
        });
      }
    });
  }
  
  return practices;
}

// Extract chakra focus from AI response
function extractChakraFocus(text: string): string[] {
  const chakras = ['root', 'sacral', 'solar plexus', 'heart', 'throat', 'third eye', 'crown'];
  const mentioned = new Set<string>();
  
  chakras.forEach(chakra => {
    const regex = new RegExp(`\\b${chakra}\\b`, 'i');
    if (regex.test(text)) {
      mentioned.add(chakra);
    }
  });
  
  return Array.from(mentioned);
}

// Extract emotional guidance from AI response
function extractEmotionalGuidance(text: string): string {
  // Look for sentences containing emotional guidance keywords
  const emotionalKeywords = ['feel', 'emotion', 'emotional', 'feeling', 'heart', 'compassion', 'love'];
  
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  for (const sentence of sentences) {
    // Check if the sentence contains emotional keywords
    if (emotionalKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      return sentence.trim();
    }
  }
  
  return '';
}
