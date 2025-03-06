
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlowEffectProps {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  animation?: 'none' | 'pulse';
  interactive?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const GlowEffect: React.FC<GlowEffectProps> = ({
  className,
  children,
  color = 'rgba(139, 92, 246, 0.5)',
  intensity = 'medium',
  animation = 'none',
  interactive = false,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  // Map intensity levels to box shadow blur values
  const intensityMap = {
    low: '10px',
    medium: '15px',
    high: '20px'
  };

  // Define animation variants
  const pulseAnimation = animation === 'pulse' ? {
    animate: {
      boxShadow: [
        `0 0 ${intensityMap[intensity]} ${color}`,
        `0 0 ${parseInt(intensityMap[intensity]) + 5}px ${color}`,
        `0 0 ${intensityMap[intensity]} ${color}`
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  } : {};

  return (
    <motion.div
      className={cn(
        "relative",
        interactive && "cursor-pointer",
        className
      )}
      style={{
        boxShadow: `0 0 ${intensityMap[intensity]} ${color}`
      }}
      whileHover={interactive ? { scale: 1.05 } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
      onClick={interactive ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...pulseAnimation}
    >
      {children}
    </motion.div>
  );
};

export default GlowEffect;
