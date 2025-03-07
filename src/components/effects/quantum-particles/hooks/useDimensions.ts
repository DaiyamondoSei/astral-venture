
import { useState, useEffect, RefObject } from 'react';

/**
 * Hook to track container dimensions and handle resize events
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
  
  // Function to measure and update dimensions
  const updateDimensions = () => {
    if (!containerRef.current || !isMounted.current) return;
    
    const newDimensions = {
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight
    };
    
    setDimensions(newDimensions);
  };
  
  // Handle responsive resizing
  useEffect(() => {
    if (!responsive) return;
    
    // Initial update
    updateDimensions();
    
    const handleResize = () => {
      if (!isMounted.current) return;
      // Use debounce to prevent excessive updates
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(updateDimensions);
      } else {
        setTimeout(updateDimensions, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [responsive, containerRef]);
  
  return { dimensions, updateDimensions };
}
