import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
interface GlowEffectProps {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  animation?: 'none' | 'pulse' | 'breathe' | 'ripple' | 'shimmer';
  style?: React.CSSProperties;
  onClick?: () => void;
  interactive?: boolean;
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
  interactive = false,
  ariaLabel
}: GlowEffectProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const intensityMap = {
    low: '10px',
    medium: '20px',
    high: '30px'
  };
  const animationMap = {
    none: '',
    pulse: 'animate-pulse',
    breathe: 'animate-breathe',
    ripple: 'animate-ripple',
    shimmer: 'animate-shimmer'
  };

  // Determine the glow intensity based on interaction state
  const glowRadius = interactive && isHovered ? `${parseInt(intensityMap[intensity]) + 8}px` : intensityMap[intensity];
  const glowStyle = {
    boxShadow: `0 0 ${glowRadius} ${color}`,
    transition: 'box-shadow 0.3s ease-out',
    ...style
  };

  // Handle keyboard events if clickable
  const handleKeyDown = onClick ? (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  } : undefined;

  // Handle interaction events
  const handleMouseEnter = interactive ? () => setIsHovered(true) : undefined;
  const handleMouseLeave = interactive ? () => setIsHovered(false) : undefined;
  const handleFocus = interactive ? () => setIsHovered(true) : undefined;
  const handleBlur = interactive ? () => setIsHovered(false) : undefined;

  // Add interactive attributes if component is clickable
  const interactiveProps = onClick ? {
    role: "button",
    tabIndex: 0,
    onKeyDown: handleKeyDown,
    "aria-label": ariaLabel,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur
  } : {};

  // Animation variants for when component mounts
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  return <motion.div style={glowStyle} onClick={onClick} initial="hidden" animate="visible" variants={containerVariants} data-prefers-reduced-motion="respect" className="py-[26px] px-[49px] bg-rose-950">
      {/* Ripple effect for interactive elements when clicked */}
      {interactive && onClick && <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
          <span className="absolute inset-0 rounded-[inherit] -z-10 bg-[radial-gradient(var(--ripple-color,rgba(255,255,255,0.12))_30%,transparent_70%)]
             opacity-0 data-[active]:opacity-100 data-[active]:duration-500 data-[active]:animate-ripple transition-opacity" />
        </span>}
      
      {children}
    </motion.div>;
};
export default GlowEffect;