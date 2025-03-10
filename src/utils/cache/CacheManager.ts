
/**
 * Advanced cache manager with TTL, LRU eviction, and memory efficiency
 */

// Cache entry metadata
interface CacheEntryMeta {
  key: string;
  expires: number;
  lastAccessed: number;
  size: number;
  tags: string[];
}

// Cache entry data with metadata
interface CacheEntry<T> extends CacheEntryMeta {
  data: T;
}

// Cache configuration
export interface CacheConfig {
  defaultTtl: number;         // Default TTL in milliseconds
  maxSize: number;            // Maximum size in bytes
  maxEntries: number;         // Maximum number of entries
  persistToStorage: boolean;  // Whether to persist to localStorage
  storageKey: string;         // localStorage key
  debug: boolean;             // Enable debug logging
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private storageAvailable: boolean = false;
  private currentSize: number = 0;
  
  constructor(config?: Partial<CacheConfig>) {
    // Default configuration
    this.config = {
      defaultTtl: 5 * 60 * 1000, // 5 minutes
      maxSize: 10 * 1024 * 1024, // 10MB
      maxEntries: 1000,
      persistToStorage: true,
      storageKey: 'app_data_cache',
      debug: false,
      ...config
    };
    
    // Check if storage is available
    this.storageAvailable = this.checkStorageAvailable();
    
    // Load cache from storage if enabled
    if (this.config.persistToStorage && this.storageAvailable) {
      this.loadFromStorage();
    }
    
    // Set up automatic cache cleanup interval
    setInterval(() => this.cleanup(), 60 * 1000); // Clean up every minute
  }
  
  /**
   * Set an item in the cache
   */
  set<T>(key: string, data: T, options?: {
    ttl?: number;
    tags?: string[];
    forceUpdate?: boolean;
  }): void {
    const {
      ttl = this.config.defaultTtl,
      tags = [],
      forceUpdate = false
    } = options || {};
    
    // Check if item already exists and we're not forcing an update
    if (!forceUpdate && this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      
      // If existing item isn't expired, just update the access time
      if (existing.expires > Date.now()) {
        existing.lastAccessed = Date.now();
        return;
      }
    }
    
    // Calculate entry size (approximate)
    const size = this.calculateSize(data);
    
    // Create new cache entry
    const entry: CacheEntry<T> = {
      key,
      data,
      expires: Date.now() + ttl,
      lastAccessed: Date.now(),
      size,
      tags
    };
    
    // Check if we need to make room
    if (this.currentSize + size > this.config.maxSize || this.cache.size + 1 > this.config.maxEntries) {
      this.evict(size);
    }
    
    // Add to cache
    this.cache.set(key, entry);
    this.currentSize += size;
    
    // Persist if enabled
    if (this.config.persistToStorage && this.storageAvailable) {
      this.saveToStorage();
    }
    
    if (this.config.debug) {
      console.debug(`[Cache] Set item: ${key}, Size: ${size} bytes, Expires: ${new Date(entry.expires).toISOString()}`);
    }
  }
  
  /**
   * Get an item from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    // Missing or expired
    if (!entry || entry.expires < Date.now()) {
      if (entry) {
        // Remove expired item
        this.remove(key);
        if (this.config.debug) {
          console.debug(`[Cache] Item expired: ${key}`);
        }
      }
      return null;
    }
    
    // Update last accessed time
    entry.lastAccessed = Date.now();
    
    if (this.config.debug) {
      console.debug(`[Cache] Cache hit: ${key}`);
    }
    
    return entry.data as T;
  }
  
  /**
   * Get an item with fallback function if not in cache
   */
  async getOrFetch<T, R = T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: {
      ttl?: number;
      tags?: string[];
      transform?: (data: T) => R;
    }
  ): Promise<R> {
    const {
      ttl = this.config.defaultTtl,
      tags = [],
      transform
    } = options || {};
    
    // Try to get from cache first
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      // Return transformed data if transform function is provided
      return transform ? transform(cached) : cached as unknown as R;
    }
    
    // Not in cache, fetch fresh data
    if (this.config.debug) {
      console.debug(`[Cache] Cache miss: ${key}, fetching data...`);
    }
    
    try {
      const data = await fetchFn();
      
      // Store in cache
      this.set(key, data, { ttl, tags });
      
      // Return transformed data if transform function is provided
      return transform ? transform(data) : data as unknown as R;
    } catch (error) {
      console.error(`[Cache] Error fetching data for key ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Remove an item from the cache
   */
  remove(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    // Update current size
    this.currentSize -= entry.size;
    
    // Remove from cache
    this.cache.delete(key);
    
    // Update storage
    if (this.config.persistToStorage && this.storageAvailable) {
      this.saveToStorage();
    }
    
    if (this.config.debug) {
      console.debug(`[Cache] Removed item: ${key}`);
    }
    
    return true;
  }
  
  /**
   * Clear all items from cache
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    
    // Clear storage
    if (this.config.persistToStorage && this.storageAvailable) {
      try {
        localStorage.removeItem(this.config.storageKey);
      } catch (e) {
        console.error('[Cache] Error clearing cache from storage:', e);
      }
    }
    
    if (this.config.debug) {
      console.debug('[Cache] Cache cleared');
    }
  }
  
  /**
   * Clear items by tag
   */
  clearByTag(tag: string): number {
    let count = 0;
    
    // Find all keys with the tag
    const keysToRemove: string[] = [];
    this.cache.forEach((entry) => {
      if (entry.tags.includes(tag)) {
        keysToRemove.push(entry.key);
      }
    });
    
    // Remove all matched entries
    keysToRemove.forEach(key => {
      if (this.remove(key)) {
        count++;
      }
    });
    
    if (this.config.debug) {
      console.debug(`[Cache] Cleared ${count} items with tag: ${tag}`);
    }
    
    return count;
  }
  
  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let count = 0;
    
    // Find all expired keys
    const keysToRemove: string[] = [];
    this.cache.forEach((entry) => {
      if (entry.expires < now) {
        keysToRemove.push(entry.key);
      }
    });
    
    // Remove all expired entries
    keysToRemove.forEach(key => {
      if (this.remove(key)) {
        count++;
      }
    });
    
    if (count > 0 && this.config.debug) {
      console.debug(`[Cache] Cleaned up ${count} expired items`);
    }
    
    return count;
  }
  
  /**
   * Get cache statistics
   */
  getStats(): Record<string, any> {
    let oldestAccess = Date.now();
    let newestAccess = 0;
    const tagCounts: Record<string, number> = {};
    let expiredCount = 0;
    const now = Date.now();
    
    this.cache.forEach((entry) => {
      oldestAccess = Math.min(oldestAccess, entry.lastAccessed);
      newestAccess = Math.max(newestAccess, entry.lastAccessed);
      
      if (entry.expires < now) {
        expiredCount++;
      }
      
      // Count by tag
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return {
      totalEntries: this.cache.size,
      totalSize: this.currentSize,
      sizeLimit: this.config.maxSize,
      entriesLimit: this.config.maxEntries,
      utilization: Math.round((this.currentSize / this.config.maxSize) * 100),
      oldestAccessTime: new Date(oldestAccess).toISOString(),
      newestAccessTime: new Date(newestAccess).toISOString(),
      expiredEntries: expiredCount,
      tags: tagCounts
    };
  }
  
  /**
   * Calculate the size of an item (approximate)
   */
  private calculateSize(data: any): number {
    if (data === null || data === undefined) {
      return 8;
    }
    
    if (typeof data === 'boolean') {
      return 4;
    }
    
    if (typeof data === 'number') {
      return 8;
    }
    
    if (typeof data === 'string') {
      return data.length * 2; // UTF-16 uses 2 bytes per character
    }
    
    if (Array.isArray(data)) {
      let size = 0;
      for (const item of data) {
        size += this.calculateSize(item);
      }
      return size;
    }
    
    if (typeof data === 'object') {
      try {
        const json = JSON.stringify(data);
        return json.length * 2; // UTF-16 uses 2 bytes per character
      } catch (e) {
        // Fallback for circular references, etc.
        return 1024; // Arbitrary size for complex objects
      }
    }
    
    return 8; // Default size
  }
  
  /**
   * Evict entries to make room for new ones
   */
  private evict(requiredSize: number): void {
    // Sort by last accessed (oldest first)
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => entry)
      .sort((a, b) => a.lastAccessed - b.lastAccessed);
    
    let freedSize = 0;
    let removedCount = 0;
    
    // Remove oldest until we have enough space
    for (const entry of entries) {
      // Skip if entry is currently in use
      if (entry.lastAccessed === Date.now()) {
        continue;
      }
      
      this.remove(entry.key);
      freedSize += entry.size;
      removedCount++;
      
      // Check if we've freed enough space
      if (this.currentSize + requiredSize <= this.config.maxSize && 
          this.cache.size + 1 <= this.config.maxEntries) {
        break;
      }
    }
    
    if (this.config.debug && removedCount > 0) {
      console.debug(`[Cache] Evicted ${removedCount} items, freed ${freedSize} bytes`);
    }
  }
  
  /**
   * Check if localStorage is available
   */
  private checkStorageAvailable(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    if (!this.storageAvailable) return;
    
    try {
      // Extract just the necessary data to save space
      const serialized: Record<string, any> = {};
      
      this.cache.forEach((entry) => {
        serialized[entry.key] = {
          d: entry.data,           // data
          e: entry.expires,        // expires
          la: entry.lastAccessed,  // lastAccessed
          t: entry.tags            // tags
        };
      });
      
      localStorage.setItem(this.config.storageKey, JSON.stringify(serialized));
    } catch (e) {
      console.error('[Cache] Error saving cache to storage:', e);
    }
  }
  
  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    if (!this.storageAvailable) return;
    
    try {
      const serialized = localStorage.getItem(this.config.storageKey);
      
      if (!serialized) return;
      
      const parsed = JSON.parse(serialized);
      
      // Restore cache entries
      for (const [key, value] of Object.entries(parsed)) {
        const { d, e, la, t } = value as any;
        
        // Skip expired entries
        if (e < Date.now()) continue;
        
        const size = this.calculateSize(d);
        
        this.cache.set(key, {
          key,
          data: d,
          expires: e,
          lastAccessed: la,
          size,
          tags: t || []
        });
        
        this.currentSize += size;
      }
      
      if (this.config.debug) {
        console.debug(`[Cache] Loaded ${this.cache.size} items from storage, total size: ${this.currentSize} bytes`);
      }
    } catch (e) {
      console.error('[Cache] Error loading cache from storage:', e);
    }
  }
}

// Create default instance
const defaultCache = new CacheManager();

export default defaultCache;
