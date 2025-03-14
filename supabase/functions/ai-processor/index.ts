
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Supabase client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Define AI models
const AI_MODELS = {
  DEFAULT: 'gpt-4o',
  EFFICIENT: 'gpt-4o-mini',
  VISION: 'gpt-4-vision-preview'
};

// Define processing types
type ProcessingType = 
  | 'emotion-analysis'
  | 'chakra-prediction'
  | 'content-recommendation'
  | 'progress-summary'
  | 'meditation-guide'
  | 'reflection-analysis';

interface AIProcessingRequest {
  processingType: ProcessingType;
  userId: string;
  content?: string;
  contentIds?: string[];
  options?: Record<string, any>;
  model?: string;
}

// OpenAI API call with retry logic
async function callOpenAI(
  model: string,
  messages: any[],
  options: Record<string, any> = {}
) {
  const maxRetries = 3;
  let retryCount = 0;
  let delay = 1000;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages,
          ...options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        
        // Handle rate limiting with exponential backoff
        if (response.status === 429) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
        
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

// Process emotional analysis
async function processEmotionalAnalysis(
  userId: string, 
  content: string,
  options: Record<string, any> = {}
) {
  // Get user's recent reflections if not provided
  let reflectionContent = content;
  
  if (!reflectionContent) {
    const { data: reflections } = await supabaseAdmin
      .from('energy_reflections')
      .select('content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    reflectionContent = reflections?.map(r => r.content).join('\n\n') || '';
  }
  
  if (!reflectionContent) {
    return { error: 'No content to analyze' };
  }
  
  // Define the system prompt for emotional analysis
  const systemPrompt = `You are an expert emotional analyst specializing in meditation and spiritual practices.
Analyze the text for emotional patterns, depth, and consciousness insights.
Respond in JSON format with these fields:
- dominant_emotion: The primary emotion expressed
- emotional_depth: A 1-10 rating of emotional depth
- emotional_patterns: Array of identified emotional patterns
- consciousness_insights: Array of insights about the person's consciousness level
- chakra_activation: Object with keys for each chakra (root, sacral, solar, heart, throat, third_eye, crown) and values from 0-10 representing activation level
- recommended_practices: Array of recommended practices based on emotional state`;

  try {
    const completion = await callOpenAI(
      options.model || AI_MODELS.EFFICIENT,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: reflectionContent }
      ],
      { 
        response_format: { type: 'json_object' },
        temperature: 0.4
      }
    );
    
    const analysisResult = JSON.parse(completion.choices[0].message.content);
    
    // Store the analysis in the database
    await supabaseAdmin
      .from('emotional_analysis')
      .insert({
        user_id: userId,
        analysis_data: analysisResult
      });
      
    return analysisResult;
  } catch (error) {
    console.error('Error in emotional analysis:', error);
    return { error: 'Failed to analyze emotions' };
  }
}

// Process chakra prediction
async function processChakraPrediction(
  userId: string,
  options: Record<string, any> = {}
) {
  try {
    // Get user's recent activities and reflections
    const { data: reflections } = await supabaseAdmin
      .from('energy_reflections')
      .select('content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    const { data: activities } = await supabaseAdmin
      .from('user_activities')
      .select('activity_type, metadata, timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10);
      
    const { data: currentChakraSystem } = await supabaseAdmin
      .from('chakra_systems')
      .select('chakras, overall_balance, dominant_chakra')
      .eq('user_id', userId)
      .single();
    
    // Prepare the context for the AI
    const userContext = {
      reflections: reflections || [],
      activities: activities || [],
      currentChakraSystem: currentChakraSystem || {
        chakras: {},
        overall_balance: 0,
        dominant_chakra: null
      }
    };
    
    // Define the system prompt for chakra prediction
    const systemPrompt = `You are an expert chakra analyst specializing in energy balancing and spiritual practices.
Based on the user's activities, reflections, and current chakra system, predict optimal chakra activations.
Respond in JSON format with these fields:
- recommended_chakras: Object with keys for each chakra (root, sacral, solar, heart, throat, third_eye, crown) and values from 0-10 representing recommended activation level
- imbalances: Array of detected chakra imbalances
- suggested_focus: The primary chakra to focus on
- practices: Array of recommended practices for chakra balance
- predicted_benefits: Array of benefits the user might experience from following recommendations`;

    const completion = await callOpenAI(
      options.model || AI_MODELS.EFFICIENT,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userContext) }
      ],
      { 
        response_format: { type: 'json_object' },
        temperature: 0.3
      }
    );
    
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error in chakra prediction:', error);
    return { error: 'Failed to predict chakra activations' };
  }
}

// Process content recommendation
async function processContentRecommendation(
  userId: string,
  options: Record<string, any> = {}
) {
  try {
    // Get user's preferences
    const { data: preferences } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    // Get user's recent activities
    const { data: activities } = await supabaseAdmin
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10);
      
    // Get user's chakra system
    const { data: chakraSystem } = await supabaseAdmin
      .from('chakra_systems')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    // Get available content
    const { data: availableContent } = await supabaseAdmin
      .from('content_library')
      .select('*')
      .limit(100);
    
    // Prepare the context for the AI
    const userContext = {
      preferences: preferences || { preferences: {} },
      activities: activities || [],
      chakraSystem: chakraSystem || { chakras: {} },
      contentOptions: availableContent || []
    };
    
    // Define the system prompt for content recommendations
    const systemPrompt = `You are a personalized content recommendation system specialized in spiritual development.
Based on the user's preferences, activities, and chakra system, recommend the most relevant content.
Respond in JSON format with these fields:
- recommendations: Array of recommended content items, each with:
  - id: ID of the content item
  - relevance_score: 1-100 score of how relevant the item is
  - relevance_reason: Brief explanation of why this content is relevant
- chakra_alignment: Which chakras will benefit most from these recommendations
- emotional_resonance: What emotional states these recommendations target
- practice_duration: Suggested practice duration in minutes`;

    const completion = await callOpenAI(
      options.model || AI_MODELS.EFFICIENT,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userContext) }
      ],
      { 
        response_format: { type: 'json_object' },
        temperature: 0.3
      }
    );
    
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error in content recommendation:', error);
    return { error: 'Failed to generate content recommendations' };
  }
}

// Process reflection analysis
async function processReflectionAnalysis(
  userId: string,
  content: string,
  options: Record<string, any> = {}
) {
  if (!content) {
    return { error: 'No content to analyze' };
  }
  
  try {
    // Define the system prompt for reflection analysis
    const systemPrompt = `You are an expert spiritual guide who helps users gain deeper insights from their reflections.
Analyze the reflection and provide meaningful insights about the user's consciousness journey.
Respond in JSON format with these fields:
- key_insights: Array of main insights from the reflection
- consciousness_level: Assessment of consciousness level (awakening, expanding, enlightening, transforming, transcending)
- growth_opportunities: Areas where the user can grow based on this reflection
- chakra_activations: Object with keys for each chakra and values 0-10 representing activation in this reflection
- recommended_focus: Suggested focus areas for continued growth
- spiritual_themes: Main spiritual themes identified in the reflection`;

    const completion = await callOpenAI(
      options.model || AI_MODELS.DEFAULT,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content }
      ],
      { 
        response_format: { type: 'json_object' },
        temperature: 0.4
      }
    );
    
    const analysisResult = JSON.parse(completion.choices[0].message.content);
    
    // Store the analysis alongside the reflection
    if (options.reflectionId) {
      await supabaseAdmin
        .from('energy_reflections')
        .update({
          analysis: analysisResult
        })
        .eq('id', options.reflectionId)
        .eq('user_id', userId);
    }
    
    return analysisResult;
  } catch (error) {
    console.error('Error in reflection analysis:', error);
    return { error: 'Failed to analyze reflection' };
  }
}

// Process meditation guide
async function processMeditationGuide(
  userId: string,
  options: Record<string, any> = {}
) {
  try {
    // Get user's chakra system
    const { data: chakraSystem } = await supabaseAdmin
      .from('chakra_systems')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Get user's recent activities
    const { data: activities } = await supabaseAdmin
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(5);
    
    // Prepare context for the AI
    const userContext = {
      chakraSystem: chakraSystem || { chakras: {} },
      activities: activities || [],
      focusAreas: options.focusAreas || [],
      duration: options.duration || 10, // minutes
      meditationType: options.meditationType || 'guided'
    };
    
    // Define the system prompt for meditation guide
    const systemPrompt = `You are an expert meditation guide specialized in chakra-focused meditation.
Create a personalized meditation script based on the user's chakra system and recent activities.
Respond in JSON format with these fields:
- title: A title for this meditation
- introduction: Brief introduction to set the tone
- stages: Array of meditation stages, each with:
  - name: Name of this stage
  - duration: Suggested duration in minutes
  - guidance: The guidance text for this stage
- chakra_focus: Primary chakras being targeted
- benefits: Expected benefits from this meditation
- closing: Closing guidance to end the meditation`;

    const completion = await callOpenAI(
      options.model || AI_MODELS.DEFAULT,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userContext) }
      ],
      { 
        response_format: { type: 'json_object' },
        temperature: 0.5
      }
    );
    
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error in meditation guide generation:', error);
    return { error: 'Failed to generate meditation guide' };
  }
}

// Process progress summary
async function processProgressSummary(
  userId: string,
  options: Record<string, any> = {}
) {
  try {
    // Get user's progress data
    const { data: practices } = await supabaseAdmin
      .from('practice_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(20);
    
    // Get user's reflections
    const { data: reflections } = await supabaseAdmin
      .from('energy_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Get user's chakra system
    const { data: chakraSystem } = await supabaseAdmin
      .from('chakra_systems')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Get user's achievements
    const { data: achievements } = await supabaseAdmin
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('awarded', true)
      .order('awarded_at', { ascending: false });
    
    // Prepare context for the AI
    const userContext = {
      practices: practices || [],
      reflections: reflections || [],
      chakraSystem: chakraSystem || { chakras: {} },
      achievements: achievements || [],
      timeFrame: options.timeFrame || 'week'
    };
    
    // Define the system prompt for progress summary
    const systemPrompt = `You are a spiritual progress advisor specialized in tracking and analyzing spiritual growth.
Create a personalized progress summary based on the user's practices, reflections, chakra system, and achievements.
Respond in JSON format with these fields:
- summary: Brief summary of overall progress
- key_metrics: Object with important progress metrics
- growth_areas: Array of areas showing growth
- challenge_areas: Array of areas needing attention
- streak_quality: Assessment of practice consistency and quality
- consciousness_evolution: Description of how consciousness is evolving
- recommendations: Array of specific recommendations for continued growth
- milestones: Key milestones achieved in this period`;

    const completion = await callOpenAI(
      options.model || AI_MODELS.DEFAULT,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userContext) }
      ],
      { 
        response_format: { type: 'json_object' },
        temperature: 0.4
      }
    );
    
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error in progress summary generation:', error);
    return { error: 'Failed to generate progress summary' };
  }
}

// Main request handler
async function handleRequest(req: Request) {
  try {
    const { processingType, userId, content, contentIds, options, model } = await req.json() as AIProcessingRequest;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    let result;
    
    // Process based on type
    switch (processingType) {
      case 'emotion-analysis':
        result = await processEmotionalAnalysis(userId, content || '', options);
        break;
        
      case 'chakra-prediction':
        result = await processChakraPrediction(userId, options);
        break;
        
      case 'content-recommendation':
        result = await processContentRecommendation(userId, options);
        break;
        
      case 'reflection-analysis':
        if (!content) {
          return new Response(
            JSON.stringify({ error: 'Content is required for reflection analysis' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        result = await processReflectionAnalysis(userId, content, options);
        break;
        
      case 'meditation-guide':
        result = await processMeditationGuide(userId, options);
        break;
        
      case 'progress-summary':
        result = await processProgressSummary(userId, options);
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid processing type' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }
    
    // Return the result
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}

// Handle CORS preflight requests
function handleCORS(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  return null;
}

// Main server function
serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;
  
  // Process the request
  return handleRequest(req);
});
