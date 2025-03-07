
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';

interface VisibilityObserverOptions {
  rootMargin?: string;
  threshold?: number | number[];
  skipWhenLowPerformance?: boolean;
}

/**
 * Hook to observe element visibility with optimized intersection observer
 * Provides ref function, visibility state, and intersection details
 */
export default function useVisibilityObserver({
  rootMargin = '0px',
  threshold = 0,
  skipWhenLowPerformance = false
}: VisibilityObserverOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { isLowPerformance } = usePerformance();
  
  // Skip observer when on low performance if flag is set
  const shouldSkipObserver = skipWhenLowPerformance && isLowPerformance;
  
  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);
  
  // Set up the intersection observer
  useEffect(() => {
    // If we're skipping observation on low performance devices, 
    // just set elements as always visible
    if (shouldSkipObserver) {
      setIsVisible(true);
      setIntersectionRatio(1);
      return;
    }
    
    // Skip if IntersectionObserver is not supported
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true); // Assume visible if not supported
      return;
    }
    
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
        setIntersectionRatio(entry.intersectionRatio);
      },
      { rootMargin, threshold }
    );
    
    // Start observing if we have an element
    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [rootMargin, threshold, shouldSkipObserver]);
  
  // Ref setter function that saves the element and sets up observation
  const setRef = useCallback((element: Element | null) => {
    // Skip if nothing changed
    if (element === elementRef.current) return;
    
    // Clean up old observer
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
    
    // Save new element
    elementRef.current = element;
    
    // Start observing new element
    if (observerRef.current && element && !shouldSkipObserver) {
      observerRef.current.observe(element);
    }
  }, [shouldSkipObserver]);
  
  return {
    setRef,
    isVisible: shouldSkipObserver ? true : isVisible,
    intersectionRatio: shouldSkipObserver ? 1 : intersectionRatio,
    element: elementRef.current
  };
}
