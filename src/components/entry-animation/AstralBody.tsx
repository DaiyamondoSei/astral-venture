
import React from 'react';
import GlowEffect from '@/components/GlowEffect';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';

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
  
  // Determine chakra activation based on dream content and dominant theme
  const getChakraActivation = () => {
    let activations = { 
      root: false, 
      sacral: false, 
      solar: false, 
      heart: false, 
      throat: false, 
      third: false,
      crown: false 
    };
    
    // If we have an analyzed dominant theme, use that first
    if (dominantTheme) {
      switch(dominantTheme) {
        case 'love':
          activations.heart = true;
          break;
        case 'peace':
          activations.throat = true;
          activations.crown = true;
          break;
        case 'power':
          activations.solar = true;
          activations.root = true;
          break;
        case 'wisdom':
          activations.third = true;
          activations.crown = true;
          break;
        case 'creativity':
          activations.sacral = true;
          activations.throat = true;
          break;
        case 'spirituality':
          activations.crown = true;
          activations.third = true;
          break;
        case 'healing':
          activations.heart = true;
          activations.root = true;
          break;
        default:
          break;
      }
    }
    
    // Additional check through dream content for more activation
    if (userDream) {
      const dream = userDream.toLowerCase();
      
      // Root chakra - security, stability, safety
      if (dream.includes('security') || dream.includes('stability') || 
          dream.includes('safety') || dream.includes('ground') || dream.includes('home')) {
        activations.root = true;
      }
      
      // Sacral chakra - creativity, passion, emotion
      if (dream.includes('creativity') || dream.includes('passion') || 
          dream.includes('emotion') || dream.includes('desire') || dream.includes('pleasure')) {
        activations.sacral = true;
      }
      
      // Solar plexus - confidence, power, control
      if (dream.includes('confidence') || dream.includes('power') || 
          dream.includes('control') || dream.includes('strength') || dream.includes('success')) {
        activations.solar = true;
      }
      
      // Heart chakra - love, compassion, healing
      if (dream.includes('love') || dream.includes('compassion') || 
          dream.includes('healing') || dream.includes('heart') || dream.includes('connection')) {
        activations.heart = true;
      }
      
      // Throat chakra - expression, truth, communication
      if (dream.includes('expression') || dream.includes('truth') || 
          dream.includes('communication') || dream.includes('voice') || dream.includes('speak')) {
        activations.throat = true;
      }
      
      // Third eye - intuition, vision, insight
      if (dream.includes('intuition') || dream.includes('vision') || 
          dream.includes('insight') || dream.includes('clarity') || dream.includes('see')) {
        activations.third = true;
      }
      
      // Crown chakra - connection, spiritual, consciousness
      if (dream.includes('connection') || dream.includes('spiritual') || 
          dream.includes('consciousness') || dream.includes('divine') || dream.includes('highest')) {
        activations.crown = true;
      }
    }
    
    // Ensure at least one chakra is active by default
    if (!Object.values(activations).some(v => v)) {
      activations.heart = true;
    }
    
    return activations;
  };
  
  const chakras = getChakraActivation();
  
  // Calculate a glow intensity based on the number of activated chakras
  const activatedCount = Object.values(chakras).filter(Boolean).length;
  const glowIntensity = Math.min(0.4 + (activatedCount * 0.1), 0.9); // Scale from 0.5 to 0.9
  
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
        <circle cx="100" cy="280" r="6" className={`energy-point root-chakra ${chakras.root ? 'active' : 'inactive'}`} style={{opacity: chakras.root ? 1 : 0.3}} />
        <circle cx="100" cy="220" r="5" className={`energy-point sacral-chakra ${chakras.sacral ? 'active' : 'inactive'}`} style={{opacity: chakras.sacral ? 1 : 0.3}} />
        <circle cx="100" cy="180" r="6" className={`energy-point solar-chakra ${chakras.solar ? 'active' : 'inactive'}`} style={{opacity: chakras.solar ? 1 : 0.3}} />
        <circle cx="100" cy="140" r="7" className={`energy-point heart-chakra ${chakras.heart ? 'active' : 'inactive'}`} style={{opacity: chakras.heart ? 1 : 0.3}} />
        <circle cx="100" cy="110" r="5" className={`energy-point throat-chakra ${chakras.throat ? 'active' : 'inactive'}`} style={{opacity: chakras.throat ? 1 : 0.3}} />
        <circle cx="100" cy="90" r="4" className={`energy-point third-chakra ${chakras.third ? 'active' : 'inactive'}`} style={{opacity: chakras.third ? 1 : 0.3}} />
        <circle cx="100" cy="60" r="6" className={`energy-point crown-chakra ${chakras.crown ? 'active' : 'inactive'}`} style={{opacity: chakras.crown ? 1 : 0.3}} />
        
        {/* Add connecting lines between activated chakras for a more integrated look */}
        {(chakras.root && chakras.sacral) && (
          <line x1="100" y1="280" x2="100" y2="220" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        )}
        {(chakras.sacral && chakras.solar) && (
          <line x1="100" y1="220" x2="100" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        )}
        {(chakras.solar && chakras.heart) && (
          <line x1="100" y1="180" x2="100" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        )}
        {(chakras.heart && chakras.throat) && (
          <line x1="100" y1="140" x2="100" y2="110" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        )}
        {(chakras.throat && chakras.third) && (
          <line x1="100" y1="110" x2="100" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        )}
        {(chakras.third && chakras.crown) && (
          <line x1="100" y1="90" x2="100" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        )}
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
      
      {/* Chakra activation indicators */}
      {activatedCount > 0 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center text-white/70 text-xs font-display">
          {activatedCount > 3 ? 
            `${activatedCount} Chakras Active` : 
            Object.entries(chakras)
              .filter(([_, active]) => active)
              .map(([chakra]) => chakra.charAt(0).toUpperCase() + chakra.slice(1))
              .join(', ') + ' Active'
          }
        </div>
      )}
    </div>
  );
};

export default AstralBody;
