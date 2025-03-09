
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

interface EventBatchOptions {
  batchSize?: number;
  flushInterval?: number;
  autoFlush?: boolean;
  endpoint: string;
  onFlushComplete?: (response: any) => void;
  onFlushError?: (error: Error) => void;
}

/**
 * Hook for batching events before sending to the server
 */
export function useEventBatch<T = any>(options: EventBatchOptions) {
  const {
    batchSize = 10,
    flushInterval = 30000, // 30 seconds
    autoFlush = true,
    endpoint,
    onFlushComplete,
    onFlushError
  } = options;

  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<T[]>([]);
  const [isFlushing, setIsFlushing] = useState(false);
  const [lastFlushTime, setLastFlushTime] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add an event to the batch
  const addEvent = useCallback((event: T) => {
    setEvents(prev => [...prev, event]);
  }, []);

  // Add multiple events to the batch
  const addEvents = useCallback((newEvents: T[]) => {
    setEvents(prev => [...prev, ...newEvents]);
  }, []);

  // Flush the events to the server
  const flushEvents = useCallback(async () => {
    if (!isAuthenticated || !user || events.length === 0) {
      return;
    }

    try {
      setIsFlushing(true);
      setError(null);

      // Call the edge function with the batched events
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {
          events,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Clear the events after successful flush
      setEvents([]);
      setLastFlushTime(new Date());

      // Call the onFlushComplete callback
      if (onFlushComplete) {
        onFlushComplete(data);
      }

      return data;
    } catch (err: any) {
      const errorObj = new Error(err.message || `Error flushing events to ${endpoint}`);
      setError(errorObj);
      
      // Call the onFlushError callback
      if (onFlushError) {
        onFlushError(errorObj);
      }

      return null;
    } finally {
      setIsFlushing(false);
    }
  }, [events, isAuthenticated, user, endpoint, onFlushComplete, onFlushError]);

  // Flush events when batch size is reached
  useEffect(() => {
    if (events.length >= batchSize && !isFlushing) {
      flushEvents();
    }
  }, [events, batchSize, isFlushing, flushEvents]);

  // Set up automatic flush interval
  useEffect(() => {
    if (autoFlush && isAuthenticated) {
      flushIntervalRef.current = setInterval(() => {
        if (events.length > 0 && !isFlushing) {
          flushEvents();
        }
      }, flushInterval);
    }

    return () => {
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
      }
    };
  }, [autoFlush, events.length, flushInterval, isFlushing, isAuthenticated, flushEvents]);

  return {
    events,
    addEvent,
    addEvents,
    flushEvents,
    isFlushing,
    lastFlushTime,
    error,
    eventCount: events.length
  };
}
