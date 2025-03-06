
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, MessageCircleQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeatureTooltipProps {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  order?: number;
  isActive: boolean;
  onDismiss: (id: string) => void;
}

const FeatureTooltip: React.FC<FeatureTooltipProps> = ({
  id,
  targetSelector,
  title,
  description,
  position = 'bottom',
  order = 1,
  isActive,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasTargetElement, setHasTargetElement] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show tooltip with delay to ensure elements are rendered
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        const targetElement = document.querySelector(targetSelector);
        
        if (targetElement) {
          setHasTargetElement(true);
          calculatePosition(targetElement as HTMLElement);
          
          // Add highlight effect to target element
          targetElement.classList.add('ring', 'ring-quantum-500', 'ring-opacity-70', 'ring-offset-2', 'z-10', 'transition-all');
          
          // Show tooltip after position is calculated
          setTimeout(() => setShowTooltip(true), 100);
        } else {
          console.warn(`Target element not found for tooltip: ${targetSelector}`);
          setHasTargetElement(false);
        }
      }, 300 + (order * 200)); // Stagger tooltips by order

      return () => {
        clearTimeout(timer);
        
        // Clean up highlights
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          targetElement.classList.remove('ring', 'ring-quantum-500', 'ring-opacity-70', 'ring-offset-2', 'z-10');
        }
      };
    } else {
      setShowTooltip(false);
    }
  }, [isActive, targetSelector, order, windowSize]);

  const calculatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    let x = 0, y = 0;
    
    // Base positioning
    switch (position) {
      case 'top':
        x = rect.left + rect.width / 2;
        y = rect.top - 10;
        break;
      case 'right':
        x = rect.right + 10;
        y = rect.top + rect.height / 2;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2;
        y = rect.bottom + 10;
        break;
      case 'left':
        x = rect.left - 10;
        y = rect.top + rect.height / 2;
        break;
    }

    setCoordinates({ x, y });
  };

  const handleDismiss = () => {
    // Start exit animation
    setShowTooltip(false);
    
    // Remove highlight from target
    const targetElement = document.querySelector(targetSelector);
    if (targetElement) {
      targetElement.classList.remove('ring', 'ring-quantum-500', 'ring-opacity-70', 'ring-offset-2', 'z-10');
    }
    
    // Notify parent after animation
    setTimeout(() => onDismiss(id), 300);
  };

  // Don't render anything if no target element found
  if (!hasTargetElement) return null;

  // Get positioning classes based on position
  const getPositioningClasses = () => {
    const positionClasses = {
      top: '-translate-x-1/2 -translate-y-full -mt-2',
      right: 'translate-y-[-50%] ml-2',
      bottom: '-translate-x-1/2 mt-2',
      left: 'translate-y-[-50%] -translate-x-full -ml-2'
    };
    
    const arrowClasses = {
      top: 'bottom-[-6px] left-1/2 -translate-x-1/2 rotate-45',
      right: 'left-[-6px] top-1/2 -translate-y-1/2 rotate-45',
      bottom: 'top-[-6px] left-1/2 -translate-x-1/2 rotate-45',
      left: 'right-[-6px] top-1/2 -translate-y-1/2 rotate-45'
    };
    
    return {
      container: positionClasses[position],
      arrow: arrowClasses[position]
    };
  };

  const positionClasses = getPositioningClasses();

  return (
    <div 
      className="fixed z-[1000] pointer-events-none"
      style={{ 
        left: coordinates.x, 
        top: coordinates.y
      }}
      ref={tooltipRef}
      role="tooltip"
      aria-labelledby={`tooltip-title-${id}`}
      aria-describedby={`tooltip-desc-${id}`}
    >
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "pointer-events-auto w-64 bg-gradient-to-br from-quantum-900/95 to-astral-900/95 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl",
              positionClasses.container
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageCircleQuestion size={18} className="text-quantum-400" />
                <h3 id={`tooltip-title-${id}`} className="font-medium text-quantum-100">{title}</h3>
              </div>
              
              <button 
                onClick={handleDismiss} 
                className="text-white/70 hover:text-white -mt-1 -mr-1 p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Dismiss tooltip"
              >
                <X size={14} />
              </button>
            </div>
            
            <p id={`tooltip-desc-${id}`} className="text-sm text-white/80 mb-3">{description}</p>
            
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={handleDismiss}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 h-7 rounded-full"
              >
                <CheckCircle2 size={12} className="mr-1" />
                Got it
              </Button>
            </div>
            
            {/* Arrow pointing to target */}
            <div className={cn(
              "absolute w-3 h-3 bg-quantum-900", 
              positionClasses.arrow
            )}></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeatureTooltip;
