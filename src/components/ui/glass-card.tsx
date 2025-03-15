
import React from 'react';
import { cn } from '@/lib/utils';
import { usePerformance } from '@/contexts/PerformanceContext';
import { DeviceCapabilities } from '@/utils/performance/constants';

// GlassmorphicVariant is a local enum for the types of glass effects
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal' | 'elevated' | 'cosmic' | 'purple';

// Define runtime constants for the glass variants
export const GlassmorphicVariants = {
  DEFAULT: 'default' as GlassmorphicVariant,
  QUANTUM: 'quantum' as GlassmorphicVariant,
  ETHEREAL: 'ethereal' as GlassmorphicVariant,
  ELEVATED: 'elevated' as GlassmorphicVariant,
  COSMIC: 'cosmic' as GlassmorphicVariant,
  PURPLE: 'purple' as GlassmorphicVariant
};

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassmorphicVariant;
  intensity?: 'light' | 'medium' | 'heavy';
  adaptiveOpacity?: boolean;
  interactive?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', intensity = 'medium', adaptiveOpacity = true, interactive = false, ...props }, ref) => {
    const { deviceCapability } = usePerformance();
    
    // Reduce visual complexity on low-end devices
    const simplifyForPerformance = deviceCapability === DeviceCapabilities.LOW;
    
    // Base styles that apply to all variants
    const baseStyles = "rounded-lg backdrop-blur-sm transition-all duration-300";
    
    // Intensity-based styles
    const intensityStyles = {
      light: "bg-white/10 border border-white/20 shadow-sm",
      medium: "bg-white/15 border border-white/30 shadow-md",
      heavy: "bg-white/20 border border-white/40 shadow-lg"
    };
    
    // Variant-specific styles
    const variantStyles = {
      default: "",
      quantum: "border-indigo-300/30 shadow-indigo-500/20",
      ethereal: "border-teal-300/30 shadow-teal-500/20",
      elevated: "border-amber-300/30 shadow-amber-500/20",
      cosmic: "border-purple-300/30 shadow-purple-500/20",
      purple: "border-purple-300/30 shadow-purple-500/20"
    };
    
    // Interactive styles for hover and focus
    const interactiveStyles = interactive
      ? "hover:bg-white/25 hover:border-white/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
      : "";
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          intensityStyles[intensity],
          variantStyles[variant as keyof typeof variantStyles],
          interactiveStyles,
          simplifyForPerformance ? "backdrop-blur-[2px]" : "",
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };

export default GlassCard;
