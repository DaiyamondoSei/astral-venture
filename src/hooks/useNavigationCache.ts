
import { useState, useEffect } from 'react';

interface CacheOptions {
  expirationTime: number; // Time in milliseconds
}

/**
 * A hook for caching navigation data to reduce server load
 * @param cacheKey Unique identifier for the cached data
 * @param fetchFunction Function to fetch data if cache is empty or expired
 * @param options Cache configuration options
 * @returns Cached data and loading state
 */
export function useNavigationCache<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  options: CacheOptions = { expirationTime: 5 * 60 * 1000 } // Default 5 minutes
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if we have cached data
        const cachedItem = localStorage.getItem(`cache:${cacheKey}`);
        
        if (cachedItem) {
          const { data: cachedData, timestamp } = JSON.parse(cachedItem);
          const cacheAge = Date.now() - timestamp;
          
          // Use cached data if it's not expired
          if (cacheAge < options.expirationTime) {
            setData(cachedData);
            setIsLoading(false);
            return;
          }
        }
        
        // Fetch fresh data if cache is empty or expired
        const freshData = await fetchFunction();
        
        // Update the cache
        localStorage.setItem(
          `cache:${cacheKey}`,
          JSON.stringify({
            data: freshData,
            timestamp: Date.now()
          })
        );
        
        setData(freshData);
      } catch (err) {
        console.error('Error in navigation cache:', err);
        setError(err instanceof Error ? err.message : 'Unknown error fetching data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [cacheKey, fetchFunction, options.expirationTime]);

  return { data, isLoading, error };
}

export default useNavigationCache;
