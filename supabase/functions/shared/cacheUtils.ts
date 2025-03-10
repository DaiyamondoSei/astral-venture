
/**
 * Shared caching utilities for edge functions
 */

/**
 * Create a cache key based on input parameters
 * 
 * @param query The main query/prompt
 * @param context Optional context data
 * @param model The AI model being used
 * @returns A consistent cache key
 */
export function createCacheKey(query: string, context: any = null, model: string = 'default'): string {
  // Normalize the query by trimming whitespace and lowercasing
  const normalizedQuery = query.trim().toLowerCase();
  
  // Hash function to create a simple string hash
  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  };
  
  // Create base key from query
  const queryHash = simpleHash(normalizedQuery);
  
  // Add context hash if provided
  let contextHash = '';
  if (context) {
    // If context is an object, stringify it first
    const contextStr = typeof context === 'string' 
      ? context 
      : JSON.stringify(context);
    
    contextHash = `-${simpleHash(contextStr)}`;
  }
  
  // Add model information
  const modelSuffix = model ? `-${model.replace(/[^a-z0-9]/gi, '_')}` : '';
  
  // Combine all parts
  return `q-${queryHash}${contextHash}${modelSuffix}`;
}

/**
 * Get cache time-to-live based on content type
 * 
 * @param contentType Type of content being cached
 * @returns Cache TTL in milliseconds
 */
export function getCacheTTL(contentType: 'query' | 'context' | 'reflection' | 'user' = 'query'): number {
  switch (contentType) {
    case 'query':
      return 30 * 60 * 1000; // 30 minutes for general queries
    case 'context':
      return 24 * 60 * 60 * 1000; // 24 hours for context data
    case 'reflection':
      return 7 * 24 * 60 * 60 * 1000; // 7 days for reflections
    case 'user':
      return 60 * 60 * 1000; // 1 hour for user data
    default:
      return 15 * 60 * 1000; // 15 minutes default
  }
}

/**
 * Create a cache key for user-specific content
 * 
 * @param userId User ID
 * @param action The action/query being performed
 * @param params Optional parameters
 * @returns User-specific cache key
 */
export function createUserCacheKey(userId: string, action: string, params: any = null): string {
  if (!userId) return '';
  
  const prefix = `user-${userId.slice(0, 8)}`;
  const actionKey = action.replace(/[^a-z0-9]/gi, '_');
  
  let paramSuffix = '';
  if (params) {
    // If params is an object, stringify it and create a hash
    const paramStr = typeof params === 'string' 
      ? params 
      : JSON.stringify(params);
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < paramStr.length; i++) {
      const char = paramStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    paramSuffix = `-${hash.toString(16)}`;
  }
  
  return `${prefix}-${actionKey}${paramSuffix}`;
}
