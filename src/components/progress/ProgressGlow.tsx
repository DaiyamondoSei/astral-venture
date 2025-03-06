
import React from 'react';
import { cn } from "@/lib/utils";
import { AnimationStyle } from './types';
import { getAnimationClass } from './utils';
import GlowEffect from '../GlowEffect';

interface ProgressGlowProps {
  progress: number;
  colorScheme: string;
  animation: AnimationStyle;
  className?: string;
}

const ProgressGlow: React.FC<ProgressGlowProps> = ({
  progress,
  colorScheme,
  animation,
  className
}) => {
  const animationClass = getAnimationClass(animation);
  
  // Map AnimationStyle to GlowEffect animation prop
  // This ensures type compatibility
  const glowAnimation = animation === 'slide' ? 'pulse' : animation;
  
  return (
    <GlowEffect 
      className={cn(
        "absolute h-full left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
        colorScheme,
        animationClass,
        className
      )}
      animation={glowAnimation}
      style={{ width: `${progress}%` }}
    />
  );
};

export default ProgressGlow;
