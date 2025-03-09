
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
