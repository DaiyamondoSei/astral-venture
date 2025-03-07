import { useCallback, useRef, useEffect } from 'react';

type EventHandler<T extends Event> = (event: T) => void;
type EventOptions = boolean | AddEventListenerOptions;

/**
 * Options for optimized event handling
 */
interface OptimizedEventOptions {
  passive?: boolean;
  capture?: boolean;
  once?: boolean;
  throttle?: number; // Throttle in ms (0 = no throttle)
  debounce?: number; // Debounce in ms (0 = no debounce)
  leading?: boolean; // For throttle/debounce, trigger on leading edge
  trailing?: boolean; // For throttle/debounce, trigger on trailing edge
}

/**
 * Hook for optimized event handling with built-in throttling/debouncing
 * and automatic cleanup
 */
export function useOptimizedEvent<K extends keyof HTMLElementEventMap>(
  eventType: K,
  handler: EventHandler<HTMLElementEventMap[K]>,
  element: HTMLElement | Window | Document | null = window,
  options: OptimizedEventOptions = {}
): void {
  const savedHandler = useRef<EventHandler<HTMLElementEventMap[K]>>(handler);
  const timeoutRef = useRef<number | null>(null);
  const lastCallTime = useRef<number>(0);
  
  // Set defaults for options
  const {
    passive = true,
    capture = false,
    once = false,
    throttle = 0,
    debounce = 0,
    leading = true,
    trailing = true
  } = options;
  
  // Always update ref to latest handler
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  // Create optimized handler with throttling/debouncing
  const optimizedHandler = useCallback((event: HTMLElementEventMap[K]) => {
    const currentTime = Date.now();
    
    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Handle throttling
    if (throttle > 0) {
      const elapsed = currentTime - lastCallTime.current;
      
      // If we haven't waited long enough, schedule trailing call if enabled
      if (elapsed < throttle) {
        if (trailing) {
          timeoutRef.current = window.setTimeout(() => {
            lastCallTime.current = Date.now();
            savedHandler.current(event);
          }, throttle - elapsed);
        }
        return;
      }
      
      // Update last call time and invoke handler
      lastCallTime.current = currentTime;
      savedHandler.current(event);
      return;
    }
    
    // Handle debouncing
    if (debounce > 0) {
      // If leading edge and no recent calls, invoke immediately
      if (leading && currentTime - lastCallTime.current > debounce) {
        lastCallTime.current = currentTime;
        savedHandler.current(event);
        return;
      }
      
      // Otherwise, schedule call for trailing edge
      if (trailing) {
        timeoutRef.current = window.setTimeout(() => {
          lastCallTime.current = Date.now();
          savedHandler.current(event);
        }, debounce);
      }
      return;
    }
    
    // No throttling or debouncing, just invoke handler
    savedHandler.current(event);
  }, [throttle, debounce, leading, trailing]);
  
  // Attach and clean up event listener
  useEffect(() => {
    if (!element) return;
    
    const listenerOptions: EventOptions = {
      passive,
      capture,
      once
    };
    
    element.addEventListener(eventType, optimizedHandler as EventListener, listenerOptions);
    
    return () => {
      element.removeEventListener(eventType, optimizedHandler as EventListener, capture);
      
      // Clear any pending timeouts
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [eventType, element, optimizedHandler, passive, capture, once]);
}

/**
 * Convenience hooks for common events
 */

export function useOptimizedScroll(
  handler: EventHandler<Event>,
  options: OptimizedEventOptions = {}
): void {
  useOptimizedEvent('scroll', handler, window, {
    throttle: 100, // Default throttle for scroll events
    passive: true,
    ...options
  });
}

export function useOptimizedResize(
  handler: EventHandler<UIEvent>,
  options: OptimizedEventOptions = {}
): void {
  useOptimizedEvent('resize', handler, window, {
    debounce: 200, // Default debounce for resize events
    ...options
  });
}

export function useOptimizedMouseMove(
  handler: EventHandler<MouseEvent>,
  element: HTMLElement | null = null,
  options: OptimizedEventOptions = {}
): void {
  useOptimizedEvent('mousemove', handler, element || document, {
    throttle: 50, // Default throttle for mousemove
    ...options
  });
}

export function useOptimizedPointerEvents(
  pointerDownHandler: EventHandler<PointerEvent>,
  pointerMoveHandler: EventHandler<PointerEvent>,
  pointerUpHandler: EventHandler<PointerEvent>,
  element: HTMLElement | null = null,
  options: OptimizedEventOptions = {}
): void {
  useOptimizedEvent('pointerdown', pointerDownHandler, element || document, options);
  useOptimizedEvent('pointermove', pointerMoveHandler, element || document, {
    throttle: 16, // ~60fps
    ...options
  });
  useOptimizedEvent('pointerup', pointerUpHandler, element || document, options);
  useOptimizedEvent('pointercancel', pointerUpHandler, element || document, options);
}
