
/**
 * Cache entry with metadata and expiration
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiry: number | null;
}

/**
 * Cache configuration options
 */
interface CacheOptions {
  maxEntries?: number;
  defaultTTL?: number;
  namespace?: string;
  storageType?: 'memory' | 'local' | 'session';
}

/**
 * Efficient data caching system with multiple storage strategies
 */
export class CacheManager<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxEntries: number;
  private defaultTTL: number;
  private namespace: string;
  private storageType: 'memory' | 'local' | 'session';
  
  constructor(options: CacheOptions = {}) {
    this.maxEntries = options.maxEntries || 100;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes default
    this.namespace = options.namespace || 'app-cache';
    this.storageType = options.storageType || 'memory';
    
    // Initial restoration from persistent storage if needed
    if (this.storageType !== 'memory') {
      this.restoreFromStorage();
    }
  }
  
  /**
   * Get a cached value by key
   */
  get(key: string): T | null {
    const normalizedKey = this.normalizeKey(key);
    
    // Try memory cache first
    const entry = this.cache.get(normalizedKey);
    
    if (entry) {
      // Check if expired
      if (entry.expiry && Date.now() > entry.expiry) {
        this.delete(key);
        return null;
      }
      
      return entry.value;
    }
    
    // Try persistent storage if configured
    if (this.storageType !== 'memory') {
      return this.getFromStorage(normalizedKey);
    }
    
    return null;
  }
  
  /**
   * Store a value in cache
   */
  set(key: string, value: T, ttl: number = this.defaultTTL): void {
    const normalizedKey = this.normalizeKey(key);
    
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      expiry: ttl > 0 ? Date.now() + ttl : null
    };
    
    // Add to memory cache
    this.cache.set(normalizedKey, entry);
    
    // Enforce maximum entries limit
    if (this.cache.size > this.maxEntries) {
      this.evictOldest();
    }
    
    // Save to persistent storage if configured
    if (this.storageType !== 'memory') {
      this.saveToStorage(normalizedKey, entry);
    }
  }
  
  /**
   * Delete a cached value
   */
  delete(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);
    
    // Remove from memory cache
    const result = this.cache.delete(normalizedKey);
    
    // Remove from persistent storage if configured
    if (this.storageType !== 'memory') {
      try {
        const storage = this.getStorageAdapter();
        storage.removeItem(`${this.namespace}:${normalizedKey}`);
      } catch (e) {
        console.error('Failed to delete from storage:', e);
      }
    }
    
    return result;
  }
  
  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
    
    // Clear from persistent storage if configured
    if (this.storageType !== 'memory') {
      try {
        const storage = this.getStorageAdapter();
        const keysToRemove: string[] = [];
        
        // Find all keys for this namespace
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key?.startsWith(`${this.namespace}:`)) {
            keysToRemove.push(key);
          }
        }
        
        // Remove them
        keysToRemove.forEach(key => storage.removeItem(key));
      } catch (e) {
        console.error('Failed to clear storage:', e);
      }
    }
  }
  
  /**
   * Get all cached keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Get the number of cached entries
   */
  size(): number {
    return this.cache.size;
  }
  
  /**
   * Remove expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;
    
    // Check memory cache
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry && now > entry.expiry) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    // No easy way to check persistent storage without reading everything
    // so we'll skip that for performance reasons
    
    return removedCount;
  }
  
  /**
   * Normalize cache key
   */
  private normalizeKey(key: string): string {
    return key.trim().toLowerCase();
  }
  
  /**
   * Get the appropriate storage adapter
   */
  private getStorageAdapter(): Storage {
    if (this.storageType === 'local') {
      return localStorage;
    } else if (this.storageType === 'session') {
      return sessionStorage;
    }
    
    throw new Error('Invalid storage type');
  }
  
  /**
   * Remove oldest entries when cache is full
   */
  private evictOldest(): void {
    if (this.cache.size <= this.maxEntries) return;
    
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
  
  /**
   * Save entry to persistent storage
   */
  private saveToStorage(key: string, entry: CacheEntry<T>): void {
    try {
      const storage = this.getStorageAdapter();
      storage.setItem(
        `${this.namespace}:${key}`,
        JSON.stringify(entry)
      );
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  }
  
  /**
   * Get entry from persistent storage
   */
  private getFromStorage(key: string): T | null {
    try {
      const storage = this.getStorageAdapter();
      const data = storage.getItem(`${this.namespace}:${key}`);
      
      if (!data) return null;
      
      const entry = JSON.parse(data) as CacheEntry<T>;
      
      // Check if expired
      if (entry.expiry && Date.now() > entry.expiry) {
        storage.removeItem(`${this.namespace}:${key}`);
        return null;
      }
      
      // Add to memory cache
      this.cache.set(key, entry);
      
      return entry.value;
    } catch (e) {
      console.error('Failed to get from storage:', e);
      return null;
    }
  }
  
  /**
   * Restore cache from persistent storage
   */
  private restoreFromStorage(): void {
    try {
      const storage = this.getStorageAdapter();
      const now = Date.now();
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        
        if (key?.startsWith(`${this.namespace}:`)) {
          const normalizedKey = key.slice(this.namespace.length + 1);
          const data = storage.getItem(key);
          
          if (data) {
            try {
              const entry = JSON.parse(data) as CacheEntry<T>;
              
              // Skip if expired
              if (entry.expiry && now > entry.expiry) {
                storage.removeItem(key);
                continue;
              }
              
              // Add to memory cache
              this.cache.set(normalizedKey, entry);
            } catch (e) {
              // Invalid JSON, remove the entry
              storage.removeItem(key);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore from storage:', e);
    }
  }
}

// Create default export with common cache instances
export default {
  // Default memory cache for general use
  memory: new CacheManager<any>({ storageType: 'memory', namespace: 'app-memory' }),
  
  // Persistent cache for important data
  persistent: new CacheManager<any>({ storageType: 'local', namespace: 'app-persistent' }),
  
  // Session cache for current session only
  session: new CacheManager<any>({ storageType: 'session', namespace: 'app-session' }),
  
  // Create a new cache with custom options
  create: <T = any>(options: CacheOptions = {}) => new CacheManager<T>(options)
};
