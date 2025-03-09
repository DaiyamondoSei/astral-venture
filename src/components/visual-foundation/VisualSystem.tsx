
import React from 'react';
import CosmicBackground from './CosmicBackground';
import MetatronsCube from './metatrons-cube';
import GlassmorphicContainer from './GlassmorphicContainer';
import { useQuantumTheme } from './QuantumThemeProvider';

interface VisualSystemProps {
  children: React.ReactNode;
  showBackground?: boolean;
  showMetatronsCube?: boolean;
  backgroundIntensity?: 'low' | 'medium' | 'high';
}

const VisualSystem: React.FC<VisualSystemProps> = ({
  children,
  showBackground = true,
  showMetatronsCube = false,
  backgroundIntensity,
}) => {
  const { 
    theme, 
    cosmicIntensity,
    getPrimaryColor,
    getSecondaryColor
  } = useQuantumTheme();
  
  const intensity = backgroundIntensity || cosmicIntensity;
  const primaryColor = getPrimaryColor();
  const secondaryColor = getSecondaryColor();
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layer */}
      {showBackground && (
        <CosmicBackground
          intensity={intensity}
          colorScheme={theme === 'default' ? 'default' : theme}
          animationSpeed={1}
          className="z-0"
        />
      )}
      
      {/* Optional Metatron's Cube */}
      {showMetatronsCube && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 opacity-30 pointer-events-none">
          <MetatronsCube 
            size={600}
            color="rgba(255, 255, 255, 0.5)"
            glowColor={primaryColor}
            glowIntensity="medium"
            spinSpeed={0.2}
            strokeWidth={0.5}
            nodeColor="rgba(255, 255, 255, 0.8)"
            activeNodeColor={secondaryColor}
          />
        </div>
      )}
      
      {/* Content layer */}
      <div className="relative z-20 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default VisualSystem;
