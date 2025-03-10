
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from '@supabase/supabase-js';

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { message, userId, context, intentType = "general" } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
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
        
        // Fetch user profile for personalization
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('astral_level, energy_points')
          .eq('id', userId)
          .single();
        
        userProfile = profile;
        
        // Fetch chakra data if available
        const { data: chakras } = await supabase
          .from('chakra_systems')
          .select('chakras, dominant_chakra')
          .eq('user_id', userId)
          .single();
        
        userChakras = chakras;
        
        // Fetch recent reflections for context
        const { data: reflections } = await supabase
          .from('energy_reflections')
          .select('content, dominant_emotion, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3);
        
        recentReflections = reflections;
      }
    }
    
    // Build the system prompt with personalization
    const systemPrompt = buildSystemPrompt(userProfile, userChakras, intentType);
    
    // Build the user message with additional context
    const enhancedMessage = buildEnhancedMessage(message, context, recentReflections);
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model: selectModel(userProfile, message),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: enhancedMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Process the response to extract insights and other structured data
    const processedResponse = processAIResponse(aiResponse, intentType);
    
    // Log this interaction for analytics
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false }
        });
        
        await supabase.from('user_activities').insert({
          user_id: userId,
          activity_type: 'divine_guidance',
          metadata: {
            intent_type: intentType,
            message_length: message.length,
            response_length: aiResponse.length,
            response_processed: true
          }
        });
      }
    }
    
    return new Response(
      JSON.stringify(processedResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
  
  // Use more powerful model for advanced users or complex queries
  if (astralLevel >= 5 || messageLength > 100 || containsComplexConcepts) {
    return "gpt-4o";
  }
  
  // Use standard model for most interactions
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
          id: `practice-${index}`,
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
          id: `labeled-practice-${index}`,
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
