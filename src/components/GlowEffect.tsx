
import React from 'react';
import { cn } from "@/lib/utils";

interface GlowEffectProps {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  animation?: 'none' | 'pulse' | 'breathe';
  style?: React.CSSProperties;
  onClick?: () => void; // Added onClick handler prop
}

const GlowEffect = ({
  className,
  children,
  color = 'rgba(138, 92, 246, 0.5)',
  intensity = 'medium',
  animation = 'none',
  style,
  onClick
}: GlowEffectProps) => {
  const intensityMap = {
    low: '10px',
    medium: '20px',
    high: '30px'
  };

  const animationMap = {
    none: '',
    pulse: 'animate-pulse-glow',
    breathe: 'animate-breathe'
  };

  const glowStyle = {
    boxShadow: `0 0 ${intensityMap[intensity]} ${color}`,
    ...style
  };

  return (
    <div 
      className={cn(
        "relative",
        animationMap[animation],
        className
      )}
      style={glowStyle}
      onClick={onClick} // Added onClick handler to the div
    >
      {children}
    </div>
  );
};

export default GlowEffect;
