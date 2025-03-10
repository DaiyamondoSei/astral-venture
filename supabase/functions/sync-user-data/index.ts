
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  handleCorsRequest,
  safeParseJson
} from "../shared/responseUtils.ts";

import { withAuth, createAdminClient } from "../shared/authUtils.ts";

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

// Process the sync user data request (after authentication)
async function processSyncRequest(user: any, req: Request): Promise<Response> {
  try {
    // Get the sync request data
    const { lastSyncTime } = await req.json() as SyncRequest;
    
    // Create admin client for database operations
    const supabase = createAdminClient();
    
    // Query for all user data that needs to be synced
    const syncTimestamp = new Date().toISOString();
    const modifiedSince = lastSyncTime || new Date(0).toISOString();

    console.log(`Syncing data for user ${user.id} modified since ${modifiedSince}`);
    
    // Query for achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .gt('updated_at', modifiedSince);

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch user achievements",
        { dbError: achievementsError.message },
        500
      );
    }

    // Query for user stats
    const { data: userStats, error: statsError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (statsError && statsError.code !== 'PGRST116') { // Not found is ok
      console.error('Error fetching user stats:', statsError);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch user profile",
        { dbError: statsError.message },
        500
      );
    }

    // Query for streak data
    const { data: streak, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (streakError && streakError.code !== 'PGRST116') { // Not found is ok
      console.error('Error fetching streak data:', streakError);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch user streak data",
        { dbError: streakError.message },
        500
      );
    }

    // Query for user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (preferencesError && preferencesError.code !== 'PGRST116') { // Not found is ok
      console.error('Error fetching user preferences:', preferencesError);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch user preferences",
        { dbError: preferencesError.message },
        500
      );
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
    return createSuccessResponse(
      syncResponse,
      { syncTimestamp, lastSyncTime: modifiedSince }
    );
  } catch (error) {
    console.error('Error in sync-user-data function:', error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error during data sync",
      { error: error.message },
      500
    );
  }
}

// Entry point for the edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  return withAuth(req, processSyncRequest);
});
