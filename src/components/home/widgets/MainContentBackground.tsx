
import React from 'react';
import { motion } from 'framer-motion';
import { LazyInteractiveEnergyField } from '@/components/lazy';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePerformance } from '@/contexts/PerformanceContext';
import LazyLoadWrapper from '@/components/LazyLoadWrapper';

interface MainContentBackgroundProps {
  energyPoints: number;
}

const MainContentBackground: React.FC<MainContentBackgroundProps> = ({
  energyPoints
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { 
    isLowPerformance, 
    deviceCapability
  } = usePerformance();
  
  const getParticleDensity = () => {
    if (isLowPerformance) return 0.1;
    if (deviceCapability === 'medium') return 0.2;
    return isMobile ? 0.2 : 0.3;
  };

  return (
    <div className="absolute inset-0 opacity-20">
      <LazyLoadWrapper fallbackHeight="100%">
        <LazyInteractiveEnergyField 
          energyPoints={energyPoints} 
          particleDensity={getParticleDensity()}
          className="w-full h-full"
        />
      </LazyLoadWrapper>
    </div>
  );
};

export default MainContentBackground;
