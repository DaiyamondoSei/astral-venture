
import { useRef, useEffect } from 'react';

/**
 * Hook to safely check if a component is mounted
 * Returns a boolean value indicating if the component is mounted
 */
export const useIsMounted = (): { current: boolean } => {
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
