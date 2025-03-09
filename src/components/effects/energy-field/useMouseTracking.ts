
import { useState, useEffect, RefObject, useCallback } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface ClickWave {
  x: number;
  y: number;
  active: boolean;
}

interface UseMouseTrackingProps {
  containerRef: RefObject<HTMLElement>;
  isMounted: { current: boolean } | boolean;
  reactToClick?: boolean;
}

export const useMouseTracking = ({
  containerRef,
  isMounted,
  reactToClick = true
}: UseMouseTrackingProps) => {
  const [mousePosition, setMousePosition] = useState<MousePosition | null>(null);
  const [clickWave, setClickWave] = useState<ClickWave | null>(null);
  
  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  }, [containerRef]);
  
  // Handle mouse click
  const handleMouseClick = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !reactToClick) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create click wave
    setClickWave({ x, y, active: true });
    
    // Reset click wave after animation completes
    setTimeout(() => {
      if (typeof isMounted === 'object' ? isMounted.current : isMounted) {
        setClickWave(null);
      }
    }, 1000); // Match the duration of the ClickWave animation
  }, [containerRef, reactToClick, isMounted]);
  
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    
    // Add event listeners
    element.addEventListener('mousemove', handleMouseMove);
    
    if (reactToClick) {
      element.addEventListener('click', handleMouseClick);
    }
    
    // Remove event listeners on cleanup
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      
      if (reactToClick) {
        element.removeEventListener('click', handleMouseClick);
      }
    };
  }, [containerRef, handleMouseMove, handleMouseClick, reactToClick]);
  
  return { mousePosition, clickWave };
};

export default useMouseTracking;
