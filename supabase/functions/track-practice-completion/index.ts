
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request body
    const { userId, practiceId, duration, reflection } = await req.json();
    
    // Validate inputs
    if (!userId || !practiceId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID or practice ID" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing practice completion for user ${userId}, practice ${practiceId}`);
    
    // Get practice details
    const { data: practiceData, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .eq('id', practiceId)
      .single();
    
    if (practiceError) {
      return new Response(
        JSON.stringify({ error: "Error fetching practice: " + practiceError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate energy points to award
    let energyPointsEarned = practiceData.energy_points || 10;
    
    // Bonus points for reflection
    if (reflection && reflection.length > 20) {
      energyPointsEarned += 5;
    }
    
    // Bonus points for longer duration than minimum
    if (duration > practiceData.duration) {
      energyPointsEarned += Math.floor((duration - practiceData.duration) / 5) * 3;
    }
    
    // Record the practice completion
    const { data: completionData, error: completionError } = await supabase
      .from('practice_completions')
      .insert({
        user_id: userId,
        practice_id: practiceId,
        duration: duration,
        energy_points_earned: energyPointsEarned,
        reflection: reflection,
        chakras_activated: practiceData.chakra_association,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (completionError) {
      return new Response(
        JSON.stringify({ error: "Error recording completion: " + completionError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Practice completion recorded, awarding ${energyPointsEarned} energy points`);
    
    // Update user streak
    await updateUserStreak(supabase, userId);
    
    // Award energy points
    await awardEnergyPoints(supabase, userId, energyPointsEarned, practiceData.type);
    
    // Check achievements
    await checkPracticeAchievements(supabase, userId, practiceData.type);
    
    return new Response(
      JSON.stringify({
        success: true,
        completionId: completionData.id,
        energyPointsEarned,
        message: `Practice completed successfully. Earned ${energyPointsEarned} energy points.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error processing practice completion:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Update user streak based on practice completion
 */
async function updateUserStreak(supabase: any, userId: string) {
  try {
    // Get existing streak info
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') {
      console.error("Error fetching streak:", streakError);
      return;
    }
    
    // Current date in user's timezone (defaulting to UTC)
    const today = new Date().toISOString().split('T')[0];
    
    if (!streakData) {
      // Create new streak entry
      await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today
        });
      return;
    }
    
    // If already completed practice today, no streak update needed
    if (streakData.last_activity_date === today) {
      return;
    }
    
    const lastActivityDate = streakData.last_activity_date 
      ? new Date(streakData.last_activity_date) 
      : null;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = streakData.current_streak || 0;
    
    // If last activity was yesterday, increment streak
    if (lastActivityDate && lastActivityDate.toISOString().split('T')[0] === yesterdayStr) {
      newStreak += 1;
    } else if (!lastActivityDate || lastActivityDate.toISOString().split('T')[0] !== today) {
      // If last activity wasn't today or yesterday, reset streak
      newStreak = 1;
    }
    
    // Update streak info
    await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streakData.longest_streak || 0),
        last_activity_date: today
      })
      .eq('user_id', userId);
    
    console.log(`Updated streak for user ${userId}: ${newStreak}`);
    
  } catch (error) {
    console.error("Error updating streak:", error);
  }
}

/**
 * Award energy points to user
 */
async function awardEnergyPoints(supabase: any, userId: string, points: number, activityType: string) {
  try {
    // Increment energy points directly in user_profiles
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        energy_points: supabase.rpc('increment_points', { row_id: userId, points_to_add: points }),
        last_active_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Error updating energy points:", updateError);
      return;
    }
    
    // Record in energy points history
    await supabase
      .from('energy_points_history')
      .insert({
        user_id: userId,
        points_added: points,
        source: `practice_${activityType}`,
        new_total: supabase.rpc('get_total_points', { user_id_param: userId })
      });
    
    console.log(`Awarded ${points} energy points to user ${userId}`);
    
  } catch (error) {
    console.error("Error awarding energy points:", error);
  }
}

/**
 * Check for practice-related achievements
 */
async function checkPracticeAchievements(supabase: any, userId: string, practiceType: string) {
  try {
    // Get count of user's completed practices by type
    const { data: counts, error: countsError } = await supabase
      .from('practice_completions')
      .select('practice_id')
      .eq('user_id', userId)
      .eq('practice_type', practiceType);
    
    if (countsError) {
      console.error("Error fetching practice counts:", countsError);
      return;
    }
    
    const practiceCount = counts.length;
    
    // Check for first practice achievement
    if (practiceCount === 1) {
      await awardAchievement(supabase, userId, `first_${practiceType}`);
    }
    
    // Check for practice milestone achievements
    if (practiceType === 'meditation') {
      if (practiceCount >= 5) {
        await awardAchievement(supabase, userId, 'meditation_5_completed');
      }
      if (practiceCount >= 20) {
        await awardAchievement(supabase, userId, 'meditation_20_completed');
      }
    } else if (practiceType === 'quantum-task') {
      if (practiceCount >= 5) {
        await awardAchievement(supabase, userId, 'quantum_task_5_completed');
      }
      if (practiceCount >= 20) {
        await awardAchievement(supabase, userId, 'quantum_task_master');
      }
    }
    
    // Check streak achievements
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .single();
    
    if (streakError) {
      console.error("Error fetching streak data:", streakError);
      return;
    }
    
    if (streakData.current_streak >= 3) {
      await awardAchievement(supabase, userId, 'three_day_streak');
    }
    
    if (streakData.current_streak >= 7) {
      await awardAchievement(supabase, userId, 'seven_day_streak');
    }
    
    if (streakData.longest_streak >= 30) {
      await awardAchievement(supabase, userId, 'thirty_day_streak');
    }
    
    console.log(`Checked practice achievements for user ${userId}`);
    
  } catch (error) {
    console.error("Error checking practice achievements:", error);
  }
}

/**
 * Award an achievement to a user
 */
async function awardAchievement(supabase: any, userId: string, achievementId: string) {
  try {
    // Check if achievement already awarded
    const { data: existingAchievement, error: checkError } = await supabase
      .from('user_achievements')
      .select('awarded')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();
    
    if (!checkError && existingAchievement && existingAchievement.awarded) {
      return; // Already awarded
    }
    
    // Check if achievement exists
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();
    
    if (achievementError) {
      console.error(`Achievement ${achievementId} not found:`, achievementError);
      return;
    }
    
    // Award the achievement
    const { error: awardError } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        progress: 1,
        awarded: true,
        awarded_at: new Date().toISOString(),
        achievement_data: achievement
      }, {
        onConflict: 'user_id,achievement_id'
      });
    
    if (awardError) {
      console.error(`Error awarding achievement ${achievementId}:`, awardError);
      return;
    }
    
    console.log(`Awarded achievement ${achievementId} to user ${userId}`);
    
  } catch (error) {
    console.error(`Error in awardAchievement for ${achievementId}:`, error);
  }
}
