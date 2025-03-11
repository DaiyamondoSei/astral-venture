
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DeviceCapability, detectDeviceCapability } from '@/utils/performanceUtils';
import { usePerformanceContext } from '@/contexts/PerformanceContext';

export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal';

interface GlassmorphicContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: GlassmorphicVariant;
  withGlow?: boolean;
  intensityLevel?: number;
  responsive?: boolean;
}

/**
 * A container with a glassmorphic effect
 * Adapts to device capability for performance optimization
 */
export const GlassmorphicContainer: React.FC<GlassmorphicContainerProps> = ({
  children,
  className,
  variant = 'default',
  withGlow = true,
  intensityLevel = 1,
  responsive = true,
}) => {
  const { deviceCapability } = usePerformanceContext();
  const [capability, setCapability] = useState<DeviceCapability>(deviceCapability);
  
  // Initialize based on device capability
  useEffect(() => {
    setCapability(detectDeviceCapability());
  }, []);
  
  // Get styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'quantum':
        return 'bg-black/30 backdrop-blur-md border border-indigo-500/30';
      case 'ethereal':
        return 'bg-white/10 backdrop-blur-md border border-white/20';
      case 'default':
      default:
        return 'bg-black/20 backdrop-blur-sm border border-white/10';
    }
  };
  
  // Adjust blur amount based on device capability
  const getBlurAmount = () => {
    if (capability === DeviceCapability.LOW) {
      return 'backdrop-blur-sm';
    } else if (capability === DeviceCapability.MEDIUM) {
      return 'backdrop-blur-md';
    } else {
      return 'backdrop-blur-lg';
    }
  };
  
  // Apply glow based on device capability
  const getGlowEffect = () => {
    if (!withGlow) return '';
    
    // Simplify effect on low-end devices
    if (capability === DeviceCapability.LOW) {
      return 'shadow-sm';
    }
    
    // Adjust intensity based on level
    const intensityMap = {
      1: 'shadow-md',
      2: 'shadow-lg',
      3: 'shadow-xl'
    };
    
    return intensityMap[intensityLevel as 1 | 2 | 3] || 'shadow-md';
  };
  
  return (
    <motion.div
      className={cn(
        'relative rounded-xl transition-all duration-300',
        getVariantStyles(),
        getBlurAmount(),
        getGlowEffect(),
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
};

export default GlassmorphicContainer;
