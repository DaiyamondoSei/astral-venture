
import { useRef, useEffect } from 'react';

export const useIsMounted = () => {
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Set isMounted to true when the component mounts
    isMounted.current = true;
    
    // Set isMounted to false when the component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return isMounted;
};
