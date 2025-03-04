
import React from 'react';
import { cn } from "@/lib/utils";
import GlowEffect from './GlowEffect';

interface EnergyAvatarProps {
  level: number;
  className?: string;
}

const EnergyAvatar = ({ level, className }: EnergyAvatarProps) => {
  // Calculate colors based on level
  const calculateLayers = () => {
    const layers = [];
    const maxLayers = 5;
    const activeLayers = Math.min(Math.ceil(level / 20), maxLayers);
    
    for (let i = 0; i < activeLayers; i++) {
      layers.push({
        color: `rgba(138, 92, 246, ${0.1 + (i * 0.18)})`,
        scale: 1 - (i * 0.15),
        animation: i % 2 === 0 ? 'animate-pulse-glow' : 'animate-breathe'
      });
    }
    
    return layers;
  };
  
  const layers = calculateLayers();
  
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Background layers */}
      {layers.map((layer, index) => (
        <div
          key={index}
          className={cn(
            "absolute rounded-full",
            layer.animation
          )}
          style={{
            backgroundColor: layer.color,
            width: `${100 * layer.scale}%`,
            height: `${100 * layer.scale}%`,
            zIndex: layers.length - index
          }}
        />
      ))}
      
      {/* Core avatar */}
      <GlowEffect 
        className="relative z-10 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700 
                   w-24 h-24 flex items-center justify-center"
        animation="pulse"
      >
        <div className="text-white font-display font-semibold">
          {level}
        </div>
      </GlowEffect>
    </div>
  );
};

export default EnergyAvatar;
