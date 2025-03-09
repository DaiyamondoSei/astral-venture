import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client with the auth context of the function
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

// Achievement rules for progression and unlocking
const achievementRules = {
  // Streak achievements
  'streak-3-days': {
    type: 'streak',
    threshold: 3,
    points: 10,
    title: '3-Day Streak'
  },
  'streak-7-days': {
    type: 'streak',
    threshold: 7,
    points: 25,
    title: '7-Day Streak'
  },
  'streak-30-days': {
    type: 'streak',
    threshold: 30,
    points: 100,
    title: '30-Day Streak'
  },
  
  // Reflection achievements
  'reflections-5': {
    type: 'reflection_count',
    threshold: 5,
    points: 15,
    title: '5 Reflections Completed'
  },
  'reflections-20': {
    type: 'reflection_count',
    threshold: 20,
    points: 50,
    title: '20 Reflections Milestone'
  },
  
  // Meditation achievements
  'meditation-60-minutes': {
    type: 'meditation_minutes',
    threshold: 60,
    points: 30,
    title: '1 Hour of Meditation'
  },
  'meditation-300-minutes': {
    type: 'meditation_minutes',
    threshold: 300,
    points: 100,
    title: 'Meditation Master'
  },
  
  // Chakra achievements
  'activate-3-chakras': {
    type: 'chakras_activated',
    threshold: 3,
    points: 25,
    title: 'Chakra Explorer'
  },
  'activate-all-chakras': {
    type: 'chakras_activated',
    threshold: 7,
    points: 100,
    title: 'Chakra Master'
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      throw new Error('Error getting user or user not found')
    }
    
    // Get the event data from the request
    const { eventType, eventData } = await req.json()
    
    if (!eventType) {
      throw new Error('Missing eventType in request')
    }
    
    console.log(`Processing achievement event ${eventType} for user ${user.id}`)
    
    // Store the event
    const { error: eventError } = await supabase
      .from('achievement_events')
      .insert({
        user_id: user.id,
        event_type: eventType,
        event_data: eventData || {},
        points_earned: eventData?.points || 0
      })
    
    if (eventError) {
      console.error('Error storing achievement event:', eventError)
    }
    
    // Process the event for achievements
    const unlockedAchievements = await processEventForAchievements(supabase, user.id, eventType, eventData)
    
    return new Response(
      JSON.stringify({
        success: true,
        eventProcessed: true,
        unlockedAchievements
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error processing achievement event:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

/**
 * Process an event for potential achievement unlocks
 */
async function processEventForAchievements(
  supabase: any,
  userId: string,
  eventType: string,
  eventData: any
): Promise<any[]> {
  const unlockedAchievements = []
  
  // Get the current user's progress metrics
  const progressMetrics = await getUserProgressMetrics(supabase, userId)
  
  // Update progress based on the event type
  switch (eventType) {
    case 'streak_updated':
      progressMetrics.currentStreak = eventData?.currentStreak || progressMetrics.currentStreak
      break
      
    case 'reflection_completed':
      progressMetrics.reflectionCount += 1
      break
      
    case 'meditation_completed':
      progressMetrics.meditationMinutes += (eventData?.duration || 0)
      break
      
    case 'chakra_activated':
      // Add to activated chakras if not already included
      const chakraId = eventData?.chakraId
      if (chakraId && !progressMetrics.activatedChakras.includes(chakraId)) {
        progressMetrics.activatedChakras.push(chakraId)
      }
      break
      
    case 'energy_points_earned':
      progressMetrics.energyPoints += (eventData?.points || 0)
      break
  }
  
  // Check for achievement unlocks based on updated metrics
  for (const [achievementId, rule] of Object.entries(achievementRules)) {
    // Skip if already unlocked
    const isUnlocked = await checkIfAchievementUnlocked(supabase, userId, achievementId)
    if (isUnlocked) continue
    
    let progress = 0
    let unlocked = false
    
    // Check if the achievement should be unlocked based on the rule type
    switch (rule.type) {
      case 'streak':
        progress = progressMetrics.currentStreak / rule.threshold
        unlocked = progressMetrics.currentStreak >= rule.threshold
        break
        
      case 'reflection_count':
        progress = progressMetrics.reflectionCount / rule.threshold
        unlocked = progressMetrics.reflectionCount >= rule.threshold
        break
        
      case 'meditation_minutes':
        progress = progressMetrics.meditationMinutes / rule.threshold
        unlocked = progressMetrics.meditationMinutes >= rule.threshold
        break
        
      case 'chakras_activated':
        progress = progressMetrics.activatedChakras.length / rule.threshold
        unlocked = progressMetrics.activatedChakras.length >= rule.threshold
        break
    }
    
    // Cap progress at 1.0 (100%)
    progress = Math.min(1, progress)
    
    // Update the achievement progress
    await updateAchievementProgress(supabase, userId, achievementId, progress)
    
    // If unlocked, update the achievement and add energy points
    if (unlocked) {
      await unlockAchievement(supabase, userId, achievementId, rule)
      unlockedAchievements.push({ 
        id: achievementId, 
        title: rule.title, 
        points: rule.points 
      })
    }
  }
  
  return unlockedAchievements
}

/**
 * Get a user's current progress metrics
 */
async function getUserProgressMetrics(supabase: any, userId: string): Promise<any> {
  // Default metrics
  const defaultMetrics = {
    currentStreak: 0,
    reflectionCount: 0,
    meditationMinutes: 0,
    activatedChakras: [],
    energyPoints: 0
  }
  
  try {
    // Get streak information
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single()
    
    if (streakData) {
      defaultMetrics.currentStreak = streakData.current_streak
    }
    
    // Get reflection count
    const { count: reflectionCount } = await supabase
      .from('energy_reflections')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (reflectionCount !== null) {
      defaultMetrics.reflectionCount = reflectionCount
    }
    
    // Get activated chakras
    const { data: reflectionData } = await supabase
      .from('energy_reflections')
      .select('chakras_activated')
      .eq('user_id', userId)
      .not('chakras_activated', 'is', null)
    
    if (reflectionData?.length > 0) {
      // Extract unique chakra IDs from all reflections
      const chakraIds = new Set<string>()
      
      reflectionData.forEach(reflection => {
        if (reflection.chakras_activated) {
          if (Array.isArray(reflection.chakras_activated)) {
            reflection.chakras_activated.forEach((id: string) => chakraIds.add(id))
          } else if (typeof reflection.chakras_activated === 'object') {
            Object.keys(reflection.chakras_activated).forEach(id => chakraIds.add(id))
          }
        }
      })
      
      defaultMetrics.activatedChakras = Array.from(chakraIds)
    }
    
    // Get energy points
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('energy_points')
      .eq('id', userId)
      .single()
    
    if (userData) {
      defaultMetrics.energyPoints = userData.energy_points
    }
    
    return defaultMetrics
  } catch (error) {
    console.error('Error getting user progress metrics:', error)
    return defaultMetrics
  }
}

/**
 * Check if an achievement is already unlocked
 */
async function checkIfAchievementUnlocked(
  supabase: any,
  userId: string,
  achievementId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('id, progress')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking achievement unlock status:', error)
    }
    
    return data?.progress === 1
  } catch (error) {
    console.error('Error checking achievement unlock status:', error)
    return false
  }
}

/**
 * Update an achievement's progress
 */
async function updateAchievementProgress(
  supabase: any,
  userId: string,
  achievementId: string,
  progress: number
): Promise<void> {
  try {
    // Check if the achievement already exists
    const { data, error: selectError } = await supabase
      .from('user_achievements')
      .select('id, progress')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single()
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking achievement existence:', selectError)
      return
    }
    
    // If the achievement exists, update it
    if (data) {
      // Only update if the new progress is higher
      if (progress > data.progress) {
        const { error: updateError } = await supabase
          .from('user_achievements')
          .update({ progress })
          .eq('id', data.id)
        
        if (updateError) {
          console.error('Error updating achievement progress:', updateError)
        }
      }
    } else {
      // Otherwise, insert a new achievement record
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          progress,
          achievement_data: achievementRules[achievementId]
        })
      
      if (insertError) {
        console.error('Error inserting achievement:', insertError)
      }
    }
  } catch (error) {
    console.error('Error updating achievement progress:', error)
  }
}

/**
 * Unlock an achievement and award points
 */
async function unlockAchievement(
  supabase: any,
  userId: string,
  achievementId: string,
  achievementRule: any
): Promise<void> {
  try {
    // Update the achievement to 100% progress and set unlocked_at
    const { error: updateError } = await supabase
      .from('user_achievements')
      .update({
        progress: 1,
        unlocked_at: new Date().toISOString(),
        achievement_data: { 
          ...achievementRules[achievementId],
          unlocked: true
        }
      })
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
    
    if (updateError) {
      console.error('Error unlocking achievement:', updateError)
      return
    }
    
    // Award energy points to the user
    if (achievementRule.points > 0) {
      const { data: userData, error: selectError } = await supabase
        .from('user_profiles')
        .select('energy_points')
        .eq('id', userId)
        .single()
      
      if (selectError) {
        console.error('Error getting user energy points:', selectError)
        return
      }
      
      const newPoints = (userData?.energy_points || 0) + achievementRule.points
      
      const { error: pointsError } = await supabase
        .from('user_profiles')
        .update({ energy_points: newPoints })
        .eq('id', userId)
      
      if (pointsError) {
        console.error('Error awarding achievement points:', pointsError)
      }
    }
    
    console.log(`Achievement unlocked: ${achievementId} for user ${userId} (+${achievementRule.points} points)`)
  } catch (error) {
    console.error('Error unlocking achievement:', error)
  }
}
