
import { useEffect, useState, useRef, useCallback } from 'react';

interface VisibilityOptions {
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

interface VisibilityResult {
  setRef: (node: Element | null) => void;
  isVisible: boolean;
  wasEverVisible: boolean;
}

/**
 * Hook to observe when an element is visible in the viewport
 * Used to optimize rendering of offscreen components
 */
export default function useVisibilityObserver({
  rootMargin = '0px',
  threshold = 0,
  triggerOnce = false,
}: VisibilityOptions = {}): VisibilityResult {
  const [isVisible, setIsVisible] = useState(false);
  const [wasEverVisible, setWasEverVisible] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const currentElement = useRef<Element | null>(null);
  
  // Cleanup previous observer when component unmounts
  useEffect(() => {
    return () => {
      if (observer.current && currentElement.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, []);
  
  // Create setRef callback to observe new elements
  const setRef = useCallback(
    (node: Element | null) => {
      // Clean up previous observer if element changes
      if (currentElement.current && observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
      
      // Store new element reference
      currentElement.current = node;
      
      // Skip if no element or browser doesn't support IntersectionObserver
      if (!node || typeof IntersectionObserver === 'undefined') {
        setIsVisible(true); // Fallback to always visible
        setWasEverVisible(true);
        return;
      }
      
      // Create new observer
      observer.current = new IntersectionObserver(
        ([entry]) => {
          const newIsVisible = entry.isIntersecting;
          setIsVisible(newIsVisible);
          
          // If element becomes visible and we need to track it once
          if (newIsVisible) {
            setWasEverVisible(true);
            
            // If triggerOnce is true, stop observing after first visibility
            if (triggerOnce && observer.current) {
              observer.current.disconnect();
              observer.current = null;
            }
          }
        },
        { rootMargin, threshold }
      );
      
      // Start observing the new element
      observer.current.observe(node);
    },
    [rootMargin, threshold, triggerOnce]
  );
  
  return { setRef, isVisible, wasEverVisible };
}
