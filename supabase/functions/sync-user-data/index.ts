
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client with the auth context of the function
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

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
    
    // Get request data
    const { section, lastSyncTimestamp } = await req.json()
    
    // Default response data
    let responseData = {}
    
    // Handle different sync sections
    switch (section) {
      case 'user_profile':
        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (profileError) {
          throw profileError
        }
        
        responseData = { profile: profileData }
        break
        
      case 'achievements':
        // Get user achievements with changes since last sync
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .gte('updated_at', lastSyncTimestamp || '1970-01-01')
          
        if (achievementsError) {
          throw achievementsError
        }
        
        responseData = { achievements: achievementsData }
        break
        
      case 'energy_reflections':
        // Get reflections with changes since last sync
        const { data: reflectionsData, error: reflectionsError } = await supabase
          .from('energy_reflections')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', lastSyncTimestamp || '1970-01-01')
          .order('created_at', { ascending: false })
          
        if (reflectionsError) {
          throw reflectionsError
        }
        
        responseData = { reflections: reflectionsData }
        break
        
      case 'activity':
        // Get activity data
        const { data: activityData, error: activityError } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', lastSyncTimestamp || '1970-01-01')
          .order('created_at', { ascending: false })
          
        if (activityError) {
          throw activityError
        }
        
        responseData = { activity: activityData }
        break
        
      case 'streak':
        // Get streak data
        const { data: streakData, error: streakError } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .single()
          
        if (streakError) {
          throw streakError
        }
        
        responseData = { streak: streakData }
        break
        
      case 'all':
        // Fetch all user data (for initial sync)
        const [
          profileResult, 
          achievementsResult, 
          reflectionsResult,
          activityResult,
          streakResult
        ] = await Promise.all([
          supabase.from('user_profiles').select('*').eq('id', user.id).single(),
          supabase.from('user_achievements').select('*').eq('user_id', user.id),
          supabase.from('energy_reflections').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
          supabase.from('user_activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
          supabase.from('user_streaks').select('*').eq('user_id', user.id).single()
        ])
        
        if (profileResult.error || achievementsResult.error || reflectionsResult.error || 
            activityResult.error || streakResult.error) {
          throw new Error('Error fetching user data')
        }
        
        responseData = {
          profile: profileResult.data,
          achievements: achievementsResult.data,
          reflections: reflectionsResult.data,
          activity: activityResult.data,
          streak: streakResult.data,
        }
        break
        
      default:
        throw new Error(`Unknown sync section: ${section}`)
    }
    
    // Add sync timestamp to response
    responseData.syncTimestamp = new Date().toISOString()
    
    return new Response(
      JSON.stringify({
        success: true,
        data: responseData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error syncing user data:', error)
    
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
