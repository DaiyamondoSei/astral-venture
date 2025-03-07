
import { useRef, useEffect } from 'react';

/**
 * Hook to safely check if a component is mounted
 * Returns a ref object with a current property set to true if mounted, false otherwise
 */
export const useIsMounted = () => {
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Set initial value
    isMounted.current = true;
    
    // Cleanup function to set ref to false when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return isMounted;
};
