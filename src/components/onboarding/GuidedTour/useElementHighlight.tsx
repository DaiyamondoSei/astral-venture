
import { useEffect } from 'react';
import { TourStep } from './types';

export const useElementHighlight = (currentStep: TourStep | undefined) => {
  useEffect(() => {
    if (!currentStep) return;
    
    const targetElement = document.querySelector(currentStep.targetSelector);
    if (!targetElement) return;
    
    // Add highlight class
    targetElement.classList.add('tour-highlight');
    
    // Store original style
    const originalOutline = (targetElement as HTMLElement).style.outline;
    const originalPosition = (targetElement as HTMLElement).style.position;
    const originalZIndex = (targetElement as HTMLElement).style.zIndex;
    
    // Apply highlight styles
    (targetElement as HTMLElement).style.outline = '2px solid rgba(136, 85, 255, 0.7)';
    (targetElement as HTMLElement).style.position = 'relative';
    (targetElement as HTMLElement).style.zIndex = '1000';
    
    return () => {
      // Restore original styles
      targetElement.classList.remove('tour-highlight');
      (targetElement as HTMLElement).style.outline = originalOutline;
      (targetElement as HTMLElement).style.position = originalPosition;
      (targetElement as HTMLElement).style.zIndex = originalZIndex;
    };
  }, [currentStep]);
};
