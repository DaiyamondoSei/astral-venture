
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassmorphicVariant, GlassmorphicVariants } from '@/types/core/performance';
import { usePerformance } from '@/hooks/usePerformance';

export interface GlassmorphicContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: GlassmorphicVariant;
  blur?: string; // Support blur customization
  animate?: boolean;
  motionProps?: any;
  centerContent?: boolean;
  glowEffect?: boolean;
  shimmer?: boolean;
  transitionDuration?: number;
}

const GlassmorphicContainer: React.FC<GlassmorphicContainerProps> = ({
  children,
  className = '',
  variant = GlassmorphicVariants.DEFAULT,
  blur,
  animate = false,
  motionProps = {},
  centerContent = false,
  glowEffect = false,
  shimmer = false,
  transitionDuration = 0.5
}) => {
  const { enableBlur, enableShadows } = usePerformance();
  
  // Default blur values based on variant
  const getDefaultBlur = () => {
    if (!enableBlur) return 'none';
    
    switch (variant) {
      case GlassmorphicVariants.QUANTUM:
        return 'blur(10px)';
      case GlassmorphicVariants.ETHEREAL:
        return 'blur(15px)';
      case GlassmorphicVariants.COSMIC:
      case GlassmorphicVariants.PURPLE:
        return 'blur(12px)';
      case GlassmorphicVariants.ELEVATED:
        return 'blur(8px)';
      case GlassmorphicVariants.MEDIUM:
        return 'blur(6px)';
      case GlassmorphicVariants.SUBTLE:
        return 'blur(3px)';
      default:
        return 'blur(5px)';
    }
  };
  
  // Apply custom blur or use default based on variant
  const blurValue = blur || getDefaultBlur();
  
  // Set base styles based on variant
  const getVariantStyles = () => {
    const baseStyles = 'rounded-lg overflow-hidden transition-all ';
    
    switch (variant) {
      case GlassmorphicVariants.QUANTUM:
        return baseStyles + 'bg-black/25 border border-white/20 text-white shadow-lg';
      case GlassmorphicVariants.ETHEREAL:
        return baseStyles + 'bg-white/10 border border-white/25 text-white shadow-lg';
      case GlassmorphicVariants.COSMIC:
        return baseStyles + 'bg-purple-900/20 border border-purple-500/30 text-white shadow-purple/10';
      case GlassmorphicVariants.PURPLE:
        return baseStyles + 'bg-purple-900/30 border border-purple-400/40 text-white shadow-purple/20';
      case GlassmorphicVariants.ELEVATED:
        return baseStyles + 'bg-black/40 border border-white/10 text-white shadow-md';
      case GlassmorphicVariants.MEDIUM:
        return baseStyles + 'bg-black/30 border border-white/15 text-white';
      case GlassmorphicVariants.SUBTLE:
        return baseStyles + 'bg-black/20 border border-white/10 text-white';
      default:
        return baseStyles + 'bg-white/5 border border-white/10 text-white backdrop-blur';
    }
  };
  
  // Set glow effect styles
  const glowStyles = glowEffect && enableShadows 
    ? 'after:absolute after:inset-0 after:rounded-lg after:opacity-30 after:bg-gradient-to-b after:from-white/5 after:to-transparent after:-z-10' 
    : '';
  
  // Set shimmer animation styles
  const shimmerStyles = shimmer 
    ? 'before:absolute before:inset-0 before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-shimmer'
    : '';
  
  const containerStyles = cn(
    getVariantStyles(),
    glowStyles,
    shimmerStyles,
    centerContent && 'flex items-center justify-center',
    'relative',
    className
  );
  
  const containerProps = {
    className: containerStyles,
    style: {
      backdropFilter: blurValue,
      WebkitBackdropFilter: blurValue,
      transition: `all ${transitionDuration}s ease-in-out`
    },
    ...motionProps
  };
  
  return animate ? (
    <motion.div {...containerProps}>
      {children}
    </motion.div>
  ) : (
    <div {...containerProps}>
      {children}
    </div>
  );
};

export default GlassmorphicContainer;
