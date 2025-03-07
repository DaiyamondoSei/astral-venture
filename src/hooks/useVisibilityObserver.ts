
import { useRef, useEffect, useState, useCallback } from 'react';

interface UseVisibilityObserverOptions {
  rootMargin?: string;
  threshold?: number | number[];
  disabled?: boolean;
}

/**
 * Hook to track whether an element is visible in the viewport
 * Used to optimize animations by pausing them when not visible
 */
export const useVisibilityObserver = (
  options: UseVisibilityObserverOptions = {}
) => {
  const { rootMargin = '0px', threshold = 0, disabled = false } = options;
  
  const [isVisible, setIsVisible] = useState(false);
  const [wasEverVisible, setWasEverVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Cleanup function to disconnect observer
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Setup observer
  useEffect(() => {
    // Skip if disabled or running in non-browser environment
    if (disabled || typeof window === 'undefined') {
      setIsVisible(true); // Assume visible when disabled
      return;
    }

    cleanup();

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const newIsVisible = entry.isIntersecting;
        
        setIsVisible(newIsVisible);
        
        if (newIsVisible && !wasEverVisible) {
          setWasEverVisible(true);
        }
      },
      { rootMargin, threshold }
    );
    
    observerRef.current = observer;

    return cleanup;
  }, [rootMargin, threshold, disabled, cleanup, wasEverVisible]);

  // Observe element when ref changes
  const setRef = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      cleanup();
    }

    if (element && observerRef.current) {
      elementRef.current = element;
      observerRef.current.observe(element);
    }
  }, [cleanup]);

  return { setRef, isVisible, wasEverVisible };
};

export default useVisibilityObserver;
