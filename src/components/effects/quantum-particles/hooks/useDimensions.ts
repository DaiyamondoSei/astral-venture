
import { useState, useEffect, RefObject } from 'react';

/**
 * Hook to track container dimensions and handle resize events
 * with improved error prevention and memory leak protection
 */
export function useDimensions(
  containerRef: RefObject<HTMLDivElement>,
  responsive: boolean,
  isMounted: React.MutableRefObject<boolean>
): {
  dimensions: { width: number; height: number } | null;
  updateDimensions: () => void;
} {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Function to safely measure and update dimensions
  const updateDimensions = () => {
    // Safety checks to prevent errors and memory leaks
    if (!containerRef.current || !isMounted.current) return;
    
    try {
      const newDimensions = {
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      };
      
      // Only update state if component is still mounted and dimensions changed
      if (isMounted.current && 
          (!dimensions || 
           newDimensions.width !== dimensions.width || 
           newDimensions.height !== dimensions.height)) {
        setDimensions(newDimensions);
      }
    } catch (error) {
      console.error('Error measuring container dimensions:', error);
    }
  };
  
  // Handle responsive resizing with debounce
  useEffect(() => {
    if (!responsive) return;
    
    let animationFrameId: number | null = null;
    let resizeTimeoutId: ReturnType<typeof setTimeout> | null = null;
    
    // Initial update
    updateDimensions();
    
    // Create a debounced resize handler for better performance
    const handleResize = () => {
      if (!isMounted.current) return;
      
      // Cancel any pending animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Use requestAnimationFrame for smoother updates
      if (window.requestAnimationFrame) {
        animationFrameId = window.requestAnimationFrame(() => {
          // Safety check again since the frame might execute after unmount
          if (isMounted.current) {
            updateDimensions();
          }
        });
      } else {
        // Fallback for browsers without requestAnimationFrame
        if (resizeTimeoutId !== null) {
          clearTimeout(resizeTimeoutId);
        }
        resizeTimeoutId = setTimeout(() => {
          if (isMounted.current) {
            updateDimensions();
          }
        }, 100);
      }
    };
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Comprehensive cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      
      if (resizeTimeoutId !== null) {
        clearTimeout(resizeTimeoutId);
      }
    };
  }, [responsive, containerRef, isMounted, dimensions]);
  
  return { dimensions, updateDimensions };
}
