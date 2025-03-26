
import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassmorphicVariant, GlassmorphicVariants } from '@/types/core/performance';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassmorphicVariant;
  intensity?: number;
  centerContent?: boolean;
  className?: string;
  glowEffect?: boolean;
  shimmer?: boolean;
  motionProps?: MotionProps;
  animate?: boolean;
}

const GlassmorphicContainer = forwardRef<HTMLDivElement, GlassCardProps>(({
  variant = GlassmorphicVariants.DEFAULT,
  intensity = 0.5,
  centerContent = false,
  className = '',
  glowEffect = false,
  shimmer = false,
  motionProps = {},
  animate = false,
  children,
  ...props
}, ref) => {
  // Get base styling based on variant
  const getBaseClasses = () => {
    switch (variant) {
      case GlassmorphicVariants.QUANTUM:
        return 'from-quantum-900/30 to-quantum-800/20 border-quantum-700/30 shadow-quantum-500/10';
      case GlassmorphicVariants.ETHEREAL:
        return 'from-astral-900/30 to-astral-800/20 border-astral-700/30 shadow-astral-500/10';
      case GlassmorphicVariants.ELEVATED:
        return 'from-white/10 to-white/5 border-white/20 shadow-white/10';
      case GlassmorphicVariants.COSMIC:
        return 'from-violet-900/30 to-violet-800/20 border-violet-700/30 shadow-violet-500/10';
      case GlassmorphicVariants.PURPLE:
        return 'from-purple-900/30 to-purple-800/20 border-purple-700/30 shadow-purple-500/10';
      case GlassmorphicVariants.MEDIUM:
        return 'from-slate-900/50 to-slate-800/30 border-slate-700/30 shadow-slate-500/10';
      case GlassmorphicVariants.SUBTLE:
        return 'from-slate-900/30 to-slate-800/20 border-slate-700/20 shadow-slate-500/5';
      default:
        return 'from-slate-900/40 to-slate-800/30 border-slate-700/40 shadow-slate-500/10';
    }
  };

  // Get extra effects based on properties
  const getEffectClasses = () => {
    const effectClasses = [];
    
    // Glow effect
    if (glowEffect) {
      switch (variant) {
        case GlassmorphicVariants.QUANTUM:
          effectClasses.push('glow-quantum');
          break;
        case GlassmorphicVariants.ETHEREAL:
          effectClasses.push('glow-astral');
          break;
        case GlassmorphicVariants.COSMIC:
          effectClasses.push('glow-violet');
          break;
        case GlassmorphicVariants.PURPLE:
          effectClasses.push('glow-purple');
          break;
        case GlassmorphicVariants.MEDIUM:
          effectClasses.push('glow-slate');
          break;
        case GlassmorphicVariants.SUBTLE:
          effectClasses.push('glow-subtle');
          break;
        default:
          effectClasses.push('glow-white');
          break;
      }
    }
    
    // Shimmer effect
    if (shimmer) {
      effectClasses.push('shimmer-effect');
    }
    
    return effectClasses.join(' ');
  };

  const baseClasses = `
    relative rounded-lg 
    backdrop-blur-md bg-gradient-to-b 
    border shadow-lg
    ${getBaseClasses()}
  `;
  
  const effectClasses = getEffectClasses();
  
  const contentClasses = centerContent 
    ? 'flex items-center justify-center'
    : '';

  // Return either a motion component or a regular div
  if (animate) {
    return (
      <motion.div
        ref={ref}
        className={cn(baseClasses, effectClasses, contentClasses, className)}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(baseClasses, effectClasses, contentClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
});

GlassmorphicContainer.displayName = 'GlassmorphicContainer';

export default GlassmorphicContainer;
