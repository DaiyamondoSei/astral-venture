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
        JSON.stringify({ error: "Missing required fields: userId and practiceId" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Tracking practice completion: userId=${userId}, practiceId=${practiceId}`);
    
    // Get practice details
    const { data: practice, error: practiceError } = await supabase
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
    
    // Calculate energy points
    const energyPointsEarned = practice.energy_points;
    
    // Record completion
    const { data: completion, error: completionError } = await supabase
      .from('practice_completions')
      .insert({
        user_id: userId,
        practice_id: practiceId,
        duration: duration || practice.duration,
        energy_points_earned: energyPointsEarned,
        reflection: reflection || null,
        practice_type: practice.type
      })
      .select()
      .single();
    
    if (completionError) {
      return new Response(
        JSON.stringify({ error: "Error recording completion: " + completionError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Add energy points to user
    const { error: pointsError } = await supabase
      .from('user_profiles')
      .update({ 
        energy_points: supabase.rpc('increment_points', { 
          row_id: userId, 
          points_to_add: energyPointsEarned 
        }),
        last_active_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (pointsError) {
      console.error("Error updating user points:", pointsError);
      // Continue despite points error
    }
    
    // Update streak
    await updateUserStreak(supabase, userId);
    
    // Check for achievements
    await checkForAchievements(supabase, userId, practice.type);
    
    // Return success with completion details
    return new Response(
      JSON.stringify({ 
        success: true, 
        completion: {
          id: completion.id,
          completedAt: completion.completed_at,
          energyPointsEarned
        }
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
 * Update the user's streak information
 */
async function updateUserStreak(supabase: any, userId: string): Promise<void> {
  try {
    // Check current streak
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') {
      console.error("Error fetching streak:", streakError);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // If no streak record exists, create one
    if (!streakData) {
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
    
    // Calculate if streak continues or resets
    const lastActivityDate = streakData.last_activity_date ? 
      new Date(streakData.last_activity_date) : 
      new Date(0);
    
    const lastActivityDay = lastActivityDate.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    let newStreak = streakData.current_streak;
    
    // If last activity was today, streak doesn't change
    if (lastActivityDay === today) {
      return;
    }
    // If last activity was yesterday, streak increases
    else if (lastActivityDay === yesterdayString) {
      newStreak += 1;
    }
    // Otherwise, streak resets to 1
    else {
      newStreak = 1;
    }
    
    // Calculate longest streak
    const longestStreak = Math.max(newStreak, streakData.longest_streak || 0);
    
    // Update streak record
    await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today
      })
      .eq('user_id', userId);
    
    // Check for streak achievements
    if (newStreak >= 30) {
      await updateAchievement(supabase, userId, 'thirty_day_streak', 1, true);
    }
    else if (newStreak >= 7) {
      await updateAchievement(supabase, userId, 'seven_day_streak', 1, true);
    }
    else if (newStreak >= 3) {
      await updateAchievement(supabase, userId, 'three_day_streak', 1, true);
    }
    
  } catch (error) {
    console.error("Error updating streak:", error);
  }
}

/**
 * Check for and update practice-related achievements
 */
async function checkForAchievements(supabase: any, userId: string, practiceType: string): Promise<void> {
  try {
    // Check first practice achievement
    if (practiceType === 'meditation') {
      await updateAchievement(supabase, userId, 'first_meditation', 1, true);
    } else if (practiceType === 'quantum-task') {
      await updateAchievement(supabase, userId, 'first_quantum-task', 1, true);
    }
    
    // Count total practices by type
    const { count: meditationCount, error: meditationError } = await supabase
      .from('practice_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('practice_type', 'meditation');
    
    if (!meditationError) {
      if (meditationCount >= 20) {
        await updateAchievement(supabase, userId, 'meditation_20_completed', 1, true);
      }
      else if (meditationCount >= 5) {
        await updateAchievement(supabase, userId, 'meditation_5_completed', 1, true);
      }
    }
    
    const { count: taskCount, error: taskError } = await supabase
      .from('practice_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('practice_type', 'quantum-task');
    
    if (!taskError) {
      if (taskCount >= 20) {
        await updateAchievement(supabase, userId, 'quantum_task_master', 1, true);
      }
      else if (taskCount >= 5) {
        await updateAchievement(supabase, userId, 'quantum_task_5_completed', 1, true);
      }
    }
    
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
}

/**
 * Update achievement progress or award achievement
 */
async function updateAchievement(
  supabase: any, 
  userId: string, 
  achievementId: string, 
  progress: number, 
  autoAward: boolean
): Promise<void> {
  try {
    await supabase.rpc('update_achievement_progress', {
      user_id_param: userId,
      achievement_id_param: achievementId,
      progress_value: progress,
      auto_award: autoAward
    });
  } catch (error) {
    console.error(`Error updating achievement ${achievementId}:`, error);
  }
}
