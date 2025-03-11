
import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { DeviceCapability, detectDeviceCapability } from '@/utils/performanceUtils';
import { usePerformanceContext } from '@/contexts/PerformanceContext';

const glassCardVariants = cva(
  "relative rounded-lg overflow-hidden transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-black/30 backdrop-blur-md border border-white/10",
        subtle: "bg-black/20 backdrop-blur-sm border border-white/5",
        elevated: "bg-black/40 backdrop-blur-lg border border-white/20",
        quantum: "bg-black/30 backdrop-blur-md border border-indigo-500/30",
        ethereal: "bg-white/10 backdrop-blur-md border border-white/20",
      },
      glowIntensity: {
        none: "",
        low: "shadow-sm",
        medium: "shadow-md",
        high: "shadow-lg",
      },
      hover: {
        true: "hover:bg-black/40 hover:border-white/30 transition-all duration-300",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      glowIntensity: "medium",
      hover: false,
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  children: React.ReactNode;
  animate?: boolean;
  motionProps?: Record<string, any>;
}

/**
 * GlassCard component with glassmorphism effect
 * Adapts to device capability for performance optimization
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    variant, 
    glowIntensity, 
    hover, 
    children, 
    animate = false,
    motionProps = {},
    ...props 
  }, ref) => {
    const { deviceCapability } = usePerformanceContext();

    // Adapt glow intensity based on device capability
    const adaptedGlowIntensity = React.useMemo(() => {
      if (deviceCapability === DeviceCapability.LOW) {
        return "none";
      }
      
      if (deviceCapability === DeviceCapability.MEDIUM && glowIntensity === "high") {
        return "medium";
      }
      
      return glowIntensity;
    }, [deviceCapability, glowIntensity]);
    
    // Render with or without animation
    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={cn(glassCardVariants({ 
            variant, 
            glowIntensity: adaptedGlowIntensity, 
            hover, 
            className 
          }))}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
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
        className={cn(glassCardVariants({ 
          variant, 
          glowIntensity: adaptedGlowIntensity, 
          hover,
          className 
        }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
