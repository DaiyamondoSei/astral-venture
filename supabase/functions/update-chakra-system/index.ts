
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Entry point for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body
    const { 
      userId, 
      chakraId, 
      actionType, 
      practiceId, 
      meditationDuration,
      reflectionContent
    } = await req.json();

    // Validate required parameters
    if (!userId || !chakraId || !actionType) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current chakra system or create default
    const { data: existingSystem, error: fetchError } = await supabase
      .from('chakra_systems')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw fetchError;
    }

    // If no system exists, create a default one
    let chakraSystem = existingSystem;
    if (!chakraSystem) {
      // Default chakra status
      const defaultStatus = {
        activationLevel: 20,
        balance: 50,
        blockages: [],
        strengths: []
      };

      // Create default chakra system with all chakras at baseline activation
      chakraSystem = {
        user_id: userId,
        overall_balance: 50,
        chakras: {
          'root': { ...defaultStatus },
          'sacral': { ...defaultStatus },
          'solar': { ...defaultStatus },
          'heart': { ...defaultStatus },
          'throat': { ...defaultStatus },
          'third-eye': { ...defaultStatus },
          'crown': { ...defaultStatus }
        },
        dominant_chakra: null,
        last_updated: new Date().toISOString()
      };
    }

    // Helper function to calculate if a chakra should become dominant
    const recalculateDominantChakra = (chakras: any) => {
      let highestActivation = 0;
      let dominantChakra = null;
      
      Object.entries(chakras).forEach(([id, status]: [string, any]) => {
        if (status.activationLevel > highestActivation) {
          highestActivation = status.activationLevel;
          dominantChakra = id;
        }
      });
      
      return dominantChakra;
    };

    // Process different action types
    let energyPointsAwarded = 0;
    let chakraActivationChange = 0;

    switch (actionType) {
      case 'practice':
        // Award energy points based on practice
        if (!practiceId) {
          throw new Error("Practice ID is required for practice action");
        }
        
        // Lookup practice energy points - could be stored in a table or hardcoded
        energyPointsAwarded = 15; // Default value, could be looked up based on practiceId
        chakraActivationChange = 5;
        break;
        
      case 'meditation':
        // Award energy points based on meditation duration
        if (!meditationDuration) {
          throw new Error("Meditation duration is required for meditation action");
        }
        
        energyPointsAwarded = Math.floor(meditationDuration / 5) * 10;
        chakraActivationChange = Math.floor(meditationDuration / 10) * 3;
        break;
        
      case 'reflection':
        // Award energy points based on reflection
        if (!reflectionContent) {
          throw new Error("Reflection content is required for reflection action");
        }
        
        const wordCount = reflectionContent.split(/\s+/).length;
        energyPointsAwarded = Math.min(30, Math.floor(wordCount / 10) * 5);
        chakraActivationChange = Math.min(10, Math.floor(wordCount / 20) * 2);
        break;
        
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }

    // Update the chakra activation
    if (chakraSystem.chakras[chakraId]) {
      chakraSystem.chakras[chakraId].activationLevel = Math.min(
        100, 
        chakraSystem.chakras[chakraId].activationLevel + chakraActivationChange
      );
      
      // Add to strengths if activation is high enough
      if (chakraSystem.chakras[chakraId].activationLevel >= 75 && 
          !chakraSystem.chakras[chakraId].strengths.includes('highly_activated')) {
        chakraSystem.chakras[chakraId].strengths.push('highly_activated');
      }
    }

    // Recalculate dominant chakra
    chakraSystem.dominant_chakra = recalculateDominantChakra(chakraSystem.chakras);
    chakraSystem.last_updated = new Date().toISOString();

    // Update chakra system in database
    const { error: updateError } = await supabase
      .from('chakra_systems')
      .upsert(chakraSystem);

    if (updateError) {
      throw updateError;
    }

    // Award energy points to user
    if (energyPointsAwarded > 0) {
      // Get current user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('energy_points')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Update energy points
      const newTotal = (userProfile?.energy_points || 0) + energyPointsAwarded;
      
      const { error: pointsError } = await supabase
        .from('user_profiles')
        .update({ energy_points: newTotal })
        .eq('id', userId);

      if (pointsError) {
        throw pointsError;
      }

      // Record energy points transaction
      const { error: historyError } = await supabase
        .from('energy_points_history')
        .insert({
          user_id: userId,
          points_added: energyPointsAwarded,
          new_total: newTotal,
          source: `chakra_${actionType}_${chakraId}`
        });

      if (historyError) {
        throw historyError;
      }
    }

    // Check for achievements
    await checkForChakraAchievements(supabase, userId, chakraSystem);

    return new Response(
      JSON.stringify({ 
        success: true, 
        chakraSystem, 
        energyPointsAwarded 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in update-chakra-system function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Check and award chakra-related achievements
 */
async function checkForChakraAchievements(supabase: any, userId: string, chakraSystem: any) {
  // Define achievement checks
  const achievementChecks = [
    {
      id: 'chakra_first_activation',
      check: () => Object.values(chakraSystem.chakras).some((c: any) => c.activationLevel >= 50),
      progress: 1
    },
    {
      id: 'chakra_three_activated',
      check: () => Object.values(chakraSystem.chakras).filter((c: any) => c.activationLevel >= 50).length >= 3,
      progress: Object.values(chakraSystem.chakras).filter((c: any) => c.activationLevel >= 50).length / 3
    },
    {
      id: 'chakra_all_activated',
      check: () => Object.values(chakraSystem.chakras).every((c: any) => c.activationLevel >= 50),
      progress: Object.values(chakraSystem.chakras).filter((c: any) => c.activationLevel >= 50).length / 7
    },
    {
      id: 'chakra_master',
      check: () => Object.values(chakraSystem.chakras).every((c: any) => c.activationLevel >= 75),
      progress: Object.values(chakraSystem.chakras).filter((c: any) => c.activationLevel >= 75).length / 7
    }
  ];

  // Check each achievement
  for (const achievement of achievementChecks) {
    // Check if achievement exists already
    const { data: existingAchievement, error: fetchError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievement.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error(`Error checking achievement ${achievement.id}:`, fetchError);
      continue;
    }

    const isMet = achievement.check();
    const progress = Math.min(1, achievement.progress);

    if (!existingAchievement) {
      // Create new achievement entry
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          progress: progress,
          awarded: isMet,
          awarded_at: isMet ? new Date().toISOString() : null
        });
    } else if (!existingAchievement.awarded && isMet) {
      // Update achievement to awarded status
      await supabase
        .from('user_achievements')
        .update({
          progress: 1,
          awarded: true,
          awarded_at: new Date().toISOString()
        })
        .eq('id', existingAchievement.id);
    } else if (!existingAchievement.awarded) {
      // Update progress
      await supabase
        .from('user_achievements')
        .update({
          progress: Math.max(existingAchievement.progress, progress)
        })
        .eq('id', existingAchievement.id);
    }
  }
}
