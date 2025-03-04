
import React from 'react';
import GlowEffect from '@/components/GlowEffect';

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
  
  // Determine chakra activation based on dream content
  const getChakraActivation = () => {
    if (!userDream) return { crown: true, throat: true, heart: true };
    
    const dream = userDream.toLowerCase();
    const activations = {
      root: dream.includes('security') || dream.includes('stability') || dream.includes('safety'),
      sacral: dream.includes('creativity') || dream.includes('passion') || dream.includes('emotion'),
      solar: dream.includes('confidence') || dream.includes('power') || dream.includes('control'),
      heart: dream.includes('love') || dream.includes('compassion') || dream.includes('healing'),
      throat: dream.includes('expression') || dream.includes('truth') || dream.includes('communication'),
      third: dream.includes('intuition') || dream.includes('vision') || dream.includes('insight'),
      crown: dream.includes('connection') || dream.includes('spiritual') || dream.includes('consciousness')
    };
    
    // Ensure at least heart chakra is active by default
    if (!Object.values(activations).some(v => v)) {
      activations.heart = true;
    }
    
    return activations;
  };
  
  const chakras = getChakraActivation();
  
  return (
    <div className="relative">
      {/* Astral Body Silhouette - Human-like form */}
      <svg 
        className="w-64 h-80 mx-auto astral-body-silhouette"
        viewBox="0 0 200 320" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="100" cy="60" r="30" className="astral-body-part" />
        
        {/* Neck */}
        <path d="M90 90 L110 90 L108 105 L92 105 Z" className="astral-body-part" />
        
        {/* Torso */}
        <path d="M75 105 L125 105 L135 200 L65 200 Z" className="astral-body-part" />
        
        {/* Arms */}
        <path d="M75 115 L40 160 L48 170 L85 125" className="astral-body-part" />
        <path d="M125 115 L160 160 L152 170 L115 125" className="astral-body-part" />
        
        {/* Hands */}
        <circle cx="40" cy="168" r="8" className="astral-body-part" />
        <circle cx="160" cy="168" r="8" className="astral-body-part" />
        
        {/* Legs */}
        <path d="M85 200 L65 280 L85 285 L95 205" className="astral-body-part" />
        <path d="M115 200 L135 280 L115 285 L105 205" className="astral-body-part" />
        
        {/* Feet */}
        <path d="M65 280 L55 285 L65 295 L85 285" className="astral-body-part" />
        <path d="M135 280 L145 285 L135 295 L115 285" className="astral-body-part" />
        
        {/* Energy Points (chakras) with emotional activation */}
        <circle cx="100" cy="60" r="6" className={`energy-point crown-chakra ${chakras.crown ? 'active' : 'inactive'}`} style={{opacity: chakras.crown ? 1 : 0.3}} />
        <circle cx="100" cy="90" r="5" className={`energy-point throat-chakra ${chakras.throat ? 'active' : 'inactive'}`} style={{opacity: chakras.throat ? 1 : 0.3}} />
        <circle cx="100" cy="120" r="7" className={`energy-point heart-chakra ${chakras.heart ? 'active' : 'inactive'}`} style={{opacity: chakras.heart ? 1 : 0.3}} />
        <circle cx="100" cy="150" r="6" className={`energy-point solar-chakra ${chakras.solar ? 'active' : 'inactive'}`} style={{opacity: chakras.solar ? 1 : 0.3}} />
        <circle cx="100" cy="180" r="5" className={`energy-point sacral-chakra ${chakras.sacral ? 'active' : 'inactive'}`} style={{opacity: chakras.sacral ? 1 : 0.3}} />
        <circle cx="100" cy="200" r="6" className={`energy-point root-chakra ${chakras.root ? 'active' : 'inactive'}`} style={{opacity: chakras.root ? 1 : 0.3}} />
      </svg>
      
      <GlowEffect 
        className="absolute inset-0 w-full h-full rounded-lg"
        animation="pulse"
        color={`rgba(124, 58, 237, 0.8)`}
        intensity="high"
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-xl font-display mt-40">Astral Field Activated</div>
      </div>
    </div>
  );
};

export default AstralBody;
