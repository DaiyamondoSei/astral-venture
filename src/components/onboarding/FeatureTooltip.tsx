
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FeatureTooltipProps {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  order?: number;
  isActive?: boolean;
  onDismiss?: (id: string) => void;
}

const FeatureTooltip: React.FC<FeatureTooltipProps> = ({
  id,
  targetSelector,
  title,
  description,
  position = 'bottom',
  order = 1,
  isActive = true,
  onDismiss
}) => {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  useEffect(() => {
    // Check if this tooltip has been seen before
    const seenTooltips = JSON.parse(localStorage.getItem('seen-tooltips') || '{}');
    if (seenTooltips[id]) {
      setHasBeenSeen(true);
      return;
    }

    // Only position and show if active and not seen before
    if (isActive && !hasBeenSeen) {
      positionTooltip();
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500 + order * 300); // Stagger showing tooltips

      window.addEventListener('resize', positionTooltip);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', positionTooltip);
      };
    }
  }, [id, targetSelector, isActive, order, hasBeenSeen]);

  const positionTooltip = () => {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    
    // Calculate position based on specified direction
    let x = 0, y = 0;
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
    setIsVisible(false);
    
    // Mark this tooltip as seen
    const seenTooltips = JSON.parse(localStorage.getItem('seen-tooltips') || '{}');
    seenTooltips[id] = true;
    localStorage.setItem('seen-tooltips', JSON.stringify(seenTooltips));
    
    if (onDismiss) {
      onDismiss(id);
    }
  };

  // Don't render if not active or already seen
  if (!isActive || hasBeenSeen) return null;

  // Calculate positioning and arrow styles based on position
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          container: 'translate(-50%, -100%) mb-2',
          arrow: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45'
        };
      case 'right':
        return {
          container: 'translate(0, -50%) ml-2',
          arrow: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45'
        };
      case 'bottom':
        return {
          container: 'translate(-50%, 0) mt-2',
          arrow: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45'
        };
      case 'left':
        return {
          container: 'translate(-100%, -50%) mr-2',
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`pointer-events-auto w-64 bg-gradient-to-br from-quantum-900/95 to-astral-900/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg ${positionStyles.container}`}
          >
            <button 
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              <X size={14} />
            </button>
            
            <div className="mb-1 font-semibold">{title}</div>
            <p className="text-sm text-white/80">{description}</p>
            
            {/* Arrow pointing to the target */}
            <div className={`absolute w-3 h-3 bg-quantum-900 ${positionStyles.arrow}`}></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeatureTooltip;
