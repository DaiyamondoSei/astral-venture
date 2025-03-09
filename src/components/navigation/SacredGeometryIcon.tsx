
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type SacredGeometryIconType = 
  | 'seed-of-life'
  | 'flower-of-life'
  | 'tree-of-life'
  | 'merkaba'
  | 'fibonacci'
  | 'golden-ratio'
  | 'platonic-solid'
  | 'torus';

interface SacredGeometryIconProps {
  type: SacredGeometryIconType;
  label: string;
  description?: string;
  isActive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glowColor?: string;
  animateOnHover?: boolean;
}

const SacredGeometryIcon = memo(({
  type,
  label,
  description,
  isActive = false,
  onClick,
  size = 'md',
  className,
  glowColor = 'rgba(139, 92, 246, 0.6)',
  animateOnHover = true
}: SacredGeometryIconProps) => {
  // Size mapping for the icon
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  // Get SVG path based on icon type
  const getIconPath = () => {
    switch (type) {
      case 'seed-of-life':
        return (
          <g>
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="67.32" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="67.32" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="70" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="32.68" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="32.68" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </g>
        );
      case 'flower-of-life':
        return (
          <g>
            <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="34" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="66" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="64" cy="42" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="64" cy="58" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="36" cy="42" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="36" cy="58" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="78" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="22" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </g>
        );
      case 'tree-of-life':
        return (
          <g>
            <circle cx="50" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="30" cy="35" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="70" cy="35" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="30" cy="65" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="70" cy="65" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="80" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="50" y1="20" x2="30" y2="35" stroke="currentColor" strokeWidth="1.5" />
            <line x1="50" y1="20" x2="70" y2="35" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30" y1="35" x2="50" y2="50" stroke="currentColor" strokeWidth="1.5" />
            <line x1="70" y1="35" x2="50" y2="50" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30" y1="35" x2="70" y2="35" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30" y1="65" x2="50" y2="50" stroke="currentColor" strokeWidth="1.5" />
            <line x1="70" y1="65" x2="50" y2="50" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30" y1="65" x2="70" y2="65" stroke="currentColor" strokeWidth="1.5" />
            <line x1="50" y1="80" x2="30" y2="65" stroke="currentColor" strokeWidth="1.5" />
            <line x1="50" y1="80" x2="70" y2="65" stroke="currentColor" strokeWidth="1.5" />
          </g>
        );
      case 'merkaba':
        return (
          <g>
            <path d="M50 20 L80 65 L20 65 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M50 80 L20 35 L80 35 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </g>
        );
      case 'fibonacci':
        return (
          <g>
            <path d="M50,85 A35,35 0 0,1 15,50 A35,35 0 0,1 50,15 A35,35 0 0,1 85,50 A35,35 0 0,1 50,85 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M50,72 A22,22 0 0,1 28,50 A22,22 0 0,1 50,28 A22,22 0 0,1 72,50 A22,22 0 0,1 50,72 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M50,63 A13,13 0 0,1 37,50 A13,13 0 0,1 50,37 A13,13 0 0,1 63,50 A13,13 0 0,1 50,63 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M50,55 A5,5 0 0,1 45,50 A5,5 0 0,1 50,45 A5,5 0 0,1 55,50 A5,5 0 0,1 50,55 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </g>
        );
      case 'golden-ratio':
        return (
          <g>
            <rect x="15" y="15" width="70" height="70" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="15" y="15" width="43.3" height="43.3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="58.3" y="15" width="26.7" height="26.7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="58.3" y="41.7" width="16.5" height="16.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="58.3" y="58.2" width="10.2" height="10.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="68.5" y="58.2" width="6.3" height="6.3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </g>
        );
      case 'platonic-solid':
        return (
          <g>
            <path d="M50 20 L80 65 L20 65 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 65 L50 80 L80 65 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M50 20 L20 65 L50 80 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M50 20 L80 65 L50 80 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </g>
        );
      case 'torus':
        return (
          <g>
            <ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="50" cy="50" rx="10" ry="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </g>
        );
      default:
        return (
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
        );
    }
  };
  
  // Animation variants
  const iconVariants = {
    active: { 
      scale: 1.1,
      filter: `drop-shadow(0 0 4px ${glowColor})`,
      transition: { duration: 0.3 }
    },
    inactive: { 
      scale: 1,
      filter: 'none',
      transition: { duration: 0.3 }
    },
    hover: { 
      scale: 1.05,
      filter: `drop-shadow(0 0 3px ${glowColor})`,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const iconContent = (
    <motion.div
      className={cn(
        "flex items-center justify-center rounded-full",
        sizeClasses[size],
        isActive ? "text-white" : "text-white/80",
        className
      )}
      initial="inactive"
      animate={isActive ? "active" : "inactive"}
      whileHover={animateOnHover ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      variants={iconVariants}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        willChange: 'transform, filter'
      }}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {getIconPath()}
      </svg>
    </motion.div>
  );

  // If there's a description, wrap in a tooltip
  if (description) {
    return (
      <Tooltip delayDuration={300}>
        <Tooltip.Trigger asChild>
          {iconContent}
        </Tooltip.Trigger>
        <Tooltip.Content>
          <div className="max-w-xs">
            <h4 className="font-semibold">{label}</h4>
            <p className="text-sm opacity-90">{description}</p>
          </div>
        </Tooltip.Content>
      </Tooltip>
    );
  }

  return iconContent;
});

SacredGeometryIcon.displayName = 'SacredGeometryIcon';

export default SacredGeometryIcon;
