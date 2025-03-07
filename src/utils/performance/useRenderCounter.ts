
import { useRef, useEffect } from 'react';

/**
 * Hook that counts and logs the number of renders for a component
 * Only active in development mode
 * 
 * @param componentName - Name of the component to track
 * @param enabled - Whether tracking is enabled
 */
export function useRenderCounter(componentName: string, enabled = true): void {
  // Only count renders in development mode
  if (process.env.NODE_ENV !== 'development' || !enabled) return;
  
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    
    // Log when render count exceeds a threshold to detect potential issues
    if (renderCount.current === 1) {
      console.log(`[Render Counter] ${componentName} - Initial render`);
    } else if (renderCount.current % 10 === 0) {
      console.warn(`[Render Counter] ${componentName} - ${renderCount.current} renders occurred. Check for performance issues.`);
    } else if (renderCount.current > 3) {
      // Log every render after the 3rd one to help detect excess renders
      console.log(`[Render Counter] ${componentName} - Render #${renderCount.current}`);
    }
  });
}

export default useRenderCounter;
