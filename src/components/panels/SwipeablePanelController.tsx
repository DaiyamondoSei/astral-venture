
import React from 'react';
import { motion } from 'framer-motion';
import usePanelState from '@/hooks/usePanelState';
import type { ISwipeablePanelProps } from '@/components/ui/types';

const SwipeablePanel: React.FC<ISwipeablePanelProps> = ({
  children,
  position,
  initialState = false
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

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-50 bg-background/80 backdrop-blur-sm"
      initial="closed"
      animate={isPanelOpen ? 'open' : 'closed'}
      variants={panelVariants}
      transition={{ type: 'spring', damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

export default SwipeablePanel;
