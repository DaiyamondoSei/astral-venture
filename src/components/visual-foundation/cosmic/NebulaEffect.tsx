
import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePerfConfig } from '@/hooks/usePerfConfig';

interface NebulaEffectProps {
  glowColor: string;
  intensity?: 'low' | 'medium' | 'high';
  pulseSpeed?: number;
}

const NebulaEffect = memo(({ 
  glowColor, 
  intensity = 'medium',
  pulseSpeed = 1
}: NebulaEffectProps) => {
  const { config } = usePerfConfig();
  
  const getOpacityByIntensity = useCallback(() => {
    switch (intensity) {
      case 'low': return [0.15, 0.25, 0.15];
      case 'high': return [0.3, 0.45, 0.3];
      default: return [0.2, 0.35, 0.2];
    }
  }, [intensity]);
  
  const getScaleByIntensity = useCallback(() => {
    switch (intensity) {
      case 'low': return [1, 1.05, 1];
      case 'high': return [1, 1.15, 1];
      default: return [1, 1.1, 1];
    }
  }, [intensity]);
  
  // Adjust animation duration based on pulse speed
  const animationDuration = 8 / pulseSpeed;
  
  // Don't animate if device capability is low or animations are disabled
  const shouldAnimate = config.deviceCapability !== 'low';
  
  return (
    <motion.div 
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 50%)`,
        mixBlendMode: 'screen'
      }}
      animate={shouldAnimate ? {
        scale: getScaleByIntensity(),
        opacity: getOpacityByIntensity()
      } : undefined}
      transition={shouldAnimate ? {
        duration: animationDuration,
        repeat: Infinity,
        ease: "easeInOut"
      } : undefined}
      data-testid="nebula-effect"
    />
  );
});

NebulaEffect.displayName = 'NebulaEffect';

export default NebulaEffect;
