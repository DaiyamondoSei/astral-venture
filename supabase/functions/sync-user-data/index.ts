
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface SyncRequest {
  lastSyncTime: string | null;
}

interface SyncResponse {
  achievements: any[];
  userStats: any;
  streak: any;
  preferences: any;
  timestamp: string;
}

// These are automatically injected when deployed on Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    // Check if the request has a valid JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT and get the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ message: 'Invalid token or user not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the sync request data
    const { lastSyncTime } = await req.json() as SyncRequest;

    // Query for all user data that needs to be synced
    const syncTimestamp = new Date().toISOString();
    const modifiedSince = lastSyncTime || new Date(0).toISOString();

    // Query for achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .gt('updated_at', modifiedSince);

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
    }

    // Query for user stats
    const { data: userStats, error: statsError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (statsError) {
      console.error('Error fetching user stats:', statsError);
    }

    // Query for streak data
    const { data: streak, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (streakError) {
      console.error('Error fetching streak data:', streakError);
    }

    // Query for user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (preferencesError) {
      console.error('Error fetching user preferences:', preferencesError);
    }

    // Prepare the response
    const syncResponse: SyncResponse = {
      achievements: achievements || [],
      userStats: userStats || null,
      streak: streak || null,
      preferences: preferences || null,
      timestamp: syncTimestamp
    };

    // Return the synced data
    return new Response(
      JSON.stringify(syncResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-user-data function:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
