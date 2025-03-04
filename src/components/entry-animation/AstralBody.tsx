
import React from 'react';
import GlowEffect from '@/components/GlowEffect';
import HumanSilhouette from './astral-body/HumanSilhouette';
import ChakraPoints from './astral-body/ChakraPoints';
import ChakraConnections from './astral-body/ChakraConnections';
import ChakraActivationIndicator from './astral-body/ChakraActivationIndicator';
import { useChakraActivation } from './astral-body/useChakraActivation';

interface AstralBodyProps {
  emotionColors?: {
    primary: string;
    secondary: string;
  };
}

const AstralBody = ({ emotionColors }: AstralBodyProps) => {
  // Default colors if none provided
  const primary = emotionColors?.primary || "quantum-400";
  const secondary = emotionColors?.secondary || "quantum-700";
  
  // Get the stored user dream if available
  const userDream = typeof window !== 'undefined' ? localStorage.getItem('userDream') : null;
  const dominantTheme = typeof window !== 'undefined' ? localStorage.getItem('dominantDreamTheme') : null;
  
  // Get chakra activation state
  const [chakras, activatedCount] = useChakraActivation(userDream, dominantTheme);
  
  // Calculate a glow intensity based on the number of activated chakras
  const glowIntensity = Math.min(0.4 + (activatedCount * 0.1), 0.9); // Scale from 0.5 to 0.9
  
  return (
    <div className="relative">
      {/* Astral Body Silhouette - Human-like form */}
      <svg 
        className="w-64 h-80 mx-auto astral-body-silhouette"
        viewBox="0 0 200 320" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <HumanSilhouette />
        <ChakraPoints chakras={chakras} />
        <ChakraConnections chakras={chakras} />
      </svg>
      
      <GlowEffect 
        className="absolute inset-0 w-full h-full rounded-lg"
        animation="pulse"
        color={`rgba(124, 58, 237, ${glowIntensity})`}
        intensity="high"
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-xl font-display mt-40">Astral Field Activated</div>
      </div>
      
      <ChakraActivationIndicator 
        activatedCount={activatedCount} 
        chakraNames={chakras}
      />
    </div>
  );
};

export default AstralBody;
