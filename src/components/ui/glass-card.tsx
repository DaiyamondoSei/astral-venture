
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { usePerformance } from '@/hooks/usePerformance';
import { 
  GlassmorphicVariant, 
  DeviceCapabilities 
} from '@/types/core/performance/constants';

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: GlassmorphicVariant;
  blur?: number;
  borderOpacity?: number;
  backgroundOpacity?: number;
  interactive?: boolean;
  fullWidth?: boolean;
  depth?: number;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * GlassCard - A glassmorphic card component with multiple visual variants
 * 
 * Automatically adapts visual complexity based on device performance capabilities
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  blur,
  borderOpacity,
  backgroundOpacity,
  interactive = false,
  fullWidth = false,
  depth = 1,
  disabled = false,
  onClick
}) => {
  const { deviceCapability } = usePerformance();
  
  // Default blur based on variant and device capability
  const getDefaultBlur = () => {
    if (deviceCapability === DeviceCapabilities.LOW_END) {
      return 3; // Reduced blur for low-end devices
    }
    
    if (deviceCapability === DeviceCapabilities.MID_RANGE) {
      return 5; // Medium blur for mid-range devices
    }
    
    // Variant-specific blur values for high-end devices
    switch (variant) {
      case 'quantum': return 10;
      case 'ethereal': return 15;
      case 'elevated': return 8;
      case 'subtle': return 4;
      case 'cosmic': return 12;
      case 'purple': return 7;
      case 'medium': return 6;
      default: return 6;
    }
  };

  // Default background opacity based on variant
  const getBackgroundOpacity = () => {
    switch (variant) {
      case 'quantum': return 0.2;
      case 'ethereal': return 0.15;
      case 'elevated': return 0.3;
      case 'subtle': return 0.1;
      case 'cosmic': return 0.18;
      case 'purple': return 0.25;
      case 'medium': return 0.2;
      default: return 0.2;
    }
  };

  // Card style variations
  const blurValue = blur ?? getDefaultBlur();
  const bgOpacity = backgroundOpacity ?? getBackgroundOpacity();
  const borderOpacityValue = borderOpacity ?? 0.2;
  
  // Interactivity animations
  const transition = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
    duration: 0.2
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-lg overflow-hidden border',
        fullWidth ? 'w-full' : '',
        interactive ? 'cursor-pointer' : '',
        disabled ? 'opacity-50 pointer-events-none' : '',
        className
      )}
      style={{
        background: `rgba(255, 255, 255, ${bgOpacity})`,
        backdropFilter: `blur(${blurValue}px)`,
        borderColor: `rgba(255, 255, 255, ${borderOpacityValue})`,
        boxShadow: `0 ${depth * 4}px ${depth * 8}px rgba(0, 0, 0, 0.1)`,
        WebkitBackdropFilter: `blur(${blurValue}px)`,
      }}
      whileHover={interactive ? { scale: 1.02, opacity: 1 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={transition}
      onClick={!disabled && onClick ? onClick : undefined}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
