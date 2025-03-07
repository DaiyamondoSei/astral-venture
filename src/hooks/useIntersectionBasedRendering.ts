
import { useState, useEffect, useRef } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';

interface IntersectionRenderingOptions {
  rootMargin?: string;
  threshold?: number | number[];
  unrenderDelay?: number;
  alwaysRender?: boolean;
  preRenderDistance?: string;
}

/**
 * Hook for performance optimization that renders components only when they're visible
 * or about to become visible in the viewport
 */
export function useIntersectionBasedRendering({
  rootMargin = '200px 0px',
  threshold = 0,
  unrenderDelay = 1000,
  alwaysRender = false,
  preRenderDistance = '200px'
}: IntersectionRenderingOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const unrenderTimeoutRef = useRef<number | null>(null);
  const { isLowPerformance } = usePerformance();
  
  // For very low-end devices, increase the pre-render distance to account for slower rendering
  const effectiveRootMargin = isLowPerformance 
    ? '400px 0px' // Give more headroom on low-performance devices
    : rootMargin;
  
  useEffect(() => {
    // If we always want to render (e.g. for critical UI), skip intersection observer
    if (alwaysRender) {
      setShouldRender(true);
      return;
    }
    
    // Create intersection observer to detect when element is visible
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isIntersecting = entry.isIntersecting;
        
        setIsVisible(isIntersecting);
        
        if (isIntersecting) {
          // Element is visible, render it
          setShouldRender(true);
          
          // Clear any pending unrender timeout
          if (unrenderTimeoutRef.current !== null) {
            window.clearTimeout(unrenderTimeoutRef.current);
            unrenderTimeoutRef.current = null;
          }
        } else if (shouldRender) {
          // Element is not visible, but we're currently rendering
          // Set a timeout to stop rendering after delay (to prevent flicker for quick scrolling)
          if (unrenderTimeoutRef.current === null) {
            unrenderTimeoutRef.current = window.setTimeout(() => {
              setShouldRender(false);
              unrenderTimeoutRef.current = null;
            }, unrenderDelay);
          }
        }
      },
      { rootMargin: effectiveRootMargin, threshold }
    );
    
    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }
    
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      if (unrenderTimeoutRef.current !== null) {
        window.clearTimeout(unrenderTimeoutRef.current);
        unrenderTimeoutRef.current = null;
      }
    };
  }, [alwaysRender, effectiveRootMargin, shouldRender, threshold, unrenderDelay]);
  
  const setRef = (element: HTMLElement | null) => {
    elementRef.current = element;
  };
  
  return { setRef, isVisible, shouldRender, elementRef };
}
