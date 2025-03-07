
import React, { useMemo } from 'react';

export interface BackgroundGlowProps {
  energyPoints: number;
  colors?: string[];
  dimensions?: {
    width: number;
    height: number;
  };
}

const BackgroundGlow: React.FC<BackgroundGlowProps> = ({ 
  energyPoints,
  colors = ['#8b5cf6', '#6366f1', '#ec4899'], 
  dimensions
}) => {
  // Calculate intensity based on energy points
  const intensity = useMemo(() => {
    return Math.min(0.7, 0.2 + (energyPoints / 2000) * 0.5);
  }, [energyPoints]);

  // Safe dimensions check
  const width = dimensions?.width || 300;
  const height = dimensions?.height || 300;
  
  // Generate gradient stops based on colors
  const gradientStops = useMemo(() => {
    return colors.map((color, index) => {
      const position = (index / (colors.length - 1)) * 100;
      return `${color} ${position}%`;
    }).join(', ');
  }, [colors]);

  return (
    <div 
      className="absolute inset-0 z-0 overflow-hidden rounded-lg"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${gradientStops})`,
          opacity: intensity,
          filter: 'blur(24px)',
        }}
      />
    </div>
  );
};

export default React.memo(BackgroundGlow);
