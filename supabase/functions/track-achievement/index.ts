
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client with the auth context of the function
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Achievement detection logic - moved from frontend to backend
const detectAchievements = (eventType, eventData, userAchievements) => {
  const newAchievements = [];
  
  // Sample achievement rules
  switch (eventType) {
    case 'streak_updated':
      const { currentStreak } = eventData;
      
      // Streak achievements
      if (currentStreak >= 3 && !hasAchievement(userAchievements, 'streak_3_days')) {
        newAchievements.push({
          id: 'streak_3_days',
          title: '3-Day Streak',
          description: 'Maintained practice for 3 consecutive days',
          points: 10,
          icon: 'flame'
        });
      }
      
      if (currentStreak >= 7 && !hasAchievement(userAchievements, 'streak_7_days')) {
        newAchievements.push({
          id: 'streak_7_days',
          title: 'Weekly Dedication',
          description: 'Maintained practice for a full week',
          points: 25,
          icon: 'flame'
        });
      }
      
      if (currentStreak >= 30 && !hasAchievement(userAchievements, 'streak_30_days')) {
        newAchievements.push({
          id: 'streak_30_days',
          title: 'Monthly Master',
          description: 'Maintained practice for a full month',
          points: 100,
          icon: 'award'
        });
      }
      break;
      
    case 'reflection_milestone':
      const { count } = eventData;
      
      // Reflection count achievements
      if (count >= 5 && !hasAchievement(userAchievements, 'reflection_5')) {
        newAchievements.push({
          id: 'reflection_5',
          title: 'Reflection Beginner',
          description: 'Completed 5 reflections',
          points: 15,
          icon: 'book'
        });
      }
      
      if (count >= 20 && !hasAchievement(userAchievements, 'reflection_20')) {
        newAchievements.push({
          id: 'reflection_20',
          title: 'Reflection Explorer',
          description: 'Completed 20 reflections',
          points: 40,
          icon: 'book'
        });
      }
      
      if (count >= 50 && !hasAchievement(userAchievements, 'reflection_50')) {
        newAchievements.push({
          id: 'reflection_50',
          title: 'Reflection Master',
          description: 'Completed 50 reflections',
          points: 100,
          icon: 'award'
        });
      }
      break;
      
    case 'chakra_activated':
      const { chakraId, totalActivated } = eventData;
      
      // Chakra activation achievements
      if (totalActivated >= 3 && !hasAchievement(userAchievements, 'chakra_3')) {
        newAchievements.push({
          id: 'chakra_3',
          title: 'Energy Awakening',
          description: 'Activated 3 chakras',
          points: 30,
          icon: 'zap'
        });
      }
      
      if (totalActivated >= 7 && !hasAchievement(userAchievements, 'chakra_all')) {
        newAchievements.push({
          id: 'chakra_all',
          title: 'Full Spectrum',
          description: 'Activated all chakras',
          points: 100,
          icon: 'sun'
        });
      }
      break;
      
    default:
      // No achievements detected for this event type
      break;
  }
  
  return newAchievements;
}

// Helper to check if user already has an achievement
const hasAchievement = (userAchievements, achievementId) => {
  return userAchievements.some(a => a.achievement_id === achievementId && a.progress >= 1);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) {
      throw new Error('Error getting user or user not found');
    }
    
    // Get event data from request
    const { eventType, eventData } = await req.json();
    
    if (!eventType) {
      throw new Error('Missing event type');
    }
    
    console.log(`Processing achievement event: ${eventType} for user ${user.id}`);
    
    // Record the event
    const { data: eventData2, error: eventError } = await supabase
      .from('achievement_events')
      .insert({
        user_id: user.id,
        event_type: eventType,
        event_data: eventData || {},
        points_earned: 0, // Will be updated if achievements are earned
        created_at: new Date().toISOString()
      });
      
    if (eventError) {
      console.error('Error recording achievement event:', eventError);
    }
    
    // Get user's existing achievements
    const { data: userAchievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id);
      
    if (achievementsError) {
      console.error('Error fetching user achievements:', achievementsError);
      throw achievementsError;
    }
    
    // Detect achievements based on the event
    const newAchievements = detectAchievements(
      eventType, 
      eventData, 
      userAchievements || []
    );
    
    // Process new achievements
    if (newAchievements.length > 0) {
      // Insert new achievements
      const achievementInserts = newAchievements.map(achievement => ({
        user_id: user.id,
        achievement_id: achievement.id,
        unlocked_at: new Date().toISOString(),
        progress: 1,
        achievement_data: achievement
      }));
      
      const { data: insertedAchievements, error: insertError } = await supabase
        .from('user_achievements')
        .insert(achievementInserts)
        .select();
        
      if (insertError) {
        console.error('Error inserting achievements:', insertError);
        throw insertError;
      }
      
      // Calculate points earned
      const pointsEarned = newAchievements.reduce((sum, achievement) => sum + (achievement.points || 0), 0);
      
      // If points were earned, update user profile
      if (pointsEarned > 0) {
        const { error: updateError } = await supabase.rpc('add_energy_points', {
          user_id_param: user.id,
          points_param: pointsEarned
        });
        
        if (updateError) {
          console.error('Error updating energy points:', updateError);
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        unlockedAchievements: newAchievements,
        eventRecorded: !eventError
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error processing achievement event:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
})
