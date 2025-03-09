
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

// Types for batch events
interface BatchEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

// Config for batching
interface BatchConfig {
  maxBatchSize?: number;
  maxWaitTime?: number;
  endpoint?: string;
  processingFunction?: (events: BatchEvent[]) => Promise<any>;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for batching events before sending to the backend
 * Efficiently collects user events and sends them in batches
 */
export function useEventBatch(defaultConfig?: BatchConfig) {
  const { user } = useAuth();
  const [eventQueue, setEventQueue] = useState<BatchEvent[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const sending = useRef<boolean>(false);
  const [status, setStatus] = useState({
    lastSentBatch: null as any,
    lastError: null as any,
    isSending: false,
    totalEventsSent: 0,
    totalBatchesSent: 0
  });

  // Default configuration
  const config = {
    maxBatchSize: defaultConfig?.maxBatchSize || 15,
    maxWaitTime: defaultConfig?.maxWaitTime || 5000, // 5 seconds
    endpoint: defaultConfig?.endpoint || 'track-achievement',
    processingFunction: defaultConfig?.processingFunction,
    onSuccess: defaultConfig?.onSuccess,
    onError: defaultConfig?.onError
  };

  // Process the batch of events
  const processBatch = useCallback(async () => {
    if (!user || sending.current || eventQueue.length === 0) return;
    
    try {
      sending.current = true;
      setStatus(prev => ({ ...prev, isSending: true }));
      
      // Make a copy of the current queue and clear it
      const events = [...eventQueue];
      setEventQueue([]);
      
      let response;
      
      // Use custom processing function if provided
      if (config.processingFunction) {
        response = await config.processingFunction(events);
      } else {
        // Default: send events to the specified Supabase Edge Function
        const { data, error } = await supabase.functions.invoke(config.endpoint, {
          body: { events }
        });
        
        if (error) throw error;
        response = data;
      }
      
      // Update status on success
      setStatus(prev => ({
        ...prev,
        isSending: false,
        lastSentBatch: events,
        lastError: null,
        totalEventsSent: prev.totalEventsSent + events.length,
        totalBatchesSent: prev.totalBatchesSent + 1
      }));
      
      // Call success callback if provided
      if (config.onSuccess) {
        config.onSuccess(response);
      }
      
      return response;
    } catch (error) {
      console.error('Error processing event batch:', error);
      
      // Update status on error
      setStatus(prev => ({
        ...prev, 
        isSending: false,
        lastError: error
      }));
      
      // Call error callback if provided
      if (config.onError) {
        config.onError(error);
      }
      
      // Re-queue events on error
      setEventQueue(prev => [
        ...prev,
        ...eventQueue
      ]);
      
      return null;
    } finally {
      sending.current = false;
    }
  }, [user, eventQueue, config]);

  // Add an event to the queue
  const addEvent = useCallback((type: string, data: Record<string, any> = {}) => {
    if (!user) return;
    
    const event: BatchEvent = {
      type,
      data,
      timestamp: Date.now()
    };
    
    setEventQueue(prev => [...prev, event]);
    
    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout for processing
    timeoutRef.current = window.setTimeout(() => {
      processBatch();
      timeoutRef.current = null;
    }, config.maxWaitTime);
  }, [user, config.maxWaitTime, processBatch]);
  
  // Process immediately when batch size is reached
  useEffect(() => {
    if (eventQueue.length >= config.maxBatchSize) {
      // Clear any existing timeout
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      processBatch();
    }
  }, [eventQueue, config.maxBatchSize, processBatch]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      
      // Process any remaining events
      if (eventQueue.length > 0) {
        processBatch();
      }
    };
  }, [eventQueue, processBatch]);
  
  // Force process the queue immediately
  const flush = useCallback(() => {
    if (eventQueue.length > 0) {
      // Clear any existing timeout
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      return processBatch();
    }
    return Promise.resolve(null);
  }, [eventQueue, processBatch]);
  
  return {
    addEvent,
    flush,
    queueLength: eventQueue.length,
    ...status
  };
}
