
import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive media queries
 * @param query CSS media query string (e.g. '(max-width: 768px)')
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Check if window is available (for SSR)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));
  
  // Update the state on window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleChange = () => {
      setMatches(getMatches(query));
    };
    
    // Initial check
    handleChange();
    
    // Create a MediaQueryList object
    const mediaQueryList = window.matchMedia(query);
    
    // Use the modern event listener method if available
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      return () => {
        mediaQueryList.removeEventListener('change', handleChange);
      };
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(handleChange);
      return () => {
        mediaQueryList.removeListener(handleChange);
      };
    }
  }, [query]);

  return matches;
}
