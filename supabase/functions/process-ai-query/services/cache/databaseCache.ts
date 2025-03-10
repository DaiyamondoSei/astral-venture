
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logEvent } from "../../../shared/responseUtils.ts";
import { 
  setDatabaseCache, 
  getDatabaseCache 
} from "../../../shared/cacheUtils.ts";
import { getSupabaseAdmin } from "../../../shared/authUtils.ts";

/**
 * Retrieve a cached response from database
 */
export async function getFromDatabaseCache(cacheKey: string): Promise<{
  responseData: string;
  isStreaming: boolean;
  createdAt: string;
} | null> {
  try {
    const cachedData = await getDatabaseCache<{
      responseData: string;
      isStreaming: boolean;
      createdAt: string;
    }>(cacheKey);
    
    if (!cachedData) {
      return null;
    }
    
    return cachedData;
  } catch (error) {
    logEvent("error", "Error retrieving from database cache", { error, cacheKey });
    return null;
  }
}

/**
 * Store a response in database cache
 */
export async function storeInDatabaseCache(
  cacheKey: string,
  responseData: string,
  isStreaming: boolean
): Promise<void> {
  try {
    await setDatabaseCache(
      cacheKey,
      {
        responseData,
        isStreaming,
        createdAt: new Date().toISOString()
      },
      isStreaming ? 600 : 1800 // 10 minutes for streaming, 30 minutes for regular
    );
  } catch (error) {
    logEvent("error", "Error storing in database cache", { error, cacheKey });
  }
}

/**
 * Clear expired cache entries from database
 */
export async function clearExpiredDatabaseCache(): Promise<number> {
  try {
    const supabase = getSupabaseAdmin();
    const streamingExpiryTime = new Date(Date.now() - (10 * 60 * 1000)).toISOString();
    const regularExpiryTime = new Date(Date.now() - (30 * 60 * 1000)).toISOString();
    
    // Delete expired streaming entries
    const { count: streamingCount } = await supabase
      .from("ai_response_cache")
      .delete()
      .eq("is_streaming", true)
      .lt("created_at", streamingExpiryTime)
      .select("count");
    
    // Delete expired regular entries
    const { count: regularCount } = await supabase
      .from("ai_response_cache")
      .delete()
      .eq("is_streaming", false)
      .lt("created_at", regularExpiryTime)
      .select("count");
    
    return (streamingCount || 0) + (regularCount || 0);
  } catch (error) {
    logEvent("error", "Error clearing expired database cache", { error });
    return 0;
  }
}

/**
 * Clear all cache entries from database
 */
export async function clearAllDatabaseCache(): Promise<number> {
  try {
    const supabase = getSupabaseAdmin();
    const { count } = await supabase
      .from("ai_response_cache")
      .delete()
      .select("count");
    
    return count || 0;
  } catch (error) {
    logEvent("error", "Error clearing all database cache", { error });
    return 0;
  }
}
