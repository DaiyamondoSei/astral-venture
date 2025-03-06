
import { AIResponse } from './types';

// Common questions and their cached responses to avoid repeated API calls
const CACHED_RESPONSES = new Map<string, {
  answer: string;
  suggestedPractices: string[];
  timestamp: number;
}>();

// Maximum age for cached responses in milliseconds (1 day)
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000;

// localStorage key for persistent cache
const LOCAL_STORAGE_CACHE_KEY = 'quantum_ai_response_cache';

/**
 * Initialize cache from localStorage on app start
 */
export function initializeCache(): void {
  try {
    const savedCache = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (savedCache) {
      const parsed = JSON.parse(savedCache);
      
      // Convert the parsed object back to a Map
      Object.entries(parsed).forEach(([question, responseData]) => {
        CACHED_RESPONSES.set(question, responseData as any);
      });
      
      console.log(`Loaded ${CACHED_RESPONSES.size} cached responses from storage`);
      
      // Clean expired items
      cleanExpiredCache();
    }
  } catch (e) {
    console.error('Failed to load cache from localStorage:', e);
  }
}

/**
 * Save the current cache to localStorage
 */
function persistCache(): void {
  try {
    // Convert Map to a plain object for serialization
    const cacheObject = Object.fromEntries(CACHED_RESPONSES.entries());
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(cacheObject));
  } catch (e) {
    console.error('Failed to persist cache to localStorage:', e);
  }
}

/**
 * Remove expired items from cache
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  let expiredCount = 0;
  
  for (const [key, value] of CACHED_RESPONSES.entries()) {
    if (now - value.timestamp > MAX_CACHE_AGE) {
      CACHED_RESPONSES.delete(key);
      expiredCount++;
    }
  }
  
  if (expiredCount > 0) {
    console.log(`Removed ${expiredCount} expired items from cache`);
    persistCache();
  }
}

/**
 * Check if there's a cached response for the question
 * @param question User's question
 * @returns Cached response if available, null otherwise
 */
export function getCachedResponse(question: string): {
  answer: string;
  suggestedPractices: string[];
} | null {
  // Initialize cache from localStorage if not done already
  if (CACHED_RESPONSES.size === 0) {
    initializeCache();
  }
  
  // Normalize the question to improve cache hits
  const normalizedQuestion = question.toLowerCase().trim();
  
  // Common prefixes to remove for better matching
  const prefixes = [
    "can you tell me about", "what is", "how do i", "explain", 
    "tell me about", "i want to know about", "please explain"
  ];
  
  // Try to match any cached response
  for (const [cachedQuestion, cachedResponse] of CACHED_RESPONSES.entries()) {
    // Skip expired cache entries
    if (Date.now() - cachedResponse.timestamp > MAX_CACHE_AGE) {
      CACHED_RESPONSES.delete(cachedQuestion);
      continue;
    }
    
    let normalizedCached = cachedQuestion.toLowerCase().trim();
    
    // If the questions are very similar, return the cached response
    if (normalizedQuestion === normalizedCached) {
      return {
        answer: cachedResponse.answer,
        suggestedPractices: cachedResponse.suggestedPractices
      };
    }
    
    // Try matching without common prefixes
    for (const prefix of prefixes) {
      const questionWithoutPrefix = normalizedQuestion.startsWith(prefix) 
        ? normalizedQuestion.substring(prefix.length).trim() 
        : normalizedQuestion;
        
      const cachedWithoutPrefix = normalizedCached.startsWith(prefix)
        ? normalizedCached.substring(prefix.length).trim()
        : normalizedCached;
        
      if (questionWithoutPrefix === cachedWithoutPrefix) {
        return {
          answer: cachedResponse.answer,
          suggestedPractices: cachedResponse.suggestedPractices
        };
      }
    }
  }
  
  return null;
}

/**
 * Cache a response for future reference
 * @param question User's question
 * @param response AI response to cache
 */
export function cacheResponse(question: string, response: AIResponse): void {
  // Don't cache very short responses or if caching is disabled
  if (response.answer.length < 50 || !response.meta || response.meta.model === "fallback") {
    return;
  }
  
  // Store in cache with timestamp
  CACHED_RESPONSES.set(question, {
    answer: response.answer,
    suggestedPractices: response.suggestedPractices || [],
    timestamp: Date.now()
  });
  
  // Limit cache size to 50 entries by removing oldest if needed
  if (CACHED_RESPONSES.size > 50) {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, value] of CACHED_RESPONSES.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      CACHED_RESPONSES.delete(oldestKey);
    }
  }
  
  // Save updated cache to localStorage
  persistCache();
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  CACHED_RESPONSES.clear();
  localStorage.removeItem(LOCAL_STORAGE_CACHE_KEY);
  console.log('AI response cache cleared');
}
