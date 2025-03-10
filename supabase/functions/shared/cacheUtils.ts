
/**
 * Cache utilities for edge functions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { corsHeaders } from './responseUtils.ts';

// Create a Supabase client for the edge function
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache TTL in seconds (default: 1 hour)
const DEFAULT_TTL = 3600;

/**
 * Create a cache key from inputs
 */
export function createCacheKey(...inputs: (string | undefined)[]): string {
  return inputs
    .filter(Boolean)
    .map(input => input!.trim().toLowerCase())
    .join('::');
}

/**
 * Get cached response if available
 */
export async function getCachedResponse(
  key: string,
  table = 'edge_function_cache'
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('value, created_at')
      .eq('key', key)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Check if the cache is still valid
    const createdAt = new Date(data.created_at).getTime();
    const now = Date.now();
    const ttlMs = DEFAULT_TTL * 1000;
    
    if (now - createdAt > ttlMs) {
      // Cache has expired, delete it
      await supabase.from(table).delete().eq('key', key);
      return null;
    }
    
    return data.value;
  } catch (error) {
    console.error('Error fetching from cache:', error);
    return null;
  }
}

/**
 * Store response in cache
 */
export async function setCachedResponse(
  key: string,
  value: any,
  table = 'edge_function_cache',
  ttl = DEFAULT_TTL
): Promise<void> {
  try {
    // Set expiry timestamp
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
    
    // Upsert the cache entry
    const { error } = await supabase
      .from(table)
      .upsert(
        { 
          key,
          value,
          ttl,
          expires_at: expiresAt
        },
        { onConflict: 'key' }
      );
    
    if (error) {
      console.error('Error setting cache:', error);
    }
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

/**
 * Clean expired cache entries
 */
export async function cleanupCache(table = 'edge_function_cache'): Promise<number> {
  try {
    const now = new Date().toISOString();
    
    // Delete expired entries
    const { data, error } = await supabase
      .from(table)
      .delete()
      .lt('expires_at', now)
      .select('key');
    
    if (error) {
      console.error('Error cleaning cache:', error);
      return 0;
    }
    
    return data?.length || 0;
  } catch (error) {
    console.error('Error cleaning cache:', error);
    return 0;
  }
}

/**
 * Create a streaming response that's also cached
 */
export async function createCacheableStreamingResponse(
  stream: ReadableStream,
  key: string,
  table = 'edge_function_cache'
): Promise<Response> {
  // Create a response with the stream
  const response = new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
  
  // We can't easily cache a streaming response directly,
  // so we're just storing the key to indicate it was processed
  setCachedResponse(key, { streaming: true, processed: true }, table)
    .catch(err => console.error('Error caching stream indicator:', err));
  
  return response;
}

export default {
  createCacheKey,
  getCachedResponse,
  setCachedResponse,
  cleanupCache,
  createCacheableStreamingResponse,
};
