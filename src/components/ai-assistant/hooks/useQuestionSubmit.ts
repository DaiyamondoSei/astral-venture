
import { useCallback } from 'react';
import { askAIAssistant } from '@/services/ai/assistant';
import { AIQuestion, AIResponse, AIQuestionOptions } from '@/services/ai/types';

interface AssistantState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResponse: (response: AIResponse) => void;
  setStreamingResponse: (text: string | null) => void;
  setModelInfo: (info: {model: string; tokens: number} | null) => void;
}

interface UseQuestionSubmitProps {
  state: AssistantState;
  reflectionContext?: string;
  selectedReflectionId?: string;
  userId: string;
  isMounted: React.MutableRefObject<boolean>;
}

// Cache for storing AI responses to prevent duplicate requests
const responseCache = new Map<string, {
  response: AIResponse,
  timestamp: number,
  expiresAt: number,
  isStreamingResponse: boolean
}>();

// Default cache TTL (10 minutes)
const DEFAULT_CACHE_TTL = 10 * 60 * 1000;

// Queue for tracking pending requests to prevent duplicates
const pendingRequests = new Set<string>();

// Maximum size for the response cache to prevent memory issues
const MAX_CACHE_SIZE = 100;

/**
 * Hook for submitting questions to the AI assistant
 * Optimized for performance and UX with backend processing
 */
export const useQuestionSubmit = ({
  state,
  reflectionContext,
  selectedReflectionId,
  userId,
  isMounted
}: UseQuestionSubmitProps) => {
  
  // Cleanup expired cache entries
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    let deletionCount = 0;
    
    // Delete expired entries
    for (const [key, entry] of responseCache.entries()) {
      if (now > entry.expiresAt) {
        responseCache.delete(key);
        deletionCount++;
      }
    }
    
    // If cache is still too large, remove oldest entries
    if (responseCache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(responseCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const entriesToDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
      entriesToDelete.forEach(([key]) => {
        responseCache.delete(key);
        deletionCount++;
      });
    }
    
    if (deletionCount > 0) {
      console.log(`Cleaned up ${deletionCount} cache entries, ${responseCache.size} remaining`);
    }
  }, []);
  
  // Generate cache key from question and context
  const getCacheKey = useCallback((question: AIQuestion | string): string => {
    const questionText = typeof question === 'string' ? question : question.text;
    const questionReflectionId = typeof question === 'string' ? selectedReflectionId : 
      (question.reflectionIds && question.reflectionIds.length > 0 ? question.reflectionIds[0] : undefined);
    
    return `${userId}:${questionText}:${questionReflectionId || ''}`;
  }, [userId, selectedReflectionId]);
  
  // Check if response is cached
  const getFromCache = useCallback((cacheKey: string, isStreamingRequest: boolean): AIResponse | null => {
    const cached = responseCache.get(cacheKey);
    if (!cached) return null;
    
    // Check if cache is still valid and matches request type
    if (Date.now() > cached.expiresAt || (isStreamingRequest && !cached.isStreamingResponse)) {
      responseCache.delete(cacheKey);
      return null;
    }
    
    console.log("Cache hit:", cacheKey);
    return cached.response;
  }, []);
  
  // Add response to cache
  const addToCache = useCallback((cacheKey: string, response: AIResponse, isStreamingResponse: boolean, ttl: number = DEFAULT_CACHE_TTL) => {
    // Clean up expired entries first
    cleanupCache();
    
    // Add new entry
    responseCache.set(cacheKey, {
      response,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      isStreamingResponse
    });
    
    console.log(`Added to cache with TTL of ${ttl}ms, cache size: ${responseCache.size}`);
  }, [cleanupCache]);
  
  // Check for network conditions to determine if streaming should be used
  const shouldUseStreaming = useCallback((): boolean => {
    if (!navigator.onLine) return false;
    
    // Check connection type if available
    // Using optional chaining to avoid errors on browsers that don't support navigator.connection
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      return !['slow-2g', '2g'].includes(effectiveType);
    }
    
    // Default to true if connection info not available
    return true;
  }, []);
  
  // Memoized submit function to prevent recreating on every render
  const submitQuestion = useCallback(async (question: AIQuestion | string) => {
    // Create a properly formatted question object
    const questionObj: AIQuestion = typeof question === 'string' 
      ? { text: question } 
      : question;
    
    // Validate inputs
    if (!questionObj.text.trim() || !userId) {
      console.log('Invalid question or missing userId');
      return null;
    }
    
    // Generate a request ID to prevent duplicate submissions
    const requestId = `${userId}:${questionObj.text}:${Date.now()}`;
    const cacheKey = getCacheKey(questionObj);
    
    // Check if this exact request is already pending
    if (pendingRequests.has(requestId)) {
      console.log('Duplicate request prevented');
      return null;
    }
    
    // Determine if we should use streaming based on network conditions
    const useStreaming = shouldUseStreaming();
    
    // Check if we have a cached response
    const cachedResponse = getFromCache(cacheKey, useStreaming);
    if (cachedResponse && isMounted.current) {
      console.log('Using cached response');
      state.setResponse(cachedResponse);
      
      // Still update model info from cache
      if (cachedResponse.meta) {
        state.setModelInfo({
          model: cachedResponse.meta.model || "unknown",
          tokens: cachedResponse.meta.tokenUsage || 0
        });
      }
      
      return cachedResponse;
    }
    
    pendingRequests.add(requestId);
    
    try {
      if (isMounted.current) {
        state.setLoading(true);
        state.setError(null);
        state.setStreamingResponse(null);
      } else {
        pendingRequests.delete(requestId);
        return null;
      }
      
      console.log("Submitting question:", {
        question: questionObj.text,
        reflectionContext: questionObj.context ? `${questionObj.context.substring(0, 20)}...` : null,
        selectedReflectionId: questionObj.reflectionIds && questionObj.reflectionIds.length > 0 ? questionObj.reflectionIds[0] : null,
        userId,
        isOnline: navigator.onLine,
        useStreaming
      });
      
      // Check online status before proceeding
      if (!navigator.onLine) {
        console.log("Device is offline, will use fallback response");
      }
      
      // Performance tracking
      const startTime = performance.now();
      
      // Ensure question has the stream property set
      questionObj.stream = useStreaming;
      
      // Create options object with timeout and cacheKey
      const options: AIQuestionOptions = {
        maxTokens: 1200, // Limit token usage for better performance
        cacheKey // Pass cache key for backend caching
      }; 
      
      // Call the API with exponential backoff retry mechanism
      const aiResponse = await askAIAssistant(questionObj, options);
      
      const responseTime = performance.now() - startTime;
      console.log(`AI response received in ${responseTime.toFixed(2)}ms`);
      
      // Cache the response for future use
      addToCache(cacheKey, aiResponse, useStreaming);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        // Set response in state
        state.setResponse(aiResponse);
        
        // Set model info if available
        if (aiResponse.meta) {
          state.setModelInfo({
            model: aiResponse.meta.model || "unknown",
            tokens: aiResponse.meta.tokenUsage || 0
          });
        }
      }
      
      return aiResponse;
    } catch (error) {
      console.error("Error submitting question:", error);
      if (isMounted.current) {
        state.setError(error instanceof Error ? error.message : "An unknown error occurred");
      }
      return null;
    } finally {
      if (isMounted.current) {
        state.setLoading(false);
      }
      pendingRequests.delete(requestId);
    }
  }, [
    userId, 
    isMounted, 
    state, 
    getCacheKey, 
    getFromCache, 
    addToCache,
    shouldUseStreaming
  ]);

  // Expose the submit function and cache utilities
  return { 
    submitQuestion,
    clearCache: useCallback(() => {
      responseCache.clear();
      console.log("AI response cache cleared");
    }, []),
    getCacheSize: useCallback(() => responseCache.size, [])
  };
};
