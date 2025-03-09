
/**
 * Create a cache key from query parameters
 */
export function createCacheKey(query: string, context?: string, model?: string): string {
  const normalizedQuery = query.trim().toLowerCase();
  const contextHash = context ? hashString(context) : "";
  const modelInfo = model || "default";
  
  return `query_${hashString(normalizedQuery)}_ctx_${contextHash}_model_${modelInfo}`;
}

/**
 * Simple string hashing function
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Calculate cache expiration time based on content type
 */
export function getCacheExpiryTime(isStreaming: boolean): number {
  // Streaming responses have shorter TTL (10 minutes)
  return isStreaming ? 10 * 60 * 1000 : 30 * 60 * 1000;
}

/**
 * Check if a cache item is expired
 */
export function isCacheExpired(timestamp: number, isStreaming: boolean): boolean {
  const now = Date.now();
  const expiryTime = getCacheExpiryTime(isStreaming);
  return now - timestamp > expiryTime;
}
