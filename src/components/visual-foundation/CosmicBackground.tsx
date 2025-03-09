
import React, { useMemo, useCallback } from 'react';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { getColorScheme } from './cosmic/ColorSchemes';
import StarField from './cosmic/StarField';
import ConstellationField from './cosmic/ConstellationField';
import NebulaEffect from './cosmic/NebulaEffect';

interface CosmicBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  animationSpeed?: number;
  colorScheme?: 'default' | 'ethereal' | 'astral' | 'quantum';
  className?: string;
}

const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  intensity = 'medium',
  animationSpeed = 1,
  colorScheme = 'default',
  className = '',
}) => {
  const { config } = usePerfConfig();
  
  // Use the device capability to automatically lower intensity if needed
  const adaptedIntensity = useMemo(() => {
    if (config.deviceCapability === 'low') {
      return 'low';
    }
    return intensity;
  }, [intensity, config.deviceCapability]);
  
  // Memoize color scheme to prevent unnecessary recalculations
  const colors = useMemo(() => getColorScheme(colorScheme), [colorScheme]);

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      {/* Base gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.background}`} />
      
      {/* Stars layer - always render as it's essential */}
      <StarField 
        intensity={adaptedIntensity} 
        animationSpeed={animationSpeed} 
        colorScheme={colorScheme}
        primaryColor={colors.particlePrimary}
        secondaryColor={colors.particleSecondary}
      />
      
      {/* Constellations - only render on medium/high devices */}
      {(config.deviceCapability !== 'low' || adaptedIntensity !== 'low') && (
        <ConstellationField 
          intensity={adaptedIntensity}
          colorScheme={colorScheme}
          primaryColor={colors.particlePrimary}
          secondaryColor={colors.particleSecondary}
        />
      )}
      
      {/* Nebula effect - only render on medium/high devices with medium/high intensity */}
      {(config.deviceCapability !== 'low' && adaptedIntensity !== 'low') && (
        <NebulaEffect glowColor={colors.glowColor} />
      )}
    </div>
  );
};

export default React.memo(CosmicBackground);
