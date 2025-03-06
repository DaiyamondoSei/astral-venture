
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlowEffectProps {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  animation?: 'none' | 'pulse' | 'breathe';
  interactive?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  style?: React.CSSProperties;
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
  onMouseLeave,
  style
}) => {
  // Map intensity levels to box shadow blur values with improved values
  const intensityMap = {
    low: '8px',
    medium: '15px',
    high: '25px'
  };

  // Define animation variants with enhanced effects
  const getAnimationVariants = () => {
    if (animation === 'pulse') {
      return {
        animate: {
          boxShadow: [
            `0 0 ${intensityMap[intensity]} ${color}`,
            `0 0 ${parseInt(intensityMap[intensity]) + 10}px ${color}`,
            `0 0 ${intensityMap[intensity]} ${color}`
          ],
          transition: {
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut"
          }
        }
      };
    } else if (animation === 'breathe') {
      return {
        animate: {
          scale: [1, 1.05, 1],
          boxShadow: [
            `0 0 ${intensityMap[intensity]} ${color}`,
            `0 0 ${parseInt(intensityMap[intensity]) + 15}px ${color}`,
            `0 0 ${intensityMap[intensity]} ${color}`
          ],
          transition: {
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut"
          }
        }
      };
    }
    return {};
  };

  // Enhance hover effect for interactive elements
  const hoverEffect = interactive ? {
    whileHover: { 
      scale: 1.05,
      boxShadow: `0 0 ${parseInt(intensityMap[intensity]) + 5}px ${color}`,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    },
    whileTap: { 
      scale: 0.98,
      boxShadow: `0 0 ${parseInt(intensityMap[intensity]) - 2}px ${color}`,
      transition: {
        duration: 0.1
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
        boxShadow: `0 0 ${intensityMap[intensity]} ${color}`,
        ...style
      }}
      onClick={interactive ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...getAnimationVariants()}
      {...hoverEffect}
    >
      {children}
    </motion.div>
  );
};

export default GlowEffect;
