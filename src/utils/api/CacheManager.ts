
/**
 * Cache manager for API responses and data
 * Supports memory and persistence caching with TTL
 */
export class CacheManager {
  private cache: Map<string, CacheEntry>;
  private storagePrefix: string;
  private defaultTTL: number;
  private persistenceEnabled: boolean;
  
  constructor(options: CacheManagerOptions = {}) {
    this.cache = new Map();
    this.storagePrefix = options.storagePrefix || 'app_cache:';
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.persistenceEnabled = options.persistenceEnabled !== false;
    
    // Initialize cache from storage if persistence is enabled
    if (this.persistenceEnabled) {
      this.loadFromStorage();
    }
  }
  
  /**
   * Set a cache entry with optional TTL
   */
  set<T>(key: string, value: T, options: CacheEntryOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    const expires = ttl > 0 ? Date.now() + ttl : 0;
    const persistent = options.persistent !== false && this.persistenceEnabled;
    
    const entry: CacheEntry = {
      value,
      expires,
      created: Date.now(),
      persistent
    };
    
    // Store in memory cache
    this.cache.set(key, entry);
    
    // Store in persistent storage if enabled
    if (persistent) {
      this.saveEntryToStorage(key, entry);
    }
  }
  
  /**
   * Get a cache entry
   * Returns undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    // No entry found
    if (!entry) {
      return undefined;
    }
    
    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key);
      return undefined;
    }
    
    return entry.value as T;
  }
  
  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Delete a cache entry
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (entry && entry.persistent) {
      try {
        localStorage.removeItem(this.storagePrefix + key);
      } catch (error) {
        console.warn('Failed to remove item from localStorage:', error);
      }
    }
    
    return this.cache.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    // Clear persistent entries
    if (this.persistenceEnabled) {
      try {
        this.cache.forEach((entry, key) => {
          if (entry.persistent) {
            localStorage.removeItem(this.storagePrefix + key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear items from localStorage:', error);
      }
    }
    
    // Clear memory cache
    this.cache.clear();
  }
  
  /**
   * Delete expired entries
   */
  cleanup(): number {
    let count = 0;
    const now = Date.now();
    
    this.cache.forEach((entry, key) => {
      if (entry.expires > 0 && entry.expires < now) {
        this.delete(key);
        count++;
      }
    });
    
    return count;
  }
  
  /**
   * Check if an entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return entry.expires > 0 && entry.expires < Date.now();
  }
  
  /**
   * Save an entry to localStorage
   */
  private saveEntryToStorage(key: string, entry: CacheEntry): void {
    if (!this.persistenceEnabled) return;
    
    try {
      localStorage.setItem(
        this.storagePrefix + key,
        JSON.stringify({
          value: entry.value,
          expires: entry.expires,
          created: entry.created
        })
      );
    } catch (error) {
      console.warn('Failed to save cache entry to localStorage:', error);
      
      // If storage is full, clear some space
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldestPersistentEntries(5);
      }
    }
  }
  
  /**
   * Load cache entries from localStorage
   */
  private loadFromStorage(): void {
    if (!this.persistenceEnabled) return;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        
        if (storageKey && storageKey.startsWith(this.storagePrefix)) {
          const key = storageKey.slice(this.storagePrefix.length);
          const json = localStorage.getItem(storageKey);
          
          if (json) {
            try {
              const parsed = JSON.parse(json);
              
              // Only load if not expired
              if (parsed.expires === 0 || parsed.expires > Date.now()) {
                this.cache.set(key, {
                  value: parsed.value,
                  expires: parsed.expires,
                  created: parsed.created,
                  persistent: true
                });
              } else {
                // Clean up expired entries
                localStorage.removeItem(storageKey);
              }
            } catch (parseError) {
              console.warn(`Failed to parse cache entry: ${key}`, parseError);
              localStorage.removeItem(storageKey);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }
  
  /**
   * Clear oldest persistent entries to free up space
   */
  private clearOldestPersistentEntries(count: number): void {
    const persistentEntries: [string, CacheEntry][] = [];
    
    // Find all persistent entries
    this.cache.forEach((entry, key) => {
      if (entry.persistent) {
        persistentEntries.push([key, entry]);
      }
    });
    
    // Sort by creation time (oldest first)
    persistentEntries.sort((a, b) => a[1].created - b[1].created);
    
    // Remove oldest entries
    for (let i = 0; i < Math.min(count, persistentEntries.length); i++) {
      this.delete(persistentEntries[i][0]);
    }
  }
}

/**
 * Cache entry with metadata
 */
interface CacheEntry {
  value: unknown;
  expires: number;
  created: number;
  persistent: boolean;
}

/**
 * Options for creating a cache manager
 */
interface CacheManagerOptions {
  storagePrefix?: string;
  defaultTTL?: number;
  persistenceEnabled?: boolean;
}

/**
 * Options for cache entries
 */
interface CacheEntryOptions {
  ttl?: number;
  persistent?: boolean;
}

// Export singleton instance
export const cacheManager = new CacheManager();

export default cacheManager;
