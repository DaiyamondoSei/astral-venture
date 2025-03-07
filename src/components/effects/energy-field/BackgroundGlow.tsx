
import React from 'react';
import { BackgroundGlowProps } from './types';

const BackgroundGlow: React.FC<BackgroundGlowProps> = ({ colors, dimensions }) => {
  return (
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      style={{
        width: Math.min(dimensions.width, dimensions.height) * 0.5,
        height: Math.min(dimensions.width, dimensions.height) * 0.5,
        opacity: 0.15,
        background: `radial-gradient(circle, ${colors[0]} 0%, rgba(0,0,0,0) 70%)`,
      }}
    />
  );
};

export default React.memo(BackgroundGlow);
