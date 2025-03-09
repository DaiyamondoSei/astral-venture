
import React, { useEffect, useState } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SwipeablePanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  height: {
    peek: string;
    half: string;
    full: string;
  };
  initialState: 'peek' | 'half' | 'full';
  className?: string;
  position?: 'top' | 'bottom';
}

const SwipeablePanel: React.FC<SwipeablePanelProps> = ({
  children,
  isOpen,
  onOpenChange,
  height,
  initialState = 'half',
  className,
  position = 'bottom'
}) => {
  const [panelState, setPanelState] = useState<'peek' | 'half' | 'full'>(initialState);
  const controls = useAnimation();
  
  // Convert height strings to numeric values for calculations
  const getNumericHeight = (heightStr: string): number => {
    if (heightStr.endsWith('%')) {
      return parseFloat(heightStr) / 100;
    } else if (heightStr.endsWith('px')) {
      return parseFloat(heightStr) / window.innerHeight;
    }
    return 0.5; // Default to 50% if invalid format
  };
  
  const peekHeight = getNumericHeight(height.peek);
  const halfHeight = getNumericHeight(height.half);
  const fullHeight = getNumericHeight(height.full);
  
  // Set the height based on current state
  const getStateHeight = (): number => {
    switch (panelState) {
      case 'peek': return peekHeight;
      case 'half': return halfHeight;
      case 'full': return fullHeight;
      default: return halfHeight;
    }
  };
  
  // Update panel state when isOpen changes
  useEffect(() => {
    if (isOpen) {
      controls.start({
        y: position === 'bottom' 
          ? `${(1 - getStateHeight()) * 100}%` 
          : `${getStateHeight() * 100 - 100}%`,
        transition: { type: 'spring', damping: 30, stiffness: 300 }
      });
    } else {
      controls.start({
        y: position === 'bottom' ? '100%' : '-100%',
        transition: { type: 'spring', damping: 30, stiffness: 300 }
      });
    }
  }, [isOpen, panelState, controls, position]);
  
  // Handle drag end events
  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = position === 'bottom' ? -info.velocity.y : info.velocity.y;
    const offset = position === 'bottom' ? -info.offset.y : info.offset.y;
    
    // Fast swipe in either direction
    if (Math.abs(velocity) > 500) {
      if (velocity > 0) {
        // Swipe up (or down for top panel)
        if (panelState === 'peek') {
          setPanelState('half');
        } else if (panelState === 'half') {
          setPanelState('full');
        }
      } else {
        // Swipe down (or up for top panel)
        if (panelState === 'full') {
          setPanelState('half');
        } else if (panelState === 'half') {
          setPanelState('peek');
        } else if (panelState === 'peek') {
          onOpenChange(false);
        }
      }
      return;
    }
    
    // Distance calculation for slower drags
    const height = window.innerHeight;
    const totalTravel = position === 'bottom' 
      ? height * (1 - peekHeight) 
      : height * fullHeight;
    
    // Calculate next state based on position
    const positionRatio = offset / totalTravel;
    
    if (positionRatio > 0.6) {
      if (panelState !== 'full') {
        setPanelState('full');
      }
    } else if (positionRatio > 0.3) {
      if (panelState !== 'half') {
        setPanelState('half');
      }
    } else if (positionRatio > 0.1) {
      if (panelState !== 'peek') {
        setPanelState('peek');
      }
    } else {
      onOpenChange(false);
    }
  };
  
  return (
    <motion.div
      className={cn(
        "fixed inset-x-0 z-50 bg-background/80 backdrop-blur-sm shadow-lg",
        position === 'bottom' ? "bottom-0 rounded-t-xl" : "top-0 rounded-b-xl",
        className
      )}
      initial={{ y: position === 'bottom' ? '100%' : '-100%' }}
      animate={controls}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      dragMomentum={false}
      style={{ touchAction: 'none' }}
    >
      {/* Handle for dragging */}
      <div className="relative w-full">
        <div 
          className={cn(
            "absolute left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-muted-foreground/30",
            position === 'bottom' ? "top-2" : "bottom-2"
          )}
        />
      </div>
      
      {/* Panel content with scrollable area */}
      <div className="h-full max-h-[calc(100vh-2rem)] overflow-auto p-6 pt-8">
        {children}
      </div>
    </motion.div>
  );
};

export default SwipeablePanel;
