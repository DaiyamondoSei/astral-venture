
import { useState, useEffect } from 'react';
import { getChakraResonance } from '@/utils/emotion/chakra/intensity';

interface ResonanceLine {
  start: number;
  end: number;
  intensity: number;
}

const useResonanceLines = (
  activatedChakras: number[], 
  getChakraIntensity: (chakraIndex: number) => number
): ResonanceLine[] => {
  const [resonanceLines, setResonanceLines] = useState<ResonanceLine[]>([]);
  
  // Update resonance lines with organic motion
  useEffect(() => {
    const updateResonance = () => {
      if (activatedChakras.length <= 1) {
        setResonanceLines([]);
        return;
      }
      
      // Create lines between activated chakras
      const newLines = [];
      
      for (let i = 0; i < activatedChakras.length; i++) {
        for (let j = i + 1; j < activatedChakras.length; j++) {
          const chakra1 = activatedChakras[i];
          const chakra2 = activatedChakras[j];
          const resonance = getChakraResonance(chakra1, chakra2, activatedChakras);
          
          // Add subtle variation to resonance for organic movement
          const timeVariation = Math.sin(Date.now() / 5000 + (chakra1 * chakra2)) * 0.1;
          const adjustedResonance = Math.max(0, Math.min(1, resonance + timeVariation));
          
          // Only show lines with significant resonance
          if (adjustedResonance > 0.3) {
            newLines.push({
              start: chakra1,
              end: chakra2,
              intensity: adjustedResonance
            });
          }
        }
      }
      
      setResonanceLines(newLines);
    };
    
    // Update initially
    updateResonance();
    
    // Set interval for fluid updates - more frequent for smoother animation
    const interval = setInterval(updateResonance, 100);
    return () => clearInterval(interval);
  }, [activatedChakras, getChakraIntensity]);
  
  return resonanceLines;
};

export default useResonanceLines;
