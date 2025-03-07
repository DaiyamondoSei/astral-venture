
import React from 'react';
import MetatronsBackground from '@/components/sacred-geometry/components/MetatronsBackground';
import QuantumParticles from '@/components/effects/QuantumParticles';

interface PageBackgroundProps {
  energyPoints: number;
  consciousnessLevel: number;
}

/**
 * PageBackground component
 * 
 * Renders the background effects for the main page based on the user's
 * energy points and consciousness level.
 */
const PageBackground: React.FC<PageBackgroundProps> = ({ 
  energyPoints, 
  consciousnessLevel 
}) => {
  // Calculate particle count based on energy points (more energy = more particles)
  const particleCount = Math.min(Math.max(15, Math.floor(energyPoints / 100) + 15), 40);
  
  // Calculate animation speed based on consciousness level
  const particleSpeed = Math.max(0.5, Math.min(1.5, consciousnessLevel * 0.2));
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-quantum-950/50 to-black/90 z-0"></div>
      
      {/* Sacred geometry background with consciousness level */}
      <MetatronsBackground 
        consciousnessLevel={consciousnessLevel}
        opacity={0.2}
        intensity="medium"
        animated={true}
      />
      
      {/* Quantum particles with dynamic count based on energy */}
      <QuantumParticles 
        count={particleCount} 
        interactive={true} 
        className="z-0"
        speed={particleSpeed}
      />
    </div>
  );
};

export default React.memo(PageBackground);
