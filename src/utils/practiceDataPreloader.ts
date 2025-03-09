
import { supabase } from '@/integrations/supabase/client';
import { mapDbPracticesToPractices } from '@/services/practice/practiceMappers';
import { Practice } from '@/services/practice/practiceService';

/**
 * Class to handle efficient practice data preloading and caching
 */
class PracticeDataPreloader {
  private basicPracticesCache: Practice[] = [];
  private allPracticesCache: Record<number, Practice[]> = {};
  private practiceByIdCache: Record<string, Practice> = {};
  private lastCacheTime = 0;
  private cacheValidityDuration = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Preload basic practices (level 1) for faster initial display
   */
  public async preloadBasicPractices(): Promise<Practice[]> {
    // Check if cache is still valid
    const now = Date.now();
    if (
      this.basicPracticesCache.length > 0 && 
      now - this.lastCacheTime < this.cacheValidityDuration
    ) {
      return this.basicPracticesCache;
    }
    
    try {
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .eq('level', 1)
        .order('title');
      
      if (error) {
        console.error('Error preloading basic practices:', error);
        return this.basicPracticesCache;
      }
      
      this.basicPracticesCache = mapDbPracticesToPractices(data || []);
      this.lastCacheTime = now;
      
      // Also cache by ID for faster lookups
      this.basicPracticesCache.forEach(practice => {
        this.practiceByIdCache[practice.id] = practice;
      });
      
      return this.basicPracticesCache;
    } catch (error) {
      console.error('Error in preloadBasicPractices:', error);
      return this.basicPracticesCache;
    }
  }
  
  /**
   * Preload practices for a specific level
   */
  public async preloadPracticesForLevel(level: number): Promise<Practice[]> {
    // Check if cache is still valid
    const now = Date.now();
    if (
      this.allPracticesCache[level] && 
      now - this.lastCacheTime < this.cacheValidityDuration
    ) {
      return this.allPracticesCache[level];
    }
    
    try {
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .eq('level', level)
        .order('title');
      
      if (error) {
        console.error(`Error preloading practices for level ${level}:`, error);
        return this.allPracticesCache[level] || [];
      }
      
      const practices = mapDbPracticesToPractices(data || []);
      this.allPracticesCache[level] = practices;
      this.lastCacheTime = now;
      
      // Also cache by ID for faster lookups
      practices.forEach(practice => {
        this.practiceByIdCache[practice.id] = practice;
      });
      
      return practices;
    } catch (error) {
      console.error(`Error in preloadPracticesForLevel(${level}):`, error);
      return this.allPracticesCache[level] || [];
    }
  }
  
  /**
   * Get a practice by ID, using the cache if available
   */
  public async getPracticeById(id: string): Promise<Practice | null> {
    // If in cache, return immediately
    if (this.practiceByIdCache[id]) {
      return this.practiceByIdCache[id];
    }
    
    try {
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching practice by ID:', error);
        return null;
      }
      
      const practice = mapDbPracticesToPractices([data])[0];
      this.practiceByIdCache[id] = practice;
      return practice;
    } catch (error) {
      console.error('Error in getPracticeById:', error);
      return null;
    }
  }
  
  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.basicPracticesCache = [];
    this.allPracticesCache = {};
    this.practiceByIdCache = {};
    this.lastCacheTime = 0;
  }
}

// Create a singleton instance
const practiceDataPreloader = new PracticeDataPreloader();

// Export preloader for usage in components/hooks
export default practiceDataPreloader;

// Convenience function to preload all basic data
export function preloadPracticeData(): void {
  practiceDataPreloader.preloadBasicPractices().catch(console.error);
}
