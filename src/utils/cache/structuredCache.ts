
/**
 * Structured data cache for offline capability
 * Provides type-safe caching with TTL and size limits
 */

export interface CacheOptions {
  name: string;
  maxSize?: number;
  defaultTTL?: number;
  storageType?: 'memory' | 'localStorage' | 'sessionStorage';
  debug?: boolean;
  onEviction?: (key: string, value: unknown) => void;
}

export interface CacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
}

export interface CacheStats {
  name: string;
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  evictions: number;
}

export class StructuredCache<T> {
  private name: string;
  private maxSize: number;
  private defaultTTL: number;
  private storageType: 'memory' | 'localStorage' | 'sessionStorage';
  private debug: boolean;
  private onEviction?: (key: string, value: T) => void;
  
  private cache: Map<string, CacheEntry<T>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };
  
  constructor(options: CacheOptions) {
    this.name = options.name;
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 1000 * 60 * 5; // 5 minutes
    this.storageType = options.storageType || 'memory';
    this.debug = options.debug || false;
    this.onEviction = options.onEviction as (key: string, value: T) => void;
    
    // Load from persistent storage if configured
    this.loadFromStorage();
  }
  
  /**
   * Set a value in the cache
   */
  set(
    key: string,
    value: T,
    options: {
      ttl?: number;
      metadata?: Record<string, unknown>;
    } = {}
  ): void {
    const { ttl, metadata } = options;
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      metadata
    };
    
    if (ttl !== undefined) {
      entry.expiresAt = now + ttl;
    } else if (this.defaultTTL > 0) {
      entry.expiresAt = now + this.defaultTTL;
    }
    
    // Check if we need to evict entries due to size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }
    
    this.cache.set(key, entry);
    
    if (this.debug) {
      console.log(`Cache "${this.name}": Set ${key}`);
    }
    
    // Update persistent storage if configured
    this.saveToStorage();
  }
  
  /**
   * Get a value from the cache
   */
  get<R = T>(key: string): R | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      
      if (this.debug) {
        console.log(`Cache "${this.name}": Miss ${key}`);
      }
      
      return undefined;
    }
    
    // Check if entry has expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.stats.evictions++;
      
      if (this.debug) {
        console.log(`Cache "${this.name}": Expired ${key}`);
      }
      
      // Update persistent storage if configured
      this.saveToStorage();
      
      return undefined;
    }
    
    this.stats.hits++;
    
    if (this.debug) {
      console.log(`Cache "${this.name}": Hit ${key}`);
    }
    
    return entry.value as unknown as R;
  }
  
  /**
   * Check if a key exists in the cache and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    // Check if entry has expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.stats.evictions++;
      
      if (this.debug) {
        console.log(`Cache "${this.name}": Expired ${key}`);
      }
      
      // Update persistent storage if configured
      this.saveToStorage();
      
      return false;
    }
    
    return true;
  }
  
  /**
   * Delete a value from the cache
   */
  delete(key: string): boolean {
    const existed = this.cache.delete(key);
    
    if (existed && this.debug) {
      console.log(`Cache "${this.name}": Delete ${key}`);
    }
    
    // Update persistent storage if configured
    if (existed) {
      this.saveToStorage();
    }
    
    return existed;
  }
  
  /**
   * Clear all values from the cache
   */
  clear(): void {
    this.cache.clear();
    
    if (this.debug) {
      console.log(`Cache "${this.name}": Cleared`);
    }
    
    // Update persistent storage if configured
    this.saveToStorage();
  }
  
  /**
   * Get the size of the cache
   */
  size(): number {
    return this.cache.size;
  }
  
  /**
   * Get all keys in the cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Get all values in the cache
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.value);
  }
  
  /**
   * Get all entries in the cache
   */
  entries(): Array<[string, CacheEntry<T>]> {
    return Array.from(this.cache.entries());
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      name: this.name,
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions
    };
  }
  
  /**
   * Set the maximum size of the cache
   */
  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;
    
    // Evict entries if we're over the new limit
    while (this.cache.size > this.maxSize) {
      this.evictOldest();
    }
  }
  
  /**
   * Set the default TTL for entries
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }
  
  /**
   * Evict the oldest entry from the cache
   */
  private evictOldest(): void {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestKey = key;
        oldestTime = entry.createdAt;
      }
    }
    
    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      
      if (this.debug) {
        console.log(`Cache "${this.name}": Evicted ${oldestKey}`);
      }
      
      if (this.onEviction && entry) {
        this.onEviction(oldestKey, entry.value);
      }
    }
  }
  
  /**
   * Save cache to persistent storage
   */
  private saveToStorage(): void {
    if (this.storageType === 'memory') {
      return;
    }
    
    try {
      const serialized = JSON.stringify({
        entries: Array.from(this.cache.entries()),
        stats: this.stats
      });
      
      if (this.storageType === 'localStorage') {
        localStorage.setItem(`cache:${this.name}`, serialized);
      } else if (this.storageType === 'sessionStorage') {
        sessionStorage.setItem(`cache:${this.name}`, serialized);
      }
    } catch (error) {
      console.error(`Error saving cache "${this.name}" to storage:`, error);
    }
  }
  
  /**
   * Load cache from persistent storage
   */
  private loadFromStorage(): void {
    if (this.storageType === 'memory') {
      return;
    }
    
    try {
      let serialized: string | null;
      
      if (this.storageType === 'localStorage') {
        serialized = localStorage.getItem(`cache:${this.name}`);
      } else if (this.storageType === 'sessionStorage') {
        serialized = sessionStorage.getItem(`cache:${this.name}`);
      } else {
        return;
      }
      
      if (!serialized) {
        return;
      }
      
      const data = JSON.parse(serialized);
      
      // Restore entries
      if (data.entries) {
        for (const [key, entry] of data.entries) {
          // Skip expired entries
          if (entry.expiresAt && entry.expiresAt < Date.now()) {
            continue;
          }
          
          this.cache.set(key, entry);
        }
      }
      
      // Restore stats
      if (data.stats) {
        this.stats = { ...this.stats, ...data.stats };
      }
      
      if (this.debug) {
        console.log(`Cache "${this.name}": Loaded from storage, ${this.cache.size} entries`);
      }
    } catch (error) {
      console.error(`Error loading cache "${this.name}" from storage:`, error);
    }
  }
}

// Cache factory for creating type-safe caches
export function createCache<T>(options: CacheOptions): StructuredCache<T> {
  return new StructuredCache<T>(options);
}

// Global cache registry
const cacheRegistry: Record<string, StructuredCache<unknown>> = {};

// Get or create a cache by name
export function getCache<T>(name: string, options?: Partial<CacheOptions>): StructuredCache<T> {
  if (!cacheRegistry[name]) {
    cacheRegistry[name] = new StructuredCache<T>({
      name,
      ...options
    });
  }
  
  return cacheRegistry[name] as StructuredCache<T>;
}

// Clear all caches
export function clearAllCaches(): void {
  Object.values(cacheRegistry).forEach(cache => cache.clear());
}
