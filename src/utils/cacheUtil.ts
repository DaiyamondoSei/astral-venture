
/**
 * Utility for local caching with expiration
 */

interface CacheItem<T> {
  value: T;
  expiry: number;
}

export class CacheUtil {
  private static cache: Record<string, CacheItem<any>> = {};
  
  /**
   * Set a value in the cache with an expiration time
   * @param key Cache key
   * @param value Value to cache
   * @param expiryInSecs Expiration time in seconds (default: 5 minutes)
   */
  static set<T>(key: string, value: T, expiryInSecs: number = 300): void {
    const now = new Date().getTime();
    const expiry = now + (expiryInSecs * 1000);
    
    CacheUtil.cache[key] = {
      value,
      expiry
    };
  }
  
  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or null if expired/not found
   */
  static get<T>(key: string): T | null {
    const item = CacheUtil.cache[key];
    
    // Return null if item doesn't exist
    if (!item) return null;
    
    // Check if the item has expired
    const now = new Date().getTime();
    if (now > item.expiry) {
      // Delete the expired item
      delete CacheUtil.cache[key];
      return null;
    }
    
    return item.value;
  }
  
  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  static remove(key: string): void {
    delete CacheUtil.cache[key];
  }
  
  /**
   * Clear all expired items from the cache
   */
  static clearExpired(): void {
    const now = new Date().getTime();
    
    Object.keys(CacheUtil.cache).forEach(key => {
      if (now > CacheUtil.cache[key].expiry) {
        delete CacheUtil.cache[key];
      }
    });
  }
  
  /**
   * Clear the entire cache
   */
  static clearAll(): void {
    CacheUtil.cache = {};
  }
  
  /**
   * Get a cached result of an async function or execute it
   * @param key Cache key
   * @param fn Async function to execute if cache miss
   * @param expiryInSecs Expiration time in seconds
   * @returns Promise resolving to the result
   */
  static async getOrFetch<T>(
    key: string, 
    fn: () => Promise<T>, 
    expiryInSecs: number = 300
  ): Promise<T> {
    const cachedValue = CacheUtil.get<T>(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // Execute function on cache miss
    const result = await fn();
    CacheUtil.set(key, result, expiryInSecs);
    return result;
  }
}

// Auto-clear expired cache items every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    CacheUtil.clearExpired();
  }, 5 * 60 * 1000);
}
