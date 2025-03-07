
import React from 'react';
import MetatronsBackground from '@/components/sacred-geometry/components/MetatronsBackground';
import QuantumParticles from '@/components/effects/QuantumParticles';

interface PageBackgroundProps {
  energyPoints: number;
  consciousnessLevel: number;
}

const PageBackground: React.FC<PageBackgroundProps> = ({ 
  energyPoints, 
  consciousnessLevel 
}) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-quantum-950/50 to-black/90 z-0"></div>
      <MetatronsBackground 
        consciousnessLevel={consciousnessLevel}
        opacity={0.2}
      />
      <QuantumParticles count={20} interactive={true} className="z-0" />
    </div>
  );
};

export default PageBackground;
