
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
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

  useEffect(() => {
    // Check if tour has been completed
    const completedTours = JSON.parse(localStorage.getItem('completed-tours') || '{}');
    if (completedTours[tourId]) {
      setHasCompletedTour(true);
      return;
    }

    // Only continue if active and not completed
    if (isActive && !hasCompletedTour) {
      const timer = setTimeout(() => {
        positionTooltip();
        setIsVisible(true);
      }, 500);

      window.addEventListener('resize', positionTooltip);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', positionTooltip);
      };
    }
  }, [isActive, tourId, hasCompletedTour]);

  useEffect(() => {
    if (isVisible) {
      positionTooltip();
    }
  }, [currentStepIndex, isVisible]);

  const positionTooltip = () => {
    if (steps.length === 0 || currentStepIndex >= steps.length) return;
    
    const currentStep = steps[currentStepIndex];
    const targetElement = document.querySelector(currentStep.targetSelector);
    
    if (!targetElement) {
      console.warn(`Target element not found: ${currentStep.targetSelector}`);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    
    // Add a highlight effect to the target element
    targetElement.classList.add('ring-2', 'ring-quantum-500', 'ring-offset-2', 'transition-all');
    
    // Calculate position based on specified direction
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
    
    // Remove highlight from previous elements
    return () => {
      targetElement.classList.remove('ring-2', 'ring-quantum-500', 'ring-offset-2');
    };
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    
    // Mark this tour as completed
    const completedTours = JSON.parse(localStorage.getItem('completed-tours') || '{}');
    completedTours[tourId] = true;
    localStorage.setItem('completed-tours', JSON.stringify(completedTours));
    
    setHasCompletedTour(true);
    
    if (onComplete) {
      onComplete();
    }
  };

  // Don't render if not active or already completed
  if (!isActive || hasCompletedTour || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];
  if (!currentStep) return null;

  // Calculate positioning and arrow styles based on position
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

  return (
    <AnimatePresence>
      {isVisible && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ 
            left: coordinates.x, 
            top: coordinates.y 
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`pointer-events-auto w-72 bg-gradient-to-br from-quantum-900/95 to-astral-900/95 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl ${positionStyles.container}`}
          >
            <button 
              onClick={completeTour}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
              aria-label="Close tour"
            >
              <X size={16} />
            </button>
            
            <div className="mb-1 font-semibold text-lg">{currentStep.title}</div>
            <p className="text-sm text-white/80 mb-4">{currentStep.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/60">
                Step {currentStepIndex + 1} of {steps.length}
              </div>
              
              <Button 
                size="sm" 
                onClick={handleNext}
                className="bg-gradient-to-r from-quantum-500 to-astral-500 hover:from-quantum-600 hover:to-astral-600 text-xs px-3 py-1 h-8"
              >
                {currentStepIndex < steps.length - 1 ? (
                  <>Next <ArrowRight size={12} className="ml-1" /></>
                ) : (
                  'Finish'
                )}
              </Button>
            </div>
            
            {/* Arrow pointing to the target */}
            <div className={`absolute w-3 h-3 bg-quantum-900 ${positionStyles.arrow}`}></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GuidedTour;
