
import { useState, useEffect, useRef } from 'react';
import { TourStep } from './types';

interface TooltipPosition {
  top: number;
  left: number;
}

export const useTooltipPosition = (currentStep: TourStep | undefined) => {
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'right' | 'bottom' | 'left'>('bottom');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  
  const calculatePosition = () => {
    if (!currentStep) return;
    
    const targetElement = document.querySelector(currentStep.targetSelector);
    if (!targetElement) return;
    
    const tooltipElement = tooltipRef.current;
    if (!tooltipElement) return;
    
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    
    // Determine the best position
    const position = currentStep.position || 'bottom';
    setTooltipPosition(position);
    
    let top = 0;
    let left = 0;
    
    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 10;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + 10;
        break;
      case 'bottom':
        top = targetRect.bottom + 10;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width - 10;
        break;
    }
    
    // Ensure the tooltip stays within viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    top = Math.max(10, Math.min(viewport.height - tooltipRect.height - 10, top));
    left = Math.max(10, Math.min(viewport.width - tooltipRect.width - 10, left));
    
    setPosition({ top, left });
  };
  
  useEffect(() => {
    calculatePosition();
    
    // Set up resize observer and window resize handler
    const handleResize = () => {
      calculatePosition();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver to monitor target element size changes
    if (currentStep) {
      const targetElement = document.querySelector(currentStep.targetSelector);
      if (targetElement && 'ResizeObserver' in window) {
        resizeObserverRef.current = new ResizeObserver(handleResize);
        resizeObserverRef.current.observe(targetElement);
      }
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [currentStep]);
  
  return { position, tooltipPosition, tooltipRef };
};
