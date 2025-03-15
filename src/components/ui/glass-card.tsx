
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePerformance } from '@/hooks/usePerformance';
import { 
  GlassmorphicVariant, 
  DeviceCapability 
} from '@/types/core/performance/constants';
import { 
  GlassmorphicVariants, 
  DeviceCapabilities 
} from '@/types/core/performance/runtime-constants';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: GlassmorphicVariant;
  glowEffect?: boolean;
  shimmer?: boolean;
  animate?: boolean;
}

/**
 * A glass morphic card component with various visual effects.
 * Automatically adapts visual complexity based on device capability.
 */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  className,
  variant = GlassmorphicVariants.DEFAULT,
  glowEffect = false,
  shimmer = false,
  animate = false,
  ...props
}, ref) => {
  const { deviceCapability, isLowPerformance } = usePerformance();
  
  // Simplify effects for low-end devices
  const shouldSimplify = 
    isLowPerformance || 
    deviceCapability === DeviceCapabilities.LOW_END;
  
  // Use simplified styles for low-end devices
  const simplifiedStyles = shouldSimplify 
    ? { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'none' } 
    : {};
    
  // Style variations based on variant prop
  const getVariantStyles = () => {
    switch(variant) {
      case GlassmorphicVariants.QUANTUM:
        return "bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg";
      case GlassmorphicVariants.ETHEREAL:
        return "bg-white/10 backdrop-blur-md border border-white/20 shadow-md";
      case GlassmorphicVariants.ELEVATED:
        return "bg-white/5 backdrop-blur-sm border-b border-white/10 shadow-xl";
      case GlassmorphicVariants.SUBTLE:
        return "bg-black/5 backdrop-blur-sm border border-white/5";
      case GlassmorphicVariants.COSMIC:
        return "bg-indigo-800/10 backdrop-blur-xl border border-indigo-600/20";
      case GlassmorphicVariants.PURPLE:
        return "bg-purple-900/20 backdrop-blur-xl border border-purple-600/20";
      case GlassmorphicVariants.MEDIUM:
        return "bg-slate-900/40 backdrop-blur-md border border-slate-700/50";
      default:
        return "bg-black/30 backdrop-blur-md border border-white/5";
    }
  };
  
  const transition = {
    type: 'spring',
    stiffness: 300, 
    damping: 20
  };
  
  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-xl overflow-hidden",
        getVariantStyles(),
        glowEffect && !shouldSimplify && "shadow-glow",
        shimmer && !shouldSimplify && "shimmer-effect",
        className
      )}
      style={simplifiedStyles}
      initial={animate ? { opacity: 0, y: 10 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;
