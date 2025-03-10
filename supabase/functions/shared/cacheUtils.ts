
/**
 * Shared cache utilities for Edge Functions
 */

/**
 * Create a cache key based on the query and optional context
 * 
 * @param query - The query string
 * @param context - Optional context data
 * @param model - Optional AI model name
 * @returns A deterministic cache key
 */
export function createCacheKey(
  query: string,
  context: any | null = null,
  model = "default"
): string {
  // Create a normalized string representation
  const queryNormalized = query.trim().toLowerCase();
  const contextString = context ? JSON.stringify(context) : "";
  
  // Combine the elements
  const combined = `${model}:${queryNormalized}:${contextString}`;
  
  // Create a simple hash for shorter keys
  // In production, use a more robust hashing algorithm
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `${model}_${hash}`;
}

/**
 * Check if a cache key is valid
 * 
 * @param key - The cache key to validate
 * @returns Whether the key is valid
 */
export function isValidCacheKey(key: string): boolean {
  // Basic validation to prevent injection or other issues
  return /^[a-zA-Z0-9_-]+$/.test(key);
}

/**
 * Generate a cache key for user-specific content
 * 
 * @param userId - User ID
 * @param action - Action type
 * @param identifier - Optional unique identifier
 * @returns User-specific cache key
 */
export function createUserCacheKey(
  userId: string,
  action: string,
  identifier?: string
): string {
  const idPart = identifier ? `:${identifier}` : '';
  return `user:${userId}:${action}${idPart}`;
}

/**
 * Extract metadata from cache key
 * 
 * @param key - Cache key to parse
 * @returns Extracted metadata
 */
export function parseCacheKey(key: string): {
  model?: string;
  hash?: string;
  userId?: string;
  action?: string;
} {
  // Parse model_hash format
  const modelMatch = key.match(/^([a-zA-Z0-9_-]+)_(-?\d+)$/);
  if (modelMatch) {
    return {
      model: modelMatch[1],
      hash: modelMatch[2],
    };
  }
  
  // Parse user:userId:action format
  const userMatch = key.match(/^user:([a-zA-Z0-9_-]+):([a-zA-Z0-9_-]+)/);
  if (userMatch) {
    return {
      userId: userMatch[1],
      action: userMatch[2],
    };
  }
  
  return {};
}
