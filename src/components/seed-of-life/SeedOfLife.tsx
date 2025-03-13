
import React from 'react';
import SeedOfLifePortal from './SeedOfLifePortal';

interface SeedOfLifeProps {
  className?: string;
  animated?: boolean;
  size?: number;
  strokeWidth?: number;
  color?: string;
  secondaryColor?: string;
  interactive?: boolean;
  onInteraction?: () => void;
}

const SeedOfLife: React.FC<SeedOfLifeProps> = ({
  className = '',
  animated = true,
  size = 300,
  strokeWidth = 1.5,
  color = '#fff',
  secondaryColor = '#4f46e5',
  interactive = false,
  onInteraction
}) => {
  // Calculate view box dimensions
  const viewBox = `0 0 ${size} ${size}`;
  const center = size / 2;
  const radius = size / 4;

  // Create seed of life geometry
  const circles = Array.from({ length: 7 }, (_, index) => {
    if (index === 0) {
      // Center circle
      return (
        <circle
          key={index}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          className={animated ? 'animate-pulse-slow' : ''}
        />
      );
    }

    // Calculate position of outer circles
    const angle = (index - 1) * (Math.PI / 3);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);

    return (
      <circle
        key={index}
        cx={x}
        cy={y}
        r={radius}
        fill="none"
        stroke={secondaryColor}
        strokeWidth={strokeWidth}
        className={animated ? 'animate-pulse-slower' : ''}
        style={{ animationDelay: `${index * 0.1}s` }}
      />
    );
  });

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      onClick={interactive ? onInteraction : undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        className={`transition-all duration-500 ${interactive ? 'cursor-pointer hover:brightness-125' : ''}`}
      >
        {circles}
      </svg>
    </div>
  );
};

export default SeedOfLife;
