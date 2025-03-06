import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  accentColor?: string;
  imageUrl?: string;
}

interface GuidedTourProps {
  tourId: string;
  steps: TourStep[];
  isActive?: boolean;
  onComplete?: () => void;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
  tourId,
  steps,
  isActive = true,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      switch (e.key) {
        case 'Escape':
          completeTour();
          break;
        case 'ArrowRight':
        case 'Enter':
          handleNext();
          break;
        case 'ArrowLeft':
          if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentStepIndex]);

  useEffect(() => {
    if (isVisible && focusRef.current) {
      setTimeout(() => {
        focusRef.current?.focus();
      }, 100);
    }
  }, [isVisible, currentStepIndex]);

  useEffect(() => {
    const completedTours = JSON.parse(localStorage.getItem('completed-tours') || '{}');
    if (completedTours[tourId]) {
      setHasCompletedTour(true);
      return;
    }

    if (isActive && !hasCompletedTour) {
      const timer = setTimeout(() => {
        positionTooltip();
        setIsVisible(true);
      }, 500);

      window.addEventListener('resize', positionTooltip);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', positionTooltip);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isActive, tourId, hasCompletedTour]);

  useEffect(() => {
    if (isVisible) {
      positionTooltip();
    }
  }, [currentStepIndex, isVisible]);

  const handleScroll = () => {
    setIsScrolling(true);
    clearTimeout(window.onscrollend);
    
    window.onscrollend = setTimeout(() => {
      setIsScrolling(false);
      positionTooltip();
    }, 100) as unknown as number;
  };

  const positionTooltip = () => {
    if (steps.length === 0 || currentStepIndex >= steps.length) return;
    
    const currentStep = steps[currentStepIndex];
    const targetElement = document.querySelector(currentStep.targetSelector);
    
    if (!targetElement) {
      console.warn(`Target element not found: ${currentStep.targetSelector}`);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    
    if (
      rect.bottom < 0 || 
      rect.top > window.innerHeight || 
      rect.right < 0 || 
      rect.left > window.innerWidth
    ) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      setTimeout(positionTooltip, 500);
      return;
    }
    
    targetElement.classList.add('ring-2', 'ring-offset-2', 'transition-all', 'duration-300');
    
    if (currentStep.accentColor) {
      targetElement.classList.add('ring-[color:var(--accent-color)]');
      targetElement.style.setProperty('--accent-color', currentStep.accentColor);
    } else {
      targetElement.classList.add('ring-quantum-500');
    }
    
    let x = 0, y = 0;
    const position = currentStep.position || 'bottom';
    
    switch (position) {
      case 'top':
        x = rect.left + rect.width / 2;
        y = rect.top - 20;
        break;
      case 'right':
        x = rect.right + 20;
        y = rect.top + rect.height / 2;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2;
        y = rect.bottom + 20;
        break;
      case 'left':
        x = rect.left - 20;
        y = rect.top + rect.height / 2;
        break;
    }

    setCoordinates({ x, y });
    
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting && isVisible) {
        positionTooltip();
      }
    }, { threshold: 0.5 });
    
    observer.observe(targetElement);
    
    return () => {
      targetElement.classList.remove(
        'ring-2', 
        'ring-quantum-500', 
        'ring-offset-2',
        'ring-[color:var(--accent-color)]'
      );
      observer.disconnect();
    };
  };

  const handleNext = () => {
    const currentStep = steps[currentStepIndex];
    const currentTarget = document.querySelector(currentStep.targetSelector);
    if (currentTarget) {
      currentTarget.classList.remove(
        'ring-2', 
        'ring-quantum-500', 
        'ring-offset-2',
        'ring-[color:var(--accent-color)]'
      );
    }
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    
    if (steps.length > 0) {
      const finalStep = steps[currentStepIndex];
      const finalTarget = document.querySelector(finalStep.targetSelector);
      if (finalTarget) {
        finalTarget.classList.remove(
          'ring-2', 
          'ring-quantum-500', 
          'ring-offset-2',
          'ring-[color:var(--accent-color)]'
        );
      }
    }
    
    const completedTours = JSON.parse(localStorage.getItem('completed-tours') || '{}');
    completedTours[tourId] = true;
    localStorage.setItem('completed-tours', JSON.stringify(completedTours));
    
    setHasCompletedTour(true);
    
    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 300);
    }
  };

  if (!isActive || hasCompletedTour || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];
  if (!currentStep) return null;

  const getPositionStyles = () => {
    const position = currentStep.position || 'bottom';
    switch (position) {
      case 'top':
        return {
          container: 'translate(-50%, -100%) mb-3',
          arrow: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45'
        };
      case 'right':
        return {
          container: 'translate(0, -50%) ml-3',
          arrow: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45'
        };
      case 'bottom':
        return {
          container: 'translate(-50%, 0) mt-3',
          arrow: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45'
        };
      case 'left':
        return {
          container: 'translate(-100%, -50%) mr-3',
          arrow: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rotate-45'
        };
    }
  };

  const positionStyles = getPositionStyles();
  
  if (isScrolling) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <div 
            className="sr-only" 
            role="status" 
            aria-live="polite"
          >
            Step {currentStepIndex + 1} of {steps.length}: {currentStep.title}
          </div>
        
          <div 
            className="fixed z-50 pointer-events-none"
            style={{ 
              left: coordinates.x, 
              top: coordinates.y 
            }}
            ref={tooltipRef}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "pointer-events-auto w-80 bg-gradient-to-br from-quantum-900/95 to-astral-900/95 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl",
                positionStyles.container
              )}
              style={currentStep.accentColor ? {
                backgroundImage: `linear-gradient(to bottom right, rgba(30, 30, 45, 0.95), rgba(20, 20, 35, 0.95))`,
                borderLeft: `3px solid ${currentStep.accentColor}`
              } : undefined}
            >
              <button 
                onClick={completeTour}
                className="absolute top-2 right-2 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
                aria-label="Close tour"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Info 
                    size={18} 
                    className="text-quantum-400" 
                    style={currentStep.accentColor ? { color: currentStep.accentColor } : undefined} 
                  />
                </div>
                <div>
                  <div className="mb-1 font-semibold text-lg">{currentStep.title}</div>
                  <p className="text-sm text-white/80 mb-4">{currentStep.description}</p>
                </div>
              </div>
              
              {currentStep.imageUrl && (
                <div className="mt-2 mb-4 rounded-md overflow-hidden">
                  <img 
                    src={currentStep.imageUrl} 
                    alt={`Visual aid for ${currentStep.title}`} 
                    className="w-full h-auto"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-200",
                        index === currentStepIndex 
                          ? "bg-white" 
                          : "bg-white/30"
                      )}
                      style={
                        index === currentStepIndex && currentStep.accentColor 
                          ? { backgroundColor: currentStep.accentColor } 
                          : undefined
                      }
                      aria-hidden="true"
                    ></div>
                  ))}
                </div>
                
                <Button 
                  size="sm" 
                  onClick={handleNext}
                  className={cn(
                    "bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 h-8"
                  )}
                  style={currentStep.accentColor ? {
                    backgroundColor: `${currentStep.accentColor}40`,
                    color: 'white'
                  } : undefined}
                  ref={focusRef}
                >
                  {currentStepIndex < steps.length - 1 ? (
                    <>Next <ArrowRight size={12} className="ml-1" /></>
                  ) : (
                    'Finish'
                  )}
                </Button>
              </div>
              
              <div className={cn(
                "absolute w-3 h-3", 
                positionStyles.arrow
              )} 
              style={{
                backgroundColor: currentStep.accentColor || '#1f1f2f',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.05)'
              }}></div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GuidedTour;
