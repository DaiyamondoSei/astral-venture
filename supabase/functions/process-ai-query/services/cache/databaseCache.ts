
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isCacheExpired } from "../../utils/cacheUtils.ts";

/**
 * Get a Supabase admin client
 */
function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );
}

/**
 * Retrieve a cached response from database
 */
export async function getFromDatabaseCache(cacheKey: string): Promise<{
  responseData: string;
  isStreaming: boolean;
  createdAt: string;
} | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
      .from("ai_response_cache")
      .select("response_data, created_at, is_streaming")
      .eq("cache_key", cacheKey)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      responseData: data.response_data,
      isStreaming: data.is_streaming,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error("Error retrieving from database cache:", error);
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
    const supabaseAdmin = getSupabaseAdmin();
    
    await supabaseAdmin
      .from("ai_response_cache")
      .upsert({
        cache_key: cacheKey,
        response_data: responseData,
        is_streaming: isStreaming,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Error storing in database cache:", error);
  }
}

/**
 * Clear expired cache entries from database
 */
export async function clearExpiredDatabaseCache(): Promise<number> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const streamingExpiryTime = new Date(Date.now() - (10 * 60 * 1000)).toISOString();
    const regularExpiryTime = new Date(Date.now() - (30 * 60 * 1000)).toISOString();
    
    // Delete expired streaming entries
    const { count: streamingCount } = await supabaseAdmin
      .from("ai_response_cache")
      .delete()
      .eq("is_streaming", true)
      .lt("created_at", streamingExpiryTime)
      .select("count");
    
    // Delete expired regular entries
    const { count: regularCount } = await supabaseAdmin
      .from("ai_response_cache")
      .delete()
      .eq("is_streaming", false)
      .lt("created_at", regularExpiryTime)
      .select("count");
    
    return (streamingCount || 0) + (regularCount || 0);
  } catch (error) {
    console.error("Error clearing expired database cache:", error);
    return 0;
  }
}

/**
 * Clear all cache entries from database
 */
export async function clearAllDatabaseCache(): Promise<number> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { count } = await supabaseAdmin
      .from("ai_response_cache")
      .delete()
      .select("count");
    
    return count || 0;
  } catch (error) {
    console.error("Error clearing all database cache:", error);
    return 0;
  }
}
