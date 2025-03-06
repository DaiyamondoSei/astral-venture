
import React, { memo } from 'react';
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
  ariaLabel?: string;
  role?: string;
}

const GlowEffect = memo<GlowEffectProps>(({
  className,
  children,
  color = 'rgba(139, 92, 246, 0.5)',
  intensity = 'medium',
  animation = 'none',
  interactive = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  style,
  ariaLabel,
  role
}) => {
  // Map intensity levels to box shadow blur values with improved values
  const intensityMap = {
    low: '8px',
    medium: '15px',
    high: '25px'
  };

  // Define animation variants with enhanced effects and performance optimizations
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
  
  // Determine proper ARIA attributes for accessibility
  const getAccessibilityProps = () => {
    const props: {
      role?: string;
      'aria-label'?: string;
      tabIndex?: number;
    } = {};
    
    if (interactive) {
      props.role = role || 'button';
      props['aria-label'] = ariaLabel;
      props.tabIndex = 0;
    }
    
    return props;
  };

  return (
    <motion.div
      className={cn(
        "relative",
        interactive && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-quantum-400",
        className
      )}
      style={{
        boxShadow: `0 0 ${intensityMap[intensity]} ${color}`,
        willChange: animation !== 'none' ? 'transform, box-shadow' : 'auto', // Add will-change hint for browser optimization
        ...style
      }}
      onClick={interactive ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...getAnimationVariants()}
      {...hoverEffect}
      {...getAccessibilityProps()}
      // Add keyboard accessibility for interactive elements
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      {children}
    </motion.div>
  );
});

GlowEffect.displayName = 'GlowEffect';

export default GlowEffect;
