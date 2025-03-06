import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  description?: string; // Optional for backward compatibility
}

interface GuidedTourProps {
  tourId: string;
  title: string;
  description: string;
  steps: TourStep[];
  onComplete: () => void;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
  tourId,
  title,
  description,
  steps,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'right' | 'bottom' | 'left'>('bottom');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  
  const currentStep = steps[currentStepIndex];
  
  const calculatePosition = () => {
    if (!currentStep) return;
    
    const targetElement = document.querySelector(currentStep.targetSelector);
    if (!targetElement) return;
    
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipElement = tooltipRef.current;
    if (!tooltipElement) return;
    
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
  
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };
  
  // Highlight the current target element
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
  
  if (!currentStep) return null;
  
  return (
    <motion.div
      ref={tooltipRef}
      className="fixed z-[1001] bg-background border border-quantum-500/30 rounded-lg shadow-lg w-72"
      style={{ 
        top: position.top,
        left: position.left,
        transform: 'translate(0, 0)'
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Position indicator triangle */}
      <div
        className={`absolute w-3 h-3 bg-background border-t border-l border-quantum-500/30 transform rotate-45 ${
          tooltipPosition === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1.5' :
          tooltipPosition === 'right' ? 'left-0 top-1/2 -translate-y-1/2 -translate-x-1.5' :
          tooltipPosition === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1.5' :
          'right-0 top-1/2 -translate-y-1/2 translate-x-1.5'
        }`}
      />
      
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-foreground">{currentStep.title}</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onComplete}
          >
            <X size={14} />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mb-4">{currentStep.content}</p>
        
        {/* Tour progress indicator */}
        <div className="mb-2 text-xs text-muted-foreground">
          Step {currentStepIndex + 1} of {steps.length}
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentStepIndex
                    ? 'bg-quantum-500'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft size={16} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextStep}
            >
              {currentStepIndex < steps.length - 1 ? <ChevronRight size={16} /> : <X size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GuidedTour;
