
import React from 'react';
import { cn } from "@/lib/utils";

interface GlowEffectProps {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  animation?: 'none' | 'pulse' | 'breathe';
  style?: React.CSSProperties;
  onClick?: () => void;
  ariaLabel?: string;
}

const GlowEffect = ({
  className,
  children,
  color = 'rgba(138, 92, 246, 0.5)',
  intensity = 'medium',
  animation = 'none',
  style,
  onClick,
  ariaLabel
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

  // Handle keyboard events if clickable
  const handleKeyDown = onClick ? (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  } : undefined;

  // Add interactive attributes if component is clickable
  const interactiveProps = onClick ? {
    role: "button",
    tabIndex: 0,
    onKeyDown: handleKeyDown,
    "aria-label": ariaLabel,
  } : {};

  return (
    <div 
      className={cn(
        "relative",
        animationMap[animation],
        onClick ? "cursor-pointer" : "",
        className
      )}
      style={glowStyle}
      onClick={onClick}
      {...interactiveProps}
      data-prefers-reduced-motion="respect"
    >
      {children}
    </div>
  );
};

export default GlowEffect;
