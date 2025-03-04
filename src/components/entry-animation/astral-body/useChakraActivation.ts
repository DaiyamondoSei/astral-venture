
import { useState, useEffect } from 'react';
import { ChakraActivation } from './ChakraPoints';

export const useChakraActivation = (
  userDream: string | null,
  dominantTheme: string | null
): [ChakraActivation, number] => {
  // Create chakra activation state
  const [chakras, setChakras] = useState<ChakraActivation>({ 
    root: false, 
    sacral: false, 
    solar: false, 
    heart: false, 
    throat: false, 
    third: false,
    crown: false 
  });
  
  useEffect(() => {
    let activations: ChakraActivation = { 
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
    
    setChakras(activations);
  }, [userDream, dominantTheme]);
  
  // Calculate a glow intensity based on the number of activated chakras
  const activatedCount = Object.values(chakras).filter(Boolean).length;
  const glowIntensity = Math.min(0.4 + (activatedCount * 0.1), 0.9); // Scale from 0.5 to 0.9
  
  return [chakras, activatedCount];
};
