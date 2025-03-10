
/**
 * Shared cache utility functions for Edge Functions
 * Provides standardized caching mechanisms
 */

/**
 * Create a consistent cache key based on query parameters
 */
export function createCacheKey(
  query: string, 
  context?: string | null, 
  model?: string
): string {
  // Normalize inputs to prevent cache misses due to whitespace/case
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedContext = context ? context.trim().substring(0, 100) : '';
  const modelIdentifier = model || 'default';
  
  // Create a deterministic hash for the cache key
  return btoa(
    `${normalizedQuery}::${normalizedContext.substring(0, 50)}::${modelIdentifier}`
  ).replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Determine if a cached response is expired
 */
export function isCacheExpired(
  timestamp: string | number,
  ttl: number = 30 * 60 * 1000 // Default 30 minutes
): boolean {
  const cacheTime = typeof timestamp === 'string' 
    ? new Date(timestamp).getTime() 
    : timestamp;
  
  return Date.now() > cacheTime + ttl;
}

/**
 * Calculate appropriate cache TTL based on content type and size
 */
export function calculateCacheTTL(
  contentType: "reflection" | "query" | "streaming" | "user_data",
  contentSize?: number
): number {
  switch (contentType) {
    case "streaming":
      return 10 * 60 * 1000; // 10 minutes for streaming responses
    case "reflection":
      return 60 * 60 * 1000; // 1 hour for reflection analysis
    case "user_data":
      return 5 * 60 * 1000;  // 5 minutes for user data
    case "query":
    default:
      // For regular queries, scale TTL based on content size
      const baseTime = 30 * 60 * 1000; // 30 minutes base
      if (!contentSize) return baseTime;
      
      // Shorter cache time for very small responses (might be error responses)
      if (contentSize < 100) return 5 * 60 * 1000;
      
      // Longer cache time for large, complex responses
      if (contentSize > 10000) return 2 * 60 * 60 * 1000; // 2 hours
      
      return baseTime;
  }
}
