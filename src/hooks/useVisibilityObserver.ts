
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';

interface VisibilityObserverOptions {
  rootMargin?: string;
  threshold?: number | number[];
  skipWhenLowPerformance?: boolean;
  enableOptimization?: boolean;
}

/**
 * Hook to observe element visibility with optimized intersection observer
 * Provides ref function, visibility state, and intersection details
 */
export default function useVisibilityObserver({
  rootMargin = '0px',
  threshold = 0,
  skipWhenLowPerformance = false,
  enableOptimization = true
}: VisibilityObserverOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const [wasEverVisible, setWasEverVisible] = useState(false);
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
  
  // Set up the intersection observer with optimizations based on device capability
  useEffect(() => {
    // If we're skipping observation on low performance devices, 
    // just set elements as always visible
    if (shouldSkipObserver) {
      setIsVisible(true);
      setIntersectionRatio(1);
      setWasEverVisible(true);
      return;
    }
    
    // Skip if IntersectionObserver is not supported
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true); // Assume visible if not supported
      setWasEverVisible(true);
      return;
    }
    
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create observer with performance optimization
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        
        // Update visibility state
        setIsVisible(entry.isIntersecting);
        setIntersectionRatio(entry.intersectionRatio);
        
        // Track if element was ever visible (useful for one-time animations)
        if (entry.isIntersecting && !wasEverVisible) {
          setWasEverVisible(true);
        }
        
        // Optimization: If element has been visible and we don't need to track when it becomes invisible,
        // we can disconnect the observer to save resources
        if (enableOptimization && entry.isIntersecting && !wasEverVisible) {
          // For components that only need to be loaded once and don't need to be
          // paused when scrolled out of view, we can disconnect after first visibility
          if (observerRef.current && !enableOptimization) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        }
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
  }, [rootMargin, threshold, shouldSkipObserver, wasEverVisible, enableOptimization]);
  
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
    wasEverVisible,
    intersectionRatio: shouldSkipObserver ? 1 : intersectionRatio,
    element: elementRef.current
  };
}
