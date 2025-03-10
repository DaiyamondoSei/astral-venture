
/**
 * Advanced caching system with TTL, capacity management, and persistence
 */

export type CacheKey = string;

export interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // Timestamp when entry expires (null for no expiry)
  createdAt: number;        // Timestamp when entry was created
  lastAccessed: number;     // Timestamp when entry was last accessed
  hits: number;             // Number of times the entry has been accessed
  size?: number;            // Approximate size in bytes (if available)
  metadata?: Record<string, unknown>; // Additional metadata
}

export interface CacheOptions {
  ttl?: number;             // Time to live in milliseconds (default: no expiry)
  priority?: number;        // Priority (higher number = higher priority)
  size?: number;            // Size hint in bytes
  metadata?: Record<string, unknown>; // Additional metadata
  persistent?: boolean;     // Whether to persist across sessions
}

export interface CacheConfig {
  maxSize?: number;         // Maximum cache size in bytes
  maxEntries?: number;      // Maximum number of entries
  defaultTTL?: number;      // Default TTL in milliseconds
  persistenceKey?: string;  // Key for localStorage persistence
  autoSave?: boolean;       // Whether to auto-save to storage
  autoCleanupInterval?: number; // Interval to automatically clean expired items
}

export class CacheManager<T = any> {
  private cache: Map<CacheKey, CacheEntry<T>> = new Map();
  private size: number = 0;
  private config: Required<CacheConfig>;
  private cleanupTimer: number | null = null;

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize || 10 * 1024 * 1024, // 10MB default
      maxEntries: config.maxEntries || 1000,
      defaultTTL: config.defaultTTL || 0, // 0 = no expiry
      persistenceKey: config.persistenceKey || 'appCache',
      autoSave: config.autoSave !== undefined ? config.autoSave : true,
      autoCleanupInterval: config.autoCleanupInterval || 60000, // 1 minute
    };

    // Load from persistence if key provided
    if (this.config.persistenceKey) {
      this.loadFromStorage();
    }

    // Set up automatic cleanup
    if (this.config.autoCleanupInterval > 0) {
      this.cleanupTimer = window.setInterval(
        () => this.cleanup(),
        this.config.autoCleanupInterval
      );
    }
  }

  /**
   * Set a cache entry
   */
  set(key: CacheKey, value: T, options: CacheOptions = {}): void {
    // Generate metrics on the cache entry if not provided
    const size = options.size || this.estimateSize(value);
    const ttl = options.ttl !== undefined ? options.ttl : this.config.defaultTTL;
    const expiresAt = ttl > 0 ? Date.now() + ttl : null;
    const now = Date.now();

    // Create or update cache entry
    const existingEntry = this.cache.get(key);
    const entry: CacheEntry<T> = {
      value,
      expiresAt,
      createdAt: existingEntry?.createdAt || now,
      lastAccessed: now,
      hits: existingEntry?.hits || 0,
      size,
      metadata: {
        ...existingEntry?.metadata,
        ...options.metadata,
        priority: options.priority || 0,
        persistent: options.persistent || false,
      },
    };

    // Update cache size tracking
    if (existingEntry) {
      this.size -= existingEntry.size || 0;
    }
    this.size += size;

    // Set the cache entry
    this.cache.set(key, entry);

    // Check if cache capacity is exceeded
    this.enforceCapacity();

    // Auto-save if enabled
    if (this.config.autoSave && options.persistent) {
      this.saveToStorage();
    }
  }

  /**
   * Get a cache entry
   */
  get<R = T>(key: CacheKey): R | undefined {
    const entry = this.cache.get(key);

    // Return undefined if entry doesn't exist
    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
      this.delete(key);
      return undefined;
    }

    // Update access metrics
    entry.lastAccessed = Date.now();
    entry.hits++;

    return entry.value as R;
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: CacheKey): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check for expiration
    if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a cache entry
   */
  delete(key: CacheKey): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Update size tracking
    this.size -= entry.size || 0;
    
    // Remove from cache
    const result = this.cache.delete(key);

    // Auto-save if enabled and the entry was persistent
    if (this.config.autoSave && entry.metadata?.persistent) {
      this.saveToStorage();
    }

    return result;
  }

  /**
   * Get all cache keys
   */
  keys(): IterableIterator<CacheKey> {
    return this.cache.keys();
  }

  /**
   * Get all cache entries
   */
  entries(): IterableIterator<[CacheKey, CacheEntry<T>]> {
    return this.cache.entries();
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
    this.size = 0;

    // Auto-save if enabled
    if (this.config.autoSave) {
      this.clearStorage();
    }
  }

  /**
   * Get the number of entries in the cache
   */
  get count(): number {
    return this.cache.size;
  }

  /**
   * Get the total size of cached data in bytes
   */
  get totalSize(): number {
    return this.size;
  }

  /**
   * Clean up expired entries and return the number of removed entries
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt !== null && entry.expiresAt < now) {
        this.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Enforce capacity constraints by removing least valuable entries
   */
  private enforceCapacity(): void {
    // Check if we need to reduce cache size
    if (
      this.cache.size <= this.config.maxEntries &&
      this.size <= this.config.maxSize
    ) {
      return;
    }

    // Get all entries and sort by priority, then by last accessed
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      // First by priority (higher better)
      const priorityA = a[1].metadata?.priority as number || 0;
      const priorityB = b[1].metadata?.priority as number || 0;
      if (priorityB !== priorityA) return priorityB - priorityA;
      
      // Then by last accessed (newer better)
      return b[1].lastAccessed - a[1].lastAccessed;
    });

    // Remove entries from the end until we're under capacity
    while (
      (this.cache.size > this.config.maxEntries || this.size > this.config.maxSize) &&
      entries.length > 0
    ) {
      const [key] = entries.pop()!;
      this.delete(key);
    }
  }

  /**
   * Save cache to browser storage
   */
  saveToStorage(): void {
    if (!this.config.persistenceKey || typeof localStorage === 'undefined') {
      return;
    }

    // Only save entries marked as persistent
    const persistentEntries: Record<string, CacheEntry<T>> = {};
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata?.persistent) {
        persistentEntries[key] = entry;
      }
    }

    try {
      localStorage.setItem(
        this.config.persistenceKey,
        JSON.stringify(persistentEntries)
      );
    } catch (error) {
      console.error('Failed to save cache to storage:', error);
    }
  }

  /**
   * Load cache from browser storage
   */
  loadFromStorage(): void {
    if (!this.config.persistenceKey || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const data = localStorage.getItem(this.config.persistenceKey);
      if (!data) return;

      const entries = JSON.parse(data) as Record<string, CacheEntry<T>>;
      for (const [key, entry] of Object.entries(entries)) {
        // Skip expired entries
        if (entry.expiresAt !== null && entry.expiresAt < Date.now()) continue;
        
        // Add to cache
        this.cache.set(key, entry);
        this.size += entry.size || 0;
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
    }
  }

  /**
   * Clear persisted cache from storage
   */
  clearStorage(): void {
    if (!this.config.persistenceKey || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.config.persistenceKey);
    } catch (error) {
      console.error('Failed to clear cache from storage:', error);
    }
  }

  /**
   * Estimate the size of a value in bytes
   */
  private estimateSize(value: any): number {
    if (value === null || value === undefined) return 0;
    
    // For strings, use the length as a rough approximation
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16 uses 2 bytes per character
    }
    
    // For objects and arrays, stringify and measure
    if (typeof value === 'object') {
      try {
        const json = JSON.stringify(value);
        return json.length * 2;
      } catch (e) {
        // Fallback for non-stringifiable objects
        return 1024; // 1KB as a default for complex objects
      }
    }
    
    // For numbers and booleans
    return 8;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// Export singleton instance for app-wide caching
export const appCache = new CacheManager({
  persistenceKey: 'app-cache',
  maxSize: 20 * 1024 * 1024, // 20MB
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  autoCleanupInterval: 5 * 60 * 1000 // 5 minutes
});
