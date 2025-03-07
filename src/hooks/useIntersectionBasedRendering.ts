
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';

type IntersectionOptions = {
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  /** Skip observing on low-performance devices and always render */
  alwaysRenderOnLowPerformance?: boolean;
  /** Specify how elements should behave once they're no longer visible */
  unmountWhenNotVisible?: boolean;
  /** Keep rendered for this many ms after element goes out of view */
  visibilityGracePeriod?: number;
  /** Disable intersection observing and just return isVisible: true */
  disabled?: boolean;
};

type IntersectionResult = {
  /** Reference to attach to the observed element */
  ref: (node: Element | null) => void;
  /** Whether the element is currently in the viewport */
  isVisible: boolean;
  /** Whether the element has ever been visible */
  wasEverVisible: boolean;
  /** Percentage of element that is visible (0-1) */
  intersectionRatio: number;
  /** Force visibility programmatically */
  setForceVisible: (forceVisible: boolean) => void;
};

/**
 * Advanced hook for intelligent rendering based on viewport visibility
 * Offers more configurability than the basic useVisibilityObserver
 */
export function useIntersectionBasedRendering({
  rootMargin = '0px',
  threshold = 0,
  triggerOnce = false,
  alwaysRenderOnLowPerformance = true,
  unmountWhenNotVisible = false,
  visibilityGracePeriod = 1000,
  disabled = false,
}: IntersectionOptions = {}): IntersectionResult {
  const [isVisible, setIsVisible] = useState(false);
  const [wasEverVisible, setWasEverVisible] = useState(false);
  const [forceVisible, setForceVisible] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const element = useRef<Element | null>(null);
  const visibilityTimer = useRef<number | null>(null);
  const { isLowPerformance } = usePerformance();
  
  // If low performance device and alwaysRenderOnLowPerformance is true, 
  // skip intersection observing to avoid the overhead
  const bypassIntersectionObserver = 
    disabled || (isLowPerformance && alwaysRenderOnLowPerformance);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (visibilityTimer.current !== null) {
        window.clearTimeout(visibilityTimer.current);
      }
    };
  }, []);
  
  // Reference callback to observe elements
  const ref = useCallback(
    (node: Element | null) => {
      // Disconnect previous observer
      if (observer.current && element.current) {
        observer.current.unobserve(element.current);
        observer.current.disconnect();
      }
      
      // If bypassing or no node, update state and exit
      if (bypassIntersectionObserver || !node) {
        element.current = node;
        setIsVisible(true);
        setWasEverVisible(true);
        setIntersectionRatio(1);
        return;
      }
      
      // Skip if browser doesn't support IntersectionObserver
      if (typeof IntersectionObserver === 'undefined') {
        element.current = node;
        setIsVisible(true);
        setWasEverVisible(true);
        setIntersectionRatio(1);
        return;
      }
      
      // Update element ref
      element.current = node;
      
      // Create new observer
      observer.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const newIsVisible = entry.isIntersecting;
          
          // Clear any existing visibility timer
          if (visibilityTimer.current !== null) {
            window.clearTimeout(visibilityTimer.current);
            visibilityTimer.current = null;
          }
          
          // Update visibility state
          if (newIsVisible) {
            setIsVisible(true);
            setWasEverVisible(true);
            setIntersectionRatio(entry.intersectionRatio);
            
            // If triggerOnce is true, disconnect observer after first visibility
            if (triggerOnce && observer.current) {
              observer.current.disconnect();
              observer.current = null;
            }
          } else {
            // If element is no longer visible
            if (unmountWhenNotVisible) {
              // Add grace period before hiding
              if (visibilityGracePeriod > 0) {
                visibilityTimer.current = window.setTimeout(() => {
                  setIsVisible(false);
                  setIntersectionRatio(0);
                }, visibilityGracePeriod);
              } else {
                setIsVisible(false);
                setIntersectionRatio(0);
              }
            }
          }
        },
        { rootMargin, threshold }
      );
      
      // Start observing
      observer.current.observe(node);
    },
    [
      rootMargin, 
      threshold, 
      triggerOnce, 
      bypassIntersectionObserver, 
      unmountWhenNotVisible, 
      visibilityGracePeriod
    ]
  );
  
  // Compute final visibility, considering forced visibility
  const finalIsVisible = isVisible || forceVisible;
  
  return { 
    ref, 
    isVisible: finalIsVisible, 
    wasEverVisible, 
    intersectionRatio,
    setForceVisible
  };
}

// For backward compatibility
export const useVisibilityObserver = useIntersectionBasedRendering;
