
import React from 'react';
import { motion } from 'framer-motion';
import usePanelState from '@/hooks/usePanelState';
import type { ISwipeablePanelProps } from '@/components/ui/types';

/**
 * SwipeablePanel component that provides swipeable panels from different positions
 */
const SwipeablePanel: React.FC<ISwipeablePanelProps> = ({
  children,
  position,
  initialState = false,
  title,
  height
}) => {
  const { isPanelOpen, activePanelPosition, setIsPanelOpen } = usePanelState();

  // Only render if position matches active position
  if (activePanelPosition !== position) return null;

  // Panel variants for animations
  const panelVariants = {
    open: {
      y: position === 'bottom' ? '0%' : undefined,
      x: position === 'right' ? '0%' : undefined,
      opacity: 1
    },
    closed: {
      y: position === 'bottom' ? '100%' : undefined,
      x: position === 'right' ? '100%' : undefined,
      opacity: 0
    }
  };

  // Apply different styling based on position
  const panelClasses = `fixed z-50 bg-background/80 backdrop-blur-sm ${
    position === 'bottom' ? 'inset-x-0 bottom-0' : 'top-0 right-0 h-full'
  }`;

  const panelStyle = {
    height: position === 'bottom' && height ? height : undefined,
    width: position === 'right' ? '85%' : undefined,
    maxWidth: position === 'right' ? '450px' : undefined
  };

  return (
    <motion.div
      className={panelClasses}
      style={panelStyle}
      initial="closed"
      animate={isPanelOpen ? 'open' : 'closed'}
      variants={panelVariants}
      transition={{ type: 'spring', damping: 20 }}
    >
      {title && (
        <div className="p-4 border-b border-border/20">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
      )}
      <div className="max-h-[85vh] overflow-y-auto">
        {children}
      </div>
    </motion.div>
  );
};

export default SwipeablePanel;
