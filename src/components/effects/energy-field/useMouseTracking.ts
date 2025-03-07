
import { useState, useEffect } from 'react';

interface UseMouseTrackingProps {
  containerRef: React.RefObject<HTMLDivElement>;
  isMounted: React.MutableRefObject<boolean>;
  reactToClick?: boolean;
}

export const useMouseTracking = ({ 
  containerRef, 
  isMounted,
  reactToClick = true
}: UseMouseTrackingProps) => {
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [clickWave, setClickWave] = useState<{ x: number, y: number, active: boolean } | null>(null);
  
  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current && isMounted.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [containerRef, isMounted]);
  
  // Handle click events to create energy waves
  useEffect(() => {
    if (!reactToClick) return;
    
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && isMounted.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setClickWave({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          active: true
        });
        
        // Reset click wave after animation
        setTimeout(() => {
          if (isMounted.current) {
            setClickWave(null);
          }
        }, 1000);
      }
    };
    
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [reactToClick, containerRef, isMounted]);
  
  return { mousePosition, clickWave };
};
