
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

type PanelPosition = 'top' | 'bottom';
type PanelSize = 'small' | 'medium' | 'large';

interface SwipeablePanelProps {
  children: React.ReactNode;
  position: PanelPosition;
  isOpen: boolean;
  onClose: () => void;
  size?: PanelSize;
  className?: string;
}

export const SwipeablePanel: React.FC<SwipeablePanelProps> = ({
  children,
  position,
  isOpen,
  onClose,
  size = 'medium',
  className
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  
  // Get the size in percentage based on the prop
  const getSizePercentage = (): number => {
    switch (size) {
      case 'small':
        return 25;
      case 'medium':
        return 40;
      case 'large':
        return 75;
      default:
        return 40;
    }
  };
  
  // Calculate panel height on mount and window resize
  useEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;
      const percentage = getSizePercentage();
      setPanelHeight(windowHeight * (percentage / 100));
    };
    
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [size]);
  
  // Calculate max height in pixels
  const maxHeight = `${panelHeight}px`;
  
  // Animation variants for the panel
  const panelVariants = {
    hidden: {
      y: position === 'top' ? `-${panelHeight}px` : `${panelHeight}px`,
      opacity: 0.6,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    }
  };
  
  // Handle swipe gesture
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // pixels to trigger a close
    const velocity = 10; // velocity to trigger a close
    
    if (position === 'top' && (info.offset.y < -threshold || info.velocity.y < -velocity)) {
      onClose();
    } else if (position === 'bottom' && (info.offset.y > threshold || info.velocity.y > velocity)) {
      onClose();
    }
  };
  
  // Background overlay variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  // Handle outside click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={handleOverlayClick}
          />
          
          {/* Panel */}
          <motion.div
            ref={panelRef}
            className={cn(
              "fixed left-0 right-0 z-40 bg-gradient-to-r from-quantum-900/90 to-astral-900/90 backdrop-blur-md",
              "border-quantum-700/50",
              position === 'top' ? 'top-0 border-b' : 'bottom-0 border-t',
              "rounded-b-xl shadow-xl overflow-hidden",
              className
            )}
            style={{ 
              maxHeight: maxHeight
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={panelVariants}
            drag={position === 'top' ? "y" : position === 'bottom' ? "y" : undefined}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Handle indicator */}
            <div className="w-full flex justify-center py-2">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>
            
            {/* Content with scrollable area */}
            <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 24px)` }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
