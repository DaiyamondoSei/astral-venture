
/**
 * Utilities for caching management
 */

/**
 * Generate a cache key based on query parameters
 */
export function createCacheKey(query: string, context?: string, model?: string): string {
  // Create a deterministic hash from the query and context
  const baseString = `${query}|${context || ''}|${model || 'default'}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `query_${Math.abs(hash).toString(16)}`;
}

/**
 * Calculate TTL (time-to-live) for cache entries
 * @param baseTime Base time in milliseconds
 * @param complexity Query complexity factor (0-1)
 * @returns TTL in milliseconds
 */
export function calculateCacheTTL(baseTime: number = 30 * 60 * 1000, complexity: number = 0.5): number {
  // More complex queries can be cached longer as they're more expensive to recompute
  return Math.floor(baseTime * (1 + complexity));
}

/**
 * Determine if a query is eligible for caching
 */
export function isCacheableQuery(query: string): boolean {
  // Don't cache very short queries as they're likely to change
  if (query.length < 10) return false;
  
  // Don't cache queries with sensitive patterns
  const sensitivePatterns = [
    /password/i,
    /credential/i,
    /secret/i,
    /token/i,
    /private/i
  ];
  
  return !sensitivePatterns.some(pattern => pattern.test(query));
}
