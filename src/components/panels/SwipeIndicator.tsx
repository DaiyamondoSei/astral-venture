
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SwipePosition = "top" | "bottom";

interface SwipeIndicatorProps {
  position: SwipePosition;
  className?: string;
}

/**
 * A visual indicator showing users that they can swipe to reveal panels
 */
const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ position, className }) => {
  const variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: [0.2, 0.6, 0.2], 
      transition: { 
        repeat: Infinity, 
        duration: 2,
        repeatType: "mirror"
      } 
    }
  };

  return (
    <div 
      className={cn(
        "fixed z-40 left-0 right-0 flex justify-center items-center pointer-events-none",
        position === "top" ? "top-1" : "bottom-1",
        className
      )}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className={cn(
          "w-12 h-1 rounded-full bg-white/40 backdrop-blur-sm",
        )}
      />
    </div>
  );
};

export default SwipeIndicator;
