import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
function handleCorsRequest(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Authorization middleware
async function withAuth(req: Request, handler: Function): Promise<Response> {
  try {
    // Get JWT token from request
    const authorization = req.headers.get('Authorization') || '';
    if (!authorization.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authorization.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Call the handler with the authenticated user
    return await handler(user, req);
  } catch (error) {
    console.error("Auth error:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error during authentication' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Process portal interaction
async function processPortalInteraction(user: any, req: Request): Promise<Response> {
  try {
    const { userId, userLevel = 1 } = await req.json();
    
    // Validate the request
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verify the user ID matches the authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "User ID mismatch" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Get existing portal state or create a new one
    const { data: portalState, error: portalError } = await supabaseAdmin
      .from('user_energy_interactions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    let updatedPortalState;
    
    if (portalError && portalError.code === 'PGRST116') {
      // Portal state not found, create a new one
      const { data: newPortalState, error: createError } = await supabaseAdmin
        .from('user_energy_interactions')
        .insert({
          user_id: userId,
          portal_energy: 5, // Initial interaction gives 5 energy
          interaction_count: 1,
          resonance_level: 1,
          last_interaction_time: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        return new Response(
          JSON.stringify({ error: "Failed to create portal state", details: createError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      updatedPortalState = newPortalState;
    } else if (portalError) {
      return new Response(
        JSON.stringify({ error: "Failed to retrieve portal state", details: portalError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Calculate energy increment based on user level and current resonance
      const baseIncrement = 2;
      const levelMultiplier = Math.max(1, Math.sqrt(userLevel));
      const resonanceMultiplier = portalState.resonance_level * 0.2 + 1;
      
      // Calculate energy to add (with some randomness for engagement)
      const energyToAdd = Math.round(
        baseIncrement * levelMultiplier * resonanceMultiplier * (0.8 + Math.random() * 0.4)
      );
      
      // Calculate new energy (cap at 100)
      const newEnergy = Math.min(100, portalState.portal_energy + energyToAdd);
      
      // Check if resonance level should increase (every 10 interactions)
      const newInteractionCount = portalState.interaction_count + 1;
      let newResonanceLevel = portalState.resonance_level;
      
      if (newInteractionCount % 10 === 0 && newResonanceLevel < 10) {
        newResonanceLevel += 1;
      }
      
      // Update portal state
      const { data: updatedState, error: updateError } = await supabaseAdmin
        .from('user_energy_interactions')
        .update({
          portal_energy: newEnergy,
          interaction_count: newInteractionCount,
          resonance_level: newResonanceLevel,
          last_interaction_time: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update portal state", details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      updatedPortalState = updatedState;
    }
    
    // Prepare response
    const response = {
      portalEnergy: updatedPortalState.portal_energy,
      interactionCount: updatedPortalState.interaction_count,
      resonanceLevel: updatedPortalState.resonance_level,
      lastInteractionTime: updatedPortalState.last_interaction_time
    };
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing portal interaction:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Main edge function handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }
  
  // Process with authentication
  return withAuth(req, processPortalInteraction);
});
