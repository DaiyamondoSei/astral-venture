
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
  focusable?: boolean;
  disabled?: boolean;
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
  role,
  focusable = true,
  disabled = false
}) => {
  // Map intensity levels to box shadow blur values with optimized values for better contrast
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
  const hoverEffect = interactive && !disabled ? {
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
      'aria-disabled'?: boolean;
    } = {};
    
    if (interactive) {
      props.role = role || 'button';
      props['aria-label'] = ariaLabel;
      
      if (disabled) {
        props['aria-disabled'] = true;
      } else if (focusable) {
        props.tabIndex = 0;
      }
    }
    
    return props;
  };

  return (
    <motion.div
      className={cn(
        "relative",
        interactive && !disabled && "cursor-pointer",
        interactive && focusable && "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-quantum-400",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
      style={{
        boxShadow: `0 0 ${intensityMap[intensity]} ${color}`,
        willChange: animation !== 'none' ? 'transform, box-shadow' : 'auto', // Optimization for browser rendering
        ...style
      }}
      onClick={interactive && !disabled ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...getAnimationVariants()}
      {...hoverEffect}
      {...getAccessibilityProps()}
      // Add keyboard accessibility for interactive elements
      onKeyDown={interactive && !disabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      // Improved motion accessibility
      data-reduced-motion={window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'true' : 'false'}
    >
      {children}
    </motion.div>
  );
});

GlowEffect.displayName = 'GlowEffect';

export default GlowEffect;
